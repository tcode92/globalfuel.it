import { FileType } from "@constants";
import { ChangeEvent } from "react";

export async function handleAddFiles(
  e: React.ChangeEvent<HTMLInputElement>
): Promise<LocalFile[]> {
  const filesInput = e.target.files;
  if (filesInput) {
    const files = await handleFile(filesInput);
    try {
      e.target.value = "";
    } catch (e) {}
    return files;
  } else {
    return [];
  }
}
export async function handleAddFilesDroppable(
  filesInput: FileList
): Promise<LocalFile[]> {
  const files = await handleFile(filesInput);
  return files;
}
export async function handleFile(filesInput: FileList): Promise<LocalFile[]> {
  let filesArray: Promise<LocalFile>[] = [];
  if (filesInput) {
    for (const item of Array.from(filesInput)) {
      filesArray.push(
        new Promise<LocalFile>(async (resolve) => {
          resolve(new LocalFile(item));
        })
      );
    }
  }
  const files = await Promise.all(filesArray);
  return files;
}
export async function getImageObj(file: File) {
  try {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    const imgProps: {
      width: number;
      height: number;
      base64: string;
    } | null = await new Promise((resolve) => {
      reader.onloadend = () => {
        const img = new Image();

        if (reader.result === null) {
          return resolve(null);
        }
        const base64 = reader.result;
        if (base64) {
          img.src = base64.toString();
          img.onload = function () {
            resolve({
              width: img.naturalWidth,
              height: img.naturalHeight,
              base64: img.src,
            });

            return;
          };
          img.onerror = function (e) {
            resolve(null);
          };
        } else {
          resolve(null);
          return;
        }
      };
    });

    return imgProps;
  } catch (error) {
    return null;
  }
}
/**
 *
 * @param multiple boolean @default true
 * @returns Promise<LocalFile[] | null>
 */
export async function triggerNativeFileDialog(
  multiple: boolean = true,
  mimeTypes?: string | string[]
): Promise<LocalFile[] | null> {
  return new Promise<LocalFile[] | null>((resolve) => {
    const fileElement = document.createElement("input") as HTMLInputElement;
    fileElement.hidden = true;
    fileElement.multiple = multiple ?? false;
    if (mimeTypes) {
      fileElement.accept = mimeTypes.toString();
    }
    fileElement.type = "file";
    fileElement.style.display = "none";
    fileElement.style.width = "0px";
    fileElement.style.height = "0px";
    fileElement.style.zIndex = "-100";
    fileElement.style.overflow = "hidden";
    let files: null | LocalFile[] = null;
    function close() {
      fileElement.removeEventListener("change", handleFile as any);
      fileElement.removeEventListener("cancel", close);
      fileElement.remove();
      resolve(files);
    }
    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
      files = await handleAddFiles(e);
      close();
    }
    fileElement.addEventListener("change", handleFile as any);
    fileElement.addEventListener("cancel", close);
    document.body.append(fileElement);
    fileElement.click();
  });
}
export class LocalFile {
  file: File;
  name: string;
  id: string;
  mime: string;
  type?: FileType;
  constructor(file: File) {
    this.file = file;
    this.name = file.name.slice(0, file.name.lastIndexOf("."));
    this.id = (Math.random() * 10000).toString();
    this.mime = file.type;
  }
}
function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
