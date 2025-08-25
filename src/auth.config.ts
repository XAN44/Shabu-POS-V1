export const runtime = "nodejs";
import { NextAuthConfig } from "next-auth";
import { loginSchema } from "./app/schema/LoginSchema";
import db from "./app/lib/prismaClient";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials) return null;

        const validateField = loginSchema.safeParse(credentials);

        if (validateField.success) {
          const { email, password } = validateField.data;

          const user = await db.user.findUnique({
            where: {
              email,
            },
            select: {
              id: true,
              email: true,
              password: true,
              role: true,
            },
          });

          if (!user || !user.password) return null;

          const isPasswordMatch = await bcrypt.compare(password, user.password);

          if (isPasswordMatch) return user;
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
