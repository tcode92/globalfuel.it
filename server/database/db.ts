import { agency } from "./models/agency";
import { auth } from "./models/auth";
import { client } from "./models/client";
import { dashboard } from "./models/dashboard";
import { file } from "./models/file";
import { note } from "./models/note";
import { message } from "./models/message";
import { staff } from "./models/staff";
import { wwu } from "./models/wwu";

export const db = {
  auth,
  agency,
  client,
  note,
  message,
  staff,
  dashboard,
  file,
  wwu
};
