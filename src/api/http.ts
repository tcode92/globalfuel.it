
type HTTPMETHOD = "POST" | "PUT" | "PATCH" | "DELETE" | "GET";
type HTTPResult<R, E> =
  | {
      success: true;
      error: null;
      status: number;
      data: R;
    }
  | {
      success: false;
      error: HTTPError;
      status: number;
      data: null;
    }
  | {
      success: false;
      error: {
        display: (msg?: string) => void;
        isAbortError?: boolean;
      };
      status: number;
      data: E | null;
    };
export class Http<E = unknown> {
  private _display: Function;
  private _onRedirect: (url: string) => void | Promise<void>;
  private _reportError: (error: unknown, url: string) => void;
  constructor(display?: (args: E | HTTPError) => void) {
    this._display = display || console.error;
    this._onRedirect = this.noop;
    this._reportError = this.noop;

    if (display) {
      this._display.bind(this);
    }
  }
  private noop() {}
  set onRedirect(func: (url: string) => void | Promise<void>) {
    this._onRedirect = func;
  }
  set reportError(func: (error: unknown, url: string) => void) {
    this._reportError = func;
    this._reportError.bind(this);
  }
  set display(func: ((data: E | HTTPError) => void) | undefined) {
    this._display = func || this.noop;
    this._display.bind(this);
  }
  get<T = unknown>(url: string) {
    return this.send<T>(url, "GET");
  }
  post<T = unknown>(url: string, body?: Object | string | FormData) {
    return this.send<T>(url, "POST", body);
  }
  put<T = unknown>(url: string, body?: Object | string | FormData) {
    return this.send<T>(url, "PUT", body);
  }
  patch<T = unknown>(url: string, body?: Object | string | FormData) {
    return this.send<T>(url, "PATCH", body);
  }
  delete<T = unknown>(url: string) {
    return this.send<T>(url, "DELETE");
  }
  upload<T>(
    url: string,
    body: FormData,
    method: "POST" | "PUT" | "PATCH" = "POST",
    progress?: (total: number) => void
  ) {
    return this.xhr<T>(url, body, method, progress);
  }
  openFile(url: string) {
    url = encodeURI(url);
    const opened = window.open(url, "_blank");
  }
  async download(
    url: string,
    fileName?: string,
    action: "open" | "download" = "download"
  ) {
    try {
      let a: HTMLAnchorElement | undefined = undefined;
      if (action == "open") {
        // this part should be checkd first if we want to open a new window with the file
        a = Object.assign(document.createElement("a"), {
          href: url,
          style: "display:none",
        });
        a.target = "_blank";
        a.click();
        a.remove();
      } else {
        const req = await fetch(url);

        const res = await req.blob();

        const href = URL.createObjectURL(res);
        const fileNameHeader = req.headers
          .get("content-disposition")
          ?.split("=")[1];
        a = Object.assign(document.createElement("a"), {
          href,
          style: "display:none",
          download: fileName
            ? fileName
            : fileNameHeader
            ? fileNameHeader
            : undefined,
        });

        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(href);
        a.remove();
      }
    } catch (e) {
      return this.createError("SOME ERROR");
    }
  }

