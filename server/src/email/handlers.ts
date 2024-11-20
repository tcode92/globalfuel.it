import { FastifyReply, FastifyRequest } from "fastify";
import { mailGetService, trackService } from "./service";
import { handleError, KnownError } from "../../utils/error";
import { MailSearchSchema } from "@validation/mail";
import fs from "fs";

export const mailGetHandler = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  if (req.auth.role !== "admin") {
    return handleError(
      res,
      new KnownError("Accesso non consentito.", "error", 401)
    );
  }
  const search = await MailSearchSchema.parseAsync(req.query);
  const data = await mailGetService(search);
  return data;
};
let pngFile: Buffer;
export const trackEmailOpenHandler = async (
  req: FastifyRequest<{
    Params: {
      trackId: string;
    };
  }>,
  res: FastifyReply
) => {
  trackService(req.params.trackId);
  res
    .header("content-type", "image/png")
    .header(
      "cache-control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    )
    .header("expires", "0")
    .header("pragma", "no-cache");
  if (!pngFile) {
    pngFile = await fs.promises.readFile("./public/logo.png");
  }
  res.send(pngFile);
};
