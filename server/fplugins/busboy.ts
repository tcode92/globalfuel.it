import busboy from "busboy";
import { randomUUID } from "crypto";
import { FastifyRequest } from "fastify";
import fs, { WriteStream, createWriteStream } from "fs";
import os from "os";
import path from "path";
import { ServerFile } from "../lib/File";
import { KnownError } from "../utils/error";
import { FILETYPE, FileType } from "@constants";

type Options = {
  acceptType?: string[];
  denyType?: string[];
  invalidTypes?: "throw" | "ignore" | "append";
  parseBody?: boolean;
  throwOnBodyParse?: boolean;
  maxFileSize?: number;
  tempPath?: string;
  tempPrefix?: string;
  tempDateTimeSub?: boolean;
};
const defaultOptions: Options = {
  parseBody: true,
  tempPath: "/files/temp",
  tempDateTimeSub: true,
};

export function uploadParser(
  req: FastifyRequest,
  UploadOptions: Options
): Promise<KnownError | unknown> {
  return new Promise<KnownError | unknown>((r) => {
    // init req.files as empty array to prevent errors for next handlers.
    req.files = [];
    let metadata = new Map<string, { name: string; type?: FileType }>();
    let temp: {
      path: string;
      stream: WriteStream;
    }[] = [];
    // apply user config with default config
    const options = Object.assign({}, defaultOptions, UploadOptions || {});
    // skip and pass to next handler if request method are invalid.
    if (
      req.method !== "POST" &&
      req.method !== "PUT" &&
      req.method !== "PATCH"
    ) {
      r(new KnownError("Method Not Allowed", "error", 405));
    }
    // check if headers are valid for busboy to process

    const bb = busboy({ headers: req.headers });
    try {
      // we will add all data to this array to resolve after all data processed.
      const promiseArray: Array<Promise<any>> = [];

      // handle incoming files

      bb.on("file", async (fieldName, incomingFile, info) => {
        const { filename, mimeType } = info;
        if (
          options.acceptType &&
          !options.acceptType.includes(mimeType.toLocaleLowerCase())
        ) {
          incomingFile.resume();
          req.log.warn(`File ${filename} not allowed`);
          incomingFile.emit("close");
          incomingFile.emit("end");
        } else {
          const ext = path.extname(filename);
          const newName = randomUUID();
          let filePath = options.tempPath
            ? path.resolve(process.cwd() + `/${options.tempPath}/`)
            : os.tmpdir();
          if (options.tempDateTimeSub) {
            const newPath = path.join(filePath, ServerFile.uploadedAt);
            try {
              await fs.promises.mkdir(newPath, {
                recursive: true,
              });
              filePath = newPath;
            } catch (e) {
              req.log.error(`Unable to create dir: ${newPath}`);
            }
          }
          const fileName = options.tempPrefix
            ? `${options.tempPrefix}${newName}${ext}`
            : `${newName}${ext}`;
          const tempPath = path.join(filePath + "/" + fileName);
          promiseArray.push(
            new Promise<void>((resolve) => {
              // write incoming data temp
              const wStream = createWriteStream(tempPath);
              incomingFile.pipe(wStream);
              temp.push({
                stream: wStream,
                path: tempPath,
              });
              // delete all files in the request if aborted and resolve ???

              // wait until file flushed to disk then resolve
              wStream.on("finish", async () => {
                try {
                  const file = new ServerFile({
                    path: tempPath,
                    mime: mimeType,
                    name: filename,
                    serverName: fileName,
                    ext: ext,
                    fieldName: fieldName,
                    type: undefined,
                  });
                  req.files.push(file);
                  resolve();
                } catch (e) {
                  incomingFile.resume();
                  req.log.warn(`File not allowed`);
                  incomingFile.emit("close");
                  incomingFile.emit("end");
                  await tryClearFiles(req, temp);
                  if (typeof e === "string") r(new KnownError(e));
                  r(new KnownError("Errore interno."));
                }
              });
            })
          );
        }
      });
      // if parseBody option is true perse the body as json
      if (options.parseBody) {
        bb.on("field", async (name, val) => {
          if (val) {
            if (name === "data") {
              promiseArray.push(
                new Promise<void>((resolve) => {
                  let data = {};
                  try {
                    data = JSON.parse(val);
                    req.body = { ...(req.body as object), ...data };
                    resolve();
                  } catch (e) {
                    resolve();
                  }
                })
              );
            }
            if (name.startsWith("metadata")) {
              promiseArray.push(
                new Promise<void>((resolve) => {
                  let v;
                  try {
                    v = JSON.parse(val) as {
                      name: string;
                      type?: FileType;
                    };
                    metadata.set(name.replace("metadata-", ""), {
                      name: v.name,
                      type: v.type as FileType,
                    });
                    resolve();
                  } catch (e) {
                    resolve();
                  }
                })
              );
            }
          }
        });
      }
      bb.on("close", async () => {
        await Promise.all(promiseArray);
        // append metadata to files
        for (const file of req.files) {
          if (file.fieldName) {
            const m = metadata.get(file.fieldName);
            if (m) {
              file.name = m.name;
              if (
                m.type !== undefined &&
                FILETYPE.includes(m.type as FileType)
              ) {
                file.type = m.type;
              }
            }
          }
        }
        metadata.clear();
        r(req.body);
      });
      req.raw.on("aborted", async () => {
        for (const file of temp) {
          try {
            file.stream.close();
            await fs.promises.unlink(file.path);
          } catch (e) {
            req.log.error(`Error deleting temporary file: ${e}`);
          }
        }
      });
      req.raw.pipe(bb);
    } catch (e) {
      req.log.error(e);
      r(new KnownError("Errore durante il caricamento."));
    }
  });
}

async function tryClearFiles(
  req: FastifyRequest,
  temp: {
    path: string;
    stream: WriteStream;
  }[]
) {
  try {
    for (const file of req.files) {
      let result = await file.delete();
      if (result) {
        req.log.info(`Deleted file ${file.path} from the request.`);
      } else {
        req.log.warn(`Unable to deleted file ${file.path} from the request.`);
      }
    }
    for (const s of temp) {
      let relative = path.relative(process.cwd(), s.path);
      try {
        if (!s.stream.closed) {
          s.stream.close(async () => {
            await deleteFileRelative(req, relative);
          });
        } else {
          await deleteFileRelative(req, relative);
        }
      } catch (e) {}
    }
  } catch (e) {
    return true;
  }
  return true;
}
async function deleteFileRelative(req: FastifyRequest, src: string) {
  try {
    await fs.promises.unlink(src);
    req.log.info(`Deleted file ${src} from the request.`);
  } catch (e) {
    req.log.warn(`Unable to deleted file ${src} from the request.`);
  }
}

// add files to the request object
declare module "fastify" {
  interface FastifyRequest {
    files: ServerFile[];
  }
}
