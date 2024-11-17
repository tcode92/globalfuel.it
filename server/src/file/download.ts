import { FastifyReply, FastifyRequest } from "fastify";
import { createReadStream } from "node:fs";
import path from "node:path";
import { zipFiles } from "../../lib/zip";
import { db } from "../../database/db";

type FileDownloadReq = FastifyRequest<{
  Querystring: {
    file: string | string[];
  };
}>;
export async function downloadFileHandler(
  req: FileDownloadReq,
  replay: FastifyReply
) {
  const filesArr = parseQueryFiles(req.query.file);
  const files = await db.file.get(
    filesArr.ids,
    filesArr.srcs,
    req.auth.role === "admin" ? undefined : req.auth.id
  );
  if (files.length === 0) {
    return replay.err("Nessun file trovato.", 404);
  }
  if (files.length === 1) {
    const file = files[0];
    const fileStream = createReadStream(path.join(process.cwd(), file.src));
    replay.header(
      "content-disposition",
      `attachment; filename=${validFileName(file.name)}${file.ext}`
    );
    return replay.send(fileStream).type(file.mime).code(200);
  }
  // TODO: CHANGE ZIP NAME
  const zipStream = zipFiles(files);
  replay.header(
    "content-disposition",
    `attachment; filename=${validFileName("archivio file")}.zip`
  );
  replay.type("application/zip");
  replay.status(200);
  return zipStream;
}
function parseQueryFiles(files: string | string[]): {
  ids: number[];
  srcs: string[];
} {
  if (typeof files === "string") files = [files];
  let srcs: string[] = [];
  let ids: number[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    let n = parseInt(file);
    if (!isNaN(n) && n > 0) {
      ids.push(n);
    } else {
      srcs.push(file);
    }
  }
  return { ids, srcs };
}
function validFileName(name: string): string {
  let str = name.replace(/[^A-Za-z\d_\-\s]/g, "-").replace(/-+/g, "-");
  str = str
    .split(" ")
    .filter((part) => (part === "" ? false : true))
    .join(" ");
  return str.trim();
}
