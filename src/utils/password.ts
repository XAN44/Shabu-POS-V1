import bcrypt from "bcryptjs";

type Pw = {
  password: string;
};

export const saltAndHashPassword = async ({ password }: Pw) => {
  const pwHash = await bcrypt.hash(password, 10);
  return pwHash;
};

type ComparePw = {
  plainPassword: string;
  hashedPassword: string;
};

export const comparePassword = async ({
  plainPassword,
  hashedPassword,
}: ComparePw) => {
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  return isMatch;
};
