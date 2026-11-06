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

const pocketsToSeed = [
  { name: "bca", balance: 0 },
  { name: "bni", balance: 0 },
  { name: "spay", balance: 0 },
];

async function seedPockets() {
  console.log("Memulai proses seeding pockets ke Turso...\n");

  try {
    // 1. Ambil user dari tabel profiles
    const userResult = await client.execute(
      "SELECT id, display_name, email FROM profiles LIMIT 1"
    );

    if (userResult.rows.length === 0) {
      console.error("❌ Tidak ada user di tabel profiles. Jalankan seed-user.mjs terlebih dahulu.");
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log(`Target User: ${user.display_name} (${user.id})\n`);

    // 2. Cek pockets yang sudah ada milik user ini
    const existingResult = await client.execute({
      sql: "SELECT id, name, balance FROM pockets WHERE user_id = ?",
      args: [user.id],
    });
    const existingNames = new Set(
      existingResult.rows.map((r) => String(r.name).toLowerCase())
    );

    // 3. Insert pockets baru (bca, bni, spay) jika belum ada
    for (const pocket of pocketsToSeed) {
      if (existingNames.has(pocket.name)) {
        console.log(`- [SKIP] Pocket "${pocket.name}" sudah ada.`);
        continue;
      }

      const id = crypto.randomUUID();
      await client.execute({
        sql: "INSERT INTO pockets (id, user_id, name, balance) VALUES (?, ?, ?, ?)",
        args: [id, user.id, pocket.name, pocket.balance],
      });
      console.log(`- [ADDED] Pocket "${pocket.name}" berhasil ditambahkan (balance: ${pocket.balance})`);
    }

    // 4. Tampilkan seluruh data pockets saat ini
    const allPockets = await client.execute({
      sql: "SELECT id, name, balance, created_at FROM pockets WHERE user_id = ?",
      args: [user.id],
    });

    console.log("\n✅ Selesai! Daftar pockets di Turso saat ini:");
    console.table(allPockets.rows);
  } catch (err) {
    console.error("Terjadi error saat seeding pockets:", err);
  }
}

seedPockets();

