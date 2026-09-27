import { PRISMA } from "@repo/db";

export const isDuplicateError = (err: unknown): boolean => {
  if (
    err instanceof PRISMA.PrismaClientKnownRequestError &&
    err.code === "P2002"
  ) {
    return true;
  }
  return false;
};
