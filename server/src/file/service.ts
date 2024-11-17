import { unlink } from "fs/promises";
import { db } from "../../database/db";
import path from "path";

export const fileDeleteService = async (fileId: number) => {
  const src = await db.file.del(fileId);
  if (!src) {
    // file was already deleted we dont throw just return a success
    // the file is missing anyway right?
    return "OK" as const;
  }
  try {
    await unlink(path.join(process.cwd(), src));
  } catch (e) {
    // TODO: log error
  }
  return "OK" as const;
};
export const fileRenameService = async (fileId: number, name: string) => {
  const updatedFile = await db.file.rename(fileId, validFileName(name));
  return updatedFile;
};
export const fileDownloadService = () => {};
export const fileUploadService = () => {};

function validFileName(name: string): string {
  let str = name.replace(/[^A-Za-z\d_\-\s]/g, "-").replace(/-+/g, "-");
  str = str
    .split(" ")
    .filter((part) => (part === "" ? false : true))
    .join(" ");
  return str.trim();
}
