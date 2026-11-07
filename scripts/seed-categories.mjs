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
    description: "Gaji bulanan atau upah kerja",
  },
  {
    name: "transfer",
    type: "income",
    description: "Transfer uang masuk dari akun lain",
  },
  // Expense
  {
    name: "beverages",
    type: "expense",
    description: "Minuman, kopi, jajanan ringan",
  },
  {
    name: "groceries",
    type: "expense",
    description: "Belanja bahan makanan, kebutuhan dapur",
  },
  {
    name: "maintenance",
    type: "expense",
    description: "Servis kendaraan, perawatan rumah",
  },
  {
    name: "bills",
    type: "expense",
    description: "Tagihan rutin (listrik, air, internet, sewa kos)",
  },
  {
    name: "entertainment",
    type: "expense",
    description: "Hiburan, nonton, game, rekreasi",
  },
  {
    name: "withdrawal",
    type: "expense",
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
          INSERT INTO categories (id, name, type, description)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(name) DO UPDATE SET
            type = excluded.type,
            description = excluded.description
        `,
        args: [id, cat.name, cat.type, cat.description],
      });
      console.log(`- [${cat.type.toUpperCase()}] ${cat.name}`);
    }

    console.log("\n✅ Semua kategori berhasil dimasukkan ke Turso!");

    const result = await client.execute("SELECT id, name, type FROM categories");
    console.log("\nTotal data categories di Turso saat ini:", result.rows.length);
  } catch (err) {
    console.error("Terjadi error saat seeding kategori:", err);
  }
}

seedCategories();
