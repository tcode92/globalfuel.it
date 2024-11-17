import { hash, compare } from "bcrypt";
export async function verifyPassword(
  hash: string,
  plainText: string
): Promise<boolean> {
  try {
    const check = await compare(plainText, hash);
    return check;
  } catch (error) {
    console.error(error);
    return false;
  }
}
export async function hashPassword(password: string): Promise<string> {
  const hashString = await hash(password, 10);
  return hashString;
}
