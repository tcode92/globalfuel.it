import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { db } from "../../database/db";
import { FILETYPE, FileType } from "@constants";
import { models } from "database/models/types";

export async function uploadFileHandler(
  req: FastifyRequest,
  replay: FastifyReply
) {
  const { clientId } = await FileUploadParams.parseAsync(req.params);
  const files: models.file.CreateFileInput[] = [];
  for (const file of req.files) {
    if (FILETYPE.includes(file.type as FileType)) {
      await file.move(`/files/upload/${clientId}/${file.serverName}`);
      files.push({
        clientId,
        ext: file.ext,
        mime: file.mime,
        name: file.name,
        src: file.path,
        type: file.type as FileType,
      });
    } else {
      await file.delete();
    }
  }
  if (files.length > 0) {
    const newFiles = await db.file.createMany(files);
    return replay.send(newFiles);
  } else {
    return replay.err("Nessun file valido nella richiesta.", 400);
  }
}

const FileUploadParams = z.object({
  clientId: z.string().transform((arg, ctx) => {
    const n = parseInt(arg);
    if (isNaN(n) || n <= 0) {
      ctx.addIssue({
        code: "invalid_type",
        expected: "number",
        received: typeof arg,
      });
      return z.NEVER;
    }
    return n;
  }),
});
