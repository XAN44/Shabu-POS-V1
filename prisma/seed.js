// prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
const db = new PrismaClient();

async function main() {
  // อ่านค่าจาก environment
  const email = process.env.INITIAL_OWNER_EMAIL;
  const rawPassword = process.env.INITIAL_OWNER_PASSWORD;

  if (!email || !rawPassword) {
    throw new Error(
      "Missing INITIAL_OWNER_EMAIL or INITIAL_OWNER_PASSWORD in your .env"
    );
  }

  // ตรวจว่า owner บัญชีนี้มีอยู่แล้วหรือไม่
  const existing = await db.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`🔸 Owner (${email}) already exists. Skipping creation.`);
    return;
  }

  // แปลงรหัสผ่านด้วย bcrypt
  const hashed = await hash(rawPassword, 12);

  // สร้างบัญชี Owner
  await db.user.create({
    data: {
      email,
      password: hashed,
      role: "owner",
    },
  });

  console.log("---------------------------------------");
  console.log(`✅ Created initial owner: ${email}`);
  console.log("---------------------------------------");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
