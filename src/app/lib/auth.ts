import { auth } from "@/src/auth";
export const currentUser = async () => {
  const session = await auth();
  return session?.user;
};
