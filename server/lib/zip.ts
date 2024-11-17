import archiver from "archiver";
import { FastifyReply } from "fastify";
import fs from "fs";
import { Transform } from "node:stream";
import path from "path";
export function zipFiles(
  files: {
    name: string;
    ext: string;
    src: string;
  }[],
  response?: FastifyReply
) {
  const zip = archiver("zip");
  // good practice to catch warnings (ie stat failures and other non-blocking errors)
  zip.on("warning", function (err) {
    if (err.code === "ENOENT") {
      // log warning
    } else {
      // throw error
      throw err;
    }
  });

  // good practice to catch this error explicitly
  zip.on("error", function (err) {
    throw err;
  });
  //zip.on("finish", async () => {});
  const transformer = new Transform({
    transform(chunk, encoding, callback) {
      this.push(chunk);
      callback();
    },
  });

  for (const file of files) {
    zip.append(fs.createReadStream(path.join(process.cwd(), file.src)), {
      name: `${validFileName(file.name)}${file.ext}`,
    });
  }
  zip.pipe(transformer);
  zip.finalize();
  return transformer;
}
function validFileName(name: string): string {
  let str = name.replace(/[^A-Za-z\d_\-\s]/g, "-").replace(/-+/g, "-");
  str = str
    .split(" ")
    .filter((part) => (part === "" ? false : true))
    .join(" ");
  return str.trim();
}
