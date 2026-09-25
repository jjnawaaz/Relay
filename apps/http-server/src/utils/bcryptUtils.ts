import bcrypt from "bcrypt";

export const createHash = async (password: string): Promise<string> => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};

export const verifyHash = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  const isVerified = await bcrypt.compare(password, hashedPassword);
  return isVerified;
};
