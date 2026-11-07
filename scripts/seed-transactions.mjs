import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("TURSO_DATABASE_URL tidak ditemukan di .env.local");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function seedTransactions() {
  console.log("Memulai proses seeding transactions ke Turso...\n");

  try {
    // 1. Ambil user utama
    const userRes = await client.execute(
      "SELECT id, display_name, email FROM profiles LIMIT 1"
    );
    if (userRes.rows.length === 0) {
      console.error("❌ Tidak ada user di tabel profiles. Jalankan seed-user.mjs terlebih dahulu.");
      process.exit(1);
    }
    const user = userRes.rows[0];
    console.log(`Target User: ${user.display_name} (${user.id})`);

    // 2. Cek apakah sudah ada transaksi agar tidak ter-seed ganda tanpa sengaja
    const existingTxRes = await client.execute({
      sql: "SELECT COUNT(*) as total FROM transactions WHERE user_id = ?",
      args: [user.id],
    });
    const existingCount = Number(existingTxRes.rows[0]?.total ?? 0);
    if (existingCount > 0 && !process.argv.includes("--force")) {
      console.log(
        `⚠️ Sudah ada ${existingCount} data di tabel transactions untuk user ini. Gunakan flag --force jika tetap ingin menambahkan.`
      );
      return;
    }

    // 3. Ambil seluruh pockets milik user
    const pocketsRes = await client.execute({
      sql: "SELECT id, name, balance FROM pockets WHERE user_id = ?",
      args: [user.id],
    });
    if (pocketsRes.rows.length === 0) {
      console.error("❌ Belum ada pocket untuk user ini. Jalankan seed-pockets.mjs terlebih dahulu.");
      process.exit(1);
    }

    const pocketMap = new Map();
    const balanceTracker = new Map();
    for (const p of pocketsRes.rows) {
      const key = String(p.name).toLowerCase();
      pocketMap.set(key, p);
      balanceTracker.set(String(p.id), Number(p.balance || 0));
    }

    const findPocket = (keyword, fallback = pocketsRes.rows[0]) => {
      const exact = pocketMap.get(keyword.toLowerCase());
      if (exact) return exact;
      for (const [name, p] of pocketMap.entries()) {
        if (name.includes(keyword.toLowerCase())) return p;
      }
      return fallback;
    };

    const bcaPocket = findPocket("bca");
    const spayPocket = findPocket("spay");
    const mandiriPocket = findPocket("mandiri");
    const cashPocket = findPocket("cash", null);

    // 4. Ambil seluruh categories di database
    const categoriesRes = await client.execute(
      "SELECT id, name, type FROM categories"
    );
    const categoryMap = new Map();
    for (const c of categoriesRes.rows) {
      categoryMap.set(String(c.name).toLowerCase(), c);
    }

    // 5. Susun 8 transaksi (1 untuk masing-masing kategori)
    const seedPlan = [
      {
        categoryName: "salary",
        pocket: bcaPocket,
        relatedPocket: null,
        amount: 6500000,
        transactionDate: "2026-11-01",
        note: "Gaji bulanan November",
      },
      {
        categoryName: "transfer",
        pocket: spayPocket,
        relatedPocket: bcaPocket,
        amount: 500000,
        transactionDate: "2026-11-02",
        note: "Top up ShopeePay dari BCA",
      },
      {
        categoryName: "withdrawal",
        pocket: bcaPocket,
        relatedPocket: cashPocket,
        amount: 400000,
        transactionDate: "2026-11-02",
        note: cashPocket
          ? "Tarik tunai ATM BCA ke dompet cash"
          : "Tarik tunai ATM BCA",
      },
      {
        categoryName: "bills",
        pocket: bcaPocket,
        relatedPocket: null,
        amount: 350000,
        transactionDate: "2026-11-03",
        note: "Tagihan WiFi & listrik bulanan",
      },
      {
        categoryName: "groceries",
        pocket: spayPocket,
        relatedPocket: null,
        amount: 125000,
        transactionDate: "2026-11-04",
        note: "Belanja kebutuhan dapur mingguan",
      },
      {
        categoryName: "maintenance",
        pocket: bcaPocket,
        relatedPocket: null,
        amount: 150000,
        transactionDate: "2026-11-05",
        note: "Ganti oli & servis motor",
      },
      {
        categoryName: "beverages",
        pocket: cashPocket ?? mandiriPocket,
        relatedPocket: null,
        amount: 28000,
        transactionDate: "2026-11-06",
        note: "Kopi susu gula aren",
      },
      {
        categoryName: "entertainment",
        pocket: spayPocket,
        relatedPocket: null,
        amount: 65000,
        transactionDate: "2026-11-07",
        note: "Langganan streaming bulanan",
      },
    ];

    const batchStatements = [];

    for (const item of seedPlan) {
      const category = categoryMap.get(item.categoryName);
      if (!category) {
        throw new Error(`Kategori "${item.categoryName}" tidak ditemukan di tabel categories!`);
      }

      const txId = crypto.randomUUID();
      const pocketId = String(item.pocket.id);
      const relatedPocketId = item.relatedPocket ? String(item.relatedPocket.id) : null;

      batchStatements.push({
        sql: `
          INSERT INTO transactions (
            id, user_id, pocket_id, related_pocket_id, category_id, amount, transaction_date, note
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          txId,
          user.id,
          pocketId,
          relatedPocketId,
          category.id,
          item.amount,
          item.transactionDate,
          item.note,
        ],
      });

      // Hitung efek mutasi saldo berdasarkan tipe kategori & related_pocket_id
      if (category.type === "income") {
        balanceTracker.set(pocketId, balanceTracker.get(pocketId) + item.amount);
        if (relatedPocketId) {
          // Uang masuk ke pocket tujuan berasal dari related_pocket (transfer internal)
          balanceTracker.set(
            relatedPocketId,
            balanceTracker.get(relatedPocketId) - item.amount
          );
        }
      } else {
        balanceTracker.set(pocketId, balanceTracker.get(pocketId) - item.amount);
        if (relatedPocketId) {
          // Uang keluar dari pocket sumber masuk ke related_pocket (tarik tunai ke cash)
          balanceTracker.set(
            relatedPocketId,
            balanceTracker.get(relatedPocketId) + item.amount
          );
        }
      }
    }

    // 6. Tambahkan statement UPDATE balance untuk setiap pocket yang saldonya berubah
    for (const [pocketId, newBalance] of balanceTracker.entries()) {
      batchStatements.push({
        sql: "UPDATE pockets SET balance = ? WHERE id = ?",
        args: [newBalance, pocketId],
      });
    }

    // 7. Eksekusi seluruh INSERT + UPDATE secara atomik dalam 1 transaksi DB
    await client.batch(batchStatements, "write");

    console.log("\n✅ Berhasil memasukkan 8 transaksi dan menyinkronkan saldo pockets!\n");

    // 8. Tampilkan hasil transaksi & saldo pockets terbaru
    const seededTx = await client.execute({
      sql: `
        SELECT
          t.transaction_date AS date,
          c.type AS type,
          c.name AS category,
          p.name AS pocket,
          rp.name AS related_pocket,
          t.amount AS amount,
          t.note AS note
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        JOIN pockets p ON t.pocket_id = p.id
        LEFT JOIN pockets rp ON t.related_pocket_id = rp.id
        WHERE t.user_id = ?
        ORDER BY t.transaction_date ASC
      `,
      args: [user.id],
    });

    console.log("Daftar Transactions di Turso:");
    console.table(seededTx.rows);

    const updatedPockets = await client.execute({
      sql: "SELECT name, balance FROM pockets WHERE user_id = ? ORDER BY created_at ASC",
      args: [user.id],
    });

    console.log("Saldo Pockets Terbaru:");
    console.table(updatedPockets.rows);
  } catch (err) {
    console.error("❌ Terjadi error saat seeding transactions:", err);
    process.exit(1);
  }
}

seedTransactions();
