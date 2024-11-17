import { showMsg } from "@/lib/myutils";
import Router from "next/router";
import { HTTPError, Http } from "./http";
import { LocalFile } from "@/utils/file";
type MyErrorType = {
  error: {
    message: string | string[];
    fields?: Record<string, string | string[]>;
    type: "error" | "warning";
    timeout?: number;
  };
};

const httpClass = new Http<MyErrorType>();
httpClass.display = (response) => {
  if (response instanceof HTTPError) {
    showMsg(response.reason, "error", 5000);
    return;
  } else {
    if (typeof response === "string") {
      showMsg(response, "error", 5000);
    } else {
      if (response.error.message) {
        showMsg(
          response.error.message,
          response.error.type,
          response.error.timeout
        );
      } else {
        showMsg("Errore sconosciuto");
      }
    }
  }
};
httpClass.onRedirect = async (url) => {
  try {
    Router.push(url);
  } catch (e) {
    reportError(e, "REDIRECTERR:" + url);
  }
};
async function reportError(err: unknown, url: string) {
  let body: Record<string, any> = {
    url: url,
    clientUrl: window.location.toString(),
    error: undefined,
  };
  if (err instanceof Error) {
    body.error = JSON.stringify({
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause,
    });
  }
  if (typeof err === "string") {
    body.error = err;
  }
  if (typeof err === "object" && !(err instanceof Error)) {
    try {
      body.error = JSON.stringify(err);
    } catch (e) {
      body.error = "Could not serialize error as json";
    }
  }
  // possibely handle other errors here to.
  // or this should be enuogh if we pass errors as Error instance.
  await httpClass.post(`/api/error-report`, body).request;
}
httpClass.reportError = reportError;
export const http = httpClass;
export function createFormData(data?: object | string, files?: LocalFile[]) {
  const formData = new FormData();
  if (data) {
    formData.append("data", JSON.stringify(data));
  }
  if (files) {
    for (const index in files) {
      const f = files[index];
      if (!f) continue;
      formData.append(`file-${index}`, files[index].file);
      const metadata = {
        name: f.name,
        type: f.type,
      };
      formData.append(`metadata-file-${index}`, JSON.stringify(metadata));
    }
  }
  return formData;
}
