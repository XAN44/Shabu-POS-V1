import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "./app/schema/LoginSchema";
import bcrypt from "bcryptjs";
import db from "./app/lib/prismaClient";

export default {
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials) return null;

        const validateField = loginSchema.safeParse(credentials);
        if (!validateField.success) return null;

        const { email, password } = validateField.data;
        const user = await db.user.findUnique({
          where: { email },
          select: { id: true, email: true, password: true, role: true },
        });

        if (!user?.password) return null;
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        return isPasswordMatch ? user : null;
      },
    }),
  ],
} satisfies NextAuthConfig;
