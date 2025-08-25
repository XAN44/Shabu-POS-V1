"use server";

import * as z from "zod";
import { registerSchema } from "../schema/LoginSchema";
import db from "../lib/prismaClient";
import bcrypt from "bcrypt";

export const register_action = async (
  value: z.infer<typeof registerSchema>
) => {
  const validateField = registerSchema.safeParse(value);

  if (!validateField.success) {
    return { error: "ข้อมูลไม่ถูกต้อง" };
  }

  const { email, password } = await validateField.data;

  const hasPw = await bcrypt.hash(password, 10);
  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return { error: "อีเมลนี้ถูกใช้งานแล้ว" };
  }

  await db.user.create({
    data: {
      email,
      password: hasPw,
      role: "Owner",
    },
  });

  return { success: "สมัครสมาชิกสำเร็จ" };
};
