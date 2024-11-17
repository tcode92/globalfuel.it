import { FastifyReply, FastifyRequest } from "fastify";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { db } from "../../database/db";
export async function deleteFileHandler(
  req: FastifyRequest,
  replay: FastifyReply
) {
  const { fileId } = await FileDeleteParams.parseAsync(req.params);
  const src = await db.file.del(fileId);
  if (!src) {
    // file was already deleted we dont throw just return a success
    // the file is missing anyway right?
    return replay.send("OK").code(200);
  }
  try {
    await unlink(path.join(process.cwd(), src));
  } catch (e) {
    req.log.error(e);
  }
  return replay.send("OK").code(200);
}

const FileDeleteParams = z.object({
  fileId: z.string().transform((arg, ctx) => {
    const n = parseInt(arg);
    if (isNaN(n) || n <= 0) {
      ctx.addIssue({
        code: "invalid_type",
        expected: "number",
        received: typeof arg,
        path: ["id"],
      });
      return z.NEVER;
    }
    return n;
  }),
});
function validFileName(name: string): string {
  let str = name.replace(/[^A-Za-z\d_\-\s]/g, "-").replace(/-+/g, "-");
  str = str
    .split(" ")
    .filter((part) => (part === "" ? false : true))
    .join(" ");
  return str.trim();
}