  private send<T = unknown>(
    url: string,
    method: HTTPMETHOD,
    body?: Object | string | FormData
  ) {
    let headers: { [k: string]: string } = {};
    let b: any;
    if (method !== "GET" && method !== "DELETE") {
      if (body instanceof FormData) {
        headers["Content-Type"] = "multipart/form-data";
        b = body;
      } else if (typeof body === "string") {
        headers["Content-Type"] = "text/plain";
        b = body;
      } else if (typeof body === "object") {
        b = JSON.stringify(body);
        headers["Content-Type"] = "application/json";
      }
    }
    const abortController = new AbortController();
    const signal = abortController.signal;
    const abort = () => {
      abortController.abort();
    };
    const request = new Promise<HTTPResult<T, E>>(async (r) => {
      let response: Response | undefined;
      try {
        response = await fetch(url, {
          headers,
          body: b,
          method,
          signal,
          credentials: "same-origin",
        });
        r(await this.parseResponse<T>(response, url));
        return;
      } catch (e) {
        r(this.parseError(e, url, response?.status));
        return;
      }
    });
    return { abort, request };
  }
  private xhr<T = unknown>(
    url: string,
    formData: FormData,
    method: HTTPMETHOD,
    progress?: (total: number) => void
  ) {
    const xhr = new XMLHttpRequest();
    const request = new Promise<HTTPResult<T | null, E>>((resolve, reject) => {
      xhr.onreadystatechange = (e) => {
        if (xhr.readyState === 4) {
          //this.dispatchUploadProgress(undefined);
          progress && progress(100);
          resolve(this.parseResponse<T>(xhr, url));
          return;
        }
      };
      xhr.upload.onprogress = (ev: ProgressEvent) => {
        if (ev.lengthComputable) {
          const percentage = (ev.loaded / ev.total) * 100;
          progress && progress(percentage);
          //this.dispatchUploadProgress(percentage);
        }
      };
      xhr.onerror = (err) => {
        this.parseError(err, url, xhr.status);
      };
      xhr.open(method, url, true);
      xhr.send(formData);
    });
    return { abort: xhr.abort, request };
  }
  private async parseResponse<T = unknown>(
    response: Response | XMLHttpRequest,
    url: string
  ): Promise<HTTPResult<T, E>> {
    let statusCode: number;
    let responseType: "json" | "text" | "bin" | null = null;
    let res: T | E;
    let redirectUrl;
    if (response instanceof Response) {
      statusCode = response.status;
      const contentType = response.headers.get("Content-Type");
      responseType = this.getContentType(contentType);
      if (response.redirected && response.url) redirectUrl = response.url;
    } else {
      statusCode = response.status;
      const contentType = response.getResponseHeader("Content-Type");
      responseType = this.getContentType(contentType);
    }
    if (redirectUrl) {
      this._onRedirect(redirectUrl);
      return {
        status: statusCode,
        data: null,
        error: {
          display: () => {},
        },
        success: false,
      };
    }
    switch (responseType) {
      case "json":
        if (response instanceof Response) {
          res = (await response.json()) as T;
        } else {
          res = JSON.parse(response.response) as T;
        }
        break;
      case "text":
        if (response instanceof Response) {
          res = (await response.text()) as T;
        } else {
          res = response.response as T;
        }
        break;
      default:
        throw `Not implemented parser for response type ${responseType}`;
    }
    // handle different response status here

    let result: HTTPResult<T, E>;
    if (statusCode < 400) {
      result = {
        data: res,
        error: null,
        status: statusCode,
        success: true,
      };
    } else {
      result = {
        data: res as unknown as E,
        error: {
          display: (err?: string) => this._display(err || res),
        },
        status: statusCode,
        success: false,
      };
    }
    return result;
  }
  private parseError(
    error: unknown,
    url: string,
    requestStatusCode: number | undefined
  ): HTTPResult<any, E> {
    const isAbortError =
      error instanceof DOMException && error.name === "AbortError";
    const newError = new HTTPError({
      display: this._display,
      abort: true,
      reason: isAbortError ? "Aborted." : `Errore richiesta ${url}`,
      url: url,
      status: requestStatusCode,
    });
    if (!isAbortError) this._reportError(error, url);
    return {
      status: 0,
      data: null,
      error: newError,
      success: false,
    };
  }
  /* private dispatchUploadProgress(progress: number | undefined) {
    const event = new CustomEvent("upload-progress", {
      bubbles: true,
      detail: { progress: progress },
    });
    window.dispatchEvent(event);
  } */
  private getContentType(contentType: string | null) {
    if (!contentType) return null;
    if (contentType.startsWith("application/json")) {
      return "json";
    }
    if (contentType.startsWith("text/")) {
      return "text";
    }
    throw `Unhandled content type ${contentType}`;
  }
  createError(error: string) {
    const request = new Promise<HTTPResult<null, E>>((r) => {
      r({
        success: false,
        status: 0,
        data: null,
        error: {
          display: this._display({
            msg: error,
            timeout: 10000,
            type: "error",
          }),
        },
      });
    });
    return { request, abort: () => {} };
  }
}
export class HTTPError {
  status?: number;
  reason: string;
  url: string;
  isAbortError: boolean;
  display: Function;

  constructor(err: {
    reason: string;
    url: string;
    status?: number;
    abort: boolean;
    display: Function;
  }) {
    this.reason = err.reason;
    this.url = err.url;
    this.status = err.status;
    this.isAbortError = err.abort;
    this.display = (alternativeText?: string) =>
      err.display(alternativeText || this);
  }
}
