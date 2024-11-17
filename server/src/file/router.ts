import { FastifyPluginAsync } from "fastify";
import { renameFileHandler } from "./rename";
import { deleteFileHandler } from "./delete";
import { downloadFileHandler } from "./download";
import { uploadFileHandler } from "./upload";

const route: FastifyPluginAsync = async (api, opts) => {
  api.get("/download", downloadFileHandler);
  api.patch("/rename/:id", renameFileHandler);
  api.post("/upload/:clientId", uploadFileHandler);
  api.delete("/delete/:fileId", deleteFileHandler);
};

export const fileRouter = route;
