import { FastifyReply, FastifyRequest } from "fastify";

export async function errorReportHandler(
  req: FastifyRequest,
  replay: FastifyReply
) {
  req.log.error(req.body);
  // TODO: Save errors somewhere.
  /* .error({
    error: req.body,
    maybeuser: req.cookies,
    headers: req.headers,
  }); */
  replay.send("OK");
}
