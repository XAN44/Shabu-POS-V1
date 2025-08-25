import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "รูปแบบ email ไม่ถูกต้อง" }),
  password: z.string().min(4, {
    message: "รหัสผ่านต้องมากกว่า 3 ตัว",
  }),
});

export const registerSchema = z.object({
  email: z.string().email({ message: "รูปแบบ email ไม่ถูกต้อง" }),
  password: z.string().min(4, {
    message: "รหัสผ่านต้องมากกว่า 3 ตัว",
  }),
});
