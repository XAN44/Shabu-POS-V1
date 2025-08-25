"use server";

import * as z from "zod";
import { loginSchema } from "../schema/LoginSchema";
import { signIn } from "@/src/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/route";
import { AuthError } from "next-auth";

export const login_action = async (value: z.infer<typeof loginSchema>) => {
  const validatedField = loginSchema.safeParse(value);

  if (!validatedField.success) {
    return { error: "กรอกข้อมูลให้ครบ!" };
  }

  const { email, password } = validatedField.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
    return { success: "เข้าสู่ระบบสำเร็จ!" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "กรอกข้อมูลไม่ถูกต้อง!" };
        default:
          return { error: "เกิดข้อผิดพลาดบางอย่าง" };
      }
    }
    throw error;
  }
};
