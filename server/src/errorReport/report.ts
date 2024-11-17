import { FastifyReply, FastifyRequest } from "fastify";

export async function errorReportHandler(
  req: FastifyRequest,
  replay: FastifyReply
) {
  req.log.error(req.body);

  req.log.error(
    {
      error: req.body,
      maybeuser: req.cookies,
      headers: req.headers,
    },
    "CLIENT SIDE ERROR"
  );
  replay.send("OK");
}
