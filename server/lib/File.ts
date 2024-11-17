import fs from "fs";
import path from "path";
const wd = process.cwd();

export class ServerFile {
  path: string;
  mime: string;
  name: string;
  serverName: string;
  ext: string;
  type?: string;
  fieldName?: string;
  private filesize: number | undefined;
  uploadedAt: string;
  constructor(data: {
    path: string;
    mime: string;
    name: string;
    serverName: string;
    ext?: string;
    type?: string;
    fieldName?: string;
  }) {
    const ext = data.ext || path.parse(data.path).ext;
    this.path = path.normalize(data.path.replace(wd, "")).replaceAll("\\", "/");
    this.mime = data.mime;
    this.name = path.parse(data.name).name;
    this.type = data.type;
    this.filesize = undefined;
    this.ext = ext;
    this.serverName = data.serverName;
    this.uploadedAt = ServerFile.uploadedAt;
    this.fieldName = data.fieldName;
  }
  static get uploadedAt() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return y + m + d;
  }
  static delete(relativePath: string) {
    return (async function () {
      try {
        await fs.promises.unlink(path.join(wd, relativePath));
        return true;
      } catch (e) {
        //log.error(e);
        return false;
      }
    })();
  }
  get absPath() {
    return path.join(wd, this.path);
  }

  private setPath(p: string) {
    this.path = path.normalize(p.replace(wd, "")).replaceAll("\\", "/");
  }
  async move(to: string) {
    const newPath = path.join(wd, to);
    try {
      await fs.promises.mkdir(path.dirname(newPath), {
        recursive: true,
      });
      await fs.promises.rename(path.join(wd, this.path), newPath);
      this.setPath(newPath);
      return true;
    } catch (e) {
      //log.error(e, `Unable to move file ${this.path} to ${newPath}`);
    }
  }
  async delete() {
    try {
      await fs.promises.unlink(path.join(wd, this.path));
      return true;
    } catch (e) {
      return false;
    }
  }
  async copy(to: string) {
    try {
      const newPath = path.join(wd, to);
      await fs.promises.mkdir(path.parse(newPath).dir, {
        recursive: true,
      });
      await fs.promises.copyFile(path.join(wd, this.path), newPath);
      return new ServerFile({
        mime: this.mime,
        name: this.name,
        path: newPath,
        serverName: path.parse(newPath).name,
      });
    } catch (e) {
      return false;
    }
  }
  async info() {
    try {
      const result = await fs.promises.stat(path.join(wd, this.path));
      this.filesize = result.size;
      return result;
    } catch (e) {
      return false;
    }
  }
  async size() {
    if (this.filesize) {
      return this.filesize;
    } else {
      const d = await this.info();
      if (!d) return 0;
      return d.size;
    }
  }
}
