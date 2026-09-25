export const isDuplicateError = (err: unknown): boolean => {
  if (err instanceof Error && "sqlState" in err && err.sqlState === "23505") {
    return true;
  }
  return false;
};
