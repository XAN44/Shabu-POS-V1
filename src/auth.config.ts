import { NextAuthConfig } from "next-auth";
import { loginSchema } from "./app/schema/LoginSchema";
import { comparePassword } from "./utils/password";
import db from "./app/lib/prismaClient";
import Credentials from "next-auth/providers/credentials";

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

          const matchPw = await comparePassword({
            plainPassword: password,
            hashedPassword: user.password,
          });

          if (matchPw) return user;
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
