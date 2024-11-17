import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { db } from "../../database/db";
type ClientReq = FastifyRequest<{
  Querystring: { id: string };
}>;
export async function renameFileHandler(req: ClientReq, replay: FastifyReply) {
  const { id } = await FileUpdateParams.parseAsync(req.params);
  const { name } = await FileRenameSchema.parseAsync(req.body);
  const updatedFile = await db.file.rename(id, validFileName(name));
  return replay.send(updatedFile);
}

const FileRenameSchema = z.object({
  name: z.string().transform((arg) => {
    // replace all with -
    return arg;
  }),
});
const FileUpdateParams = z.object({
  id: z.string().transform((arg, ctx) => {
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
