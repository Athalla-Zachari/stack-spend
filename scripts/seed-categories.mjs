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

const categoriesToSeed = [
  // Income
  {
    name: "salary",
    type: "income",
    group_name: "Income",
    description: "Gaji bulanan atau upah kerja",
  },
  {
    name: "transfer",
    type: "income",
    group_name: "Income",
    description: "Transfer uang masuk dari akun lain",
  },
  // Expense
  {
    name: "beverages",
    type: "expense",
    group_name: "Food & Drinks",
    description: "Minuman, kopi, jajanan ringan",
  },
  {
    name: "groceries",
    type: "expense",
    group_name: "Daily Needs",
    description: "Belanja bahan makanan, kebutuhan dapur",
  },
  {
    name: "maintenance",
    type: "expense",
    group_name: "Maintenance",
    description: "Servis kendaraan, perawatan rumah",
  },
  {
    name: "bills",
    type: "expense",
    group_name: "Bills",
    description: "Tagihan rutin (listrik, air, internet, sewa kos)",
  },
  {
    name: "entertainment",
    type: "expense",
    group_name: "Lifestyle",
    description: "Hiburan, nonton, game, rekreasi",
  },
  {
    name: "withdrawal",
    type: "expense",
    group_name: "Cash",
    description: "Tarik tunai dari ATM",
  },
];

async function seedCategories() {
  console.log("Memulai proses seeding kategori ke Turso...\n");

  try {
    for (const cat of categoriesToSeed) {
      const id = crypto.randomUUID();
      await client.execute({
        sql: `
          INSERT INTO categories (id, name, type, group_name, description)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(name) DO UPDATE SET
            type = excluded.type,
            group_name = excluded.group_name,
            description = excluded.description
        `,
        args: [id, cat.name, cat.type, cat.group_name, cat.description],
      });
      console.log(`- [${cat.type.toUpperCase()}] ${cat.name} (${cat.group_name})`);
    }

    console.log("\n✅ Semua kategori berhasil dimasukkan ke Turso!");

    const result = await client.execute("SELECT id, name, type, group_name FROM categories");
    console.log("\nTotal data categories di Turso saat ini:", result.rows.length);
  } catch (err) {
    console.error("Terjadi error saat seeding kategori:", err);
  }
}

seedCategories();

