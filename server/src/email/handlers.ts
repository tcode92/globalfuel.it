import { FastifyReply, FastifyRequest } from "fastify";
import { mailGetService, trackService } from "./service";
import { handleError, KnownError } from "../../utils/error";
import { MailSearchSchema } from "@validation/mail";

/* const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wIAAgEB/wAAAAMAAAABAAEAAAA=",
  "base64"
); */
const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
  "base64"
);

export const mailGetHandler = async (req: FastifyRequest, res: FastifyReply) => {
  if (req.auth.role !== "admin") {
    return handleError(res, new KnownError("Accesso non consentito.", "error", 401))
  }
  const search = await MailSearchSchema.parseAsync(req.query)
  const data = await mailGetService(search);
  return data;
};

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
    .header("content-type", "image/gif")
    .header(
      "cache-control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    )
    .header("expires", "0")
    .header("pragma", "no-cache")
    .send(TRANSPARENT_GIF);
};
