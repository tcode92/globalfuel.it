import { LocalFile } from "@/utils/file";
import { createFormData, http } from "./base";
import { models } from "@types";

class FileApi {
  rename(id: number, newName: string) {
    return http.patch<models.file.Doc>(`/api/files/rename/${id}`, {
      name: newName,
    });
  }
  /**
   *
   * @param file src on the server
   * @param name file name to save to disk including ext
   * @returns
   */
  download(files: (string | number) | (string | number)[]) {
    if (!Array.isArray(files)) files = [files];
    const query = files.map((f) => `file=${f}`).join("&");
    return http.download(`/api/files/download?${query}`);
  }
  open(files: (string | number) | (string | number)[]) {
    if (!Array.isArray(files)) files = [files];
    const query = files.map((f) => `file=${f}`).join("&");
    return http.openFile(`/api/files/download?${query}`);
  }
  upload(
    file: LocalFile[],
    clientId: number,
    progress: (perc: number) => void
  ) {
    const formData = createFormData(undefined, file);
    return http.upload<models.file.Doc[]>(
      `/api/files/upload/${clientId}`,
      formData,
      "POST",
      progress
    );
  }
  deleteFile(idOrSrc: number | string) {
    return http.delete(`/api/files/delete/${idOrSrc}`);
  }
}
export const fileApi = new FileApi();
