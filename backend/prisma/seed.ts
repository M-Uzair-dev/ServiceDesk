import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
const connectionString = process.env.DATABASE_URL;

const pool: any = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.admin.findUnique({
    where: { email: "admin@example.com" },
  });

  if (existing) {
    console.log("Seed already ran — admin@example.com exists, skipping.");
    return;
  }

  const admin = await prisma.admin.create({
    data: {
      name: "Super Admin",
      email: "admin@example.com",
      password: await bcrypt.hash("admin123", 10),
      phoneNumber: "+1234567890",
    },
  });

  console.log(`Admin created: ${admin.email} / password: admin123`);
  console.log("Change this password immediately after first login.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
