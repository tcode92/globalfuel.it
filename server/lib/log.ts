import pino, { Logger } from "pino";
import pp from "pino-pretty";

const pretty = pp({
  colorize: true,
  ignore: "pid,hostname",
  levelKey: "level",
  levelLabel: "levelLabel",
  singleLine: true,
  translateTime: "SYS:dd-mm-yyyy HH:MM:ss.ms",
});

global._log = pino(
  {
    level: "trace",
  },
  process.env.NODE_ENV === "development" ? pretty : undefined
);
export const logger = global._log;
declare global {
  var _log: Logger;
}
