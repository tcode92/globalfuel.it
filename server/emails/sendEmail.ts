import fs from "node:fs/promises";
import { createTransport, Transporter } from "nodemailer";
import path from "node:path";
import { logger } from "../lib/log";
import { setTimeout as sleep } from "node:timers/promises";
import { db } from "../database/db";
type EmailArgs = {
  host: string;
  port: string;
  user: string;
  password: string;
  from?: string;
  replayTo?: string;
  /**
   * Delay between each email
   * values are in seconds.
   */
  delay?: number;
};
export class Email {
  protected host: string;
  protected port: number;
  protected user: string;
  protected password: string;
  protected replayTo?: string;
  private queue: (EmailSendData & { id: number; trackId: string })[];
  private delay: NodeJS.Timeout | undefined;
  private sending: boolean;
  private delayTime: number;
  private templates: Map<string, string>;
  private smtpTransport: Transporter;
  private isShutdown: boolean;
  constructor({ host, port, user, password, delay = 10, replayTo }: EmailArgs) {
    this.host = host;
    this.replayTo = replayTo;
    this.port = Number(port);
    this.password = password;
    this.user = user;
    this.queue = [];
    this.delayTime = delay * 1000;
    this.sending = true;
    this.templates = new Map();
    this.isShutdown = false;
    this.smtpTransport = createTransport({
      auth: {
        user: this.user,
        pass: this.password,
      },
      host: this.host,
      port: this.port,
      //logger: true,
    });
    this.start();
  }
  get queueSize() {
    return this.queue.length;
  }
  async start() {
    try {
      const temp = await fs.readFile("./tempemail.json", "utf-8");
      const mails = JSON.parse(temp) as (EmailSendData & {
        id: number;
        trackId: string;
      })[];
      this.queue = [...mails, ...this.queue];
      this.sending = false;
      this.next();
      logger.info("Mails found.. starting sending old emails..");
    } catch (e) {
      // no file found we can accept next...
      this.sending = false;
      this.next();
      logger.info("No mails found.. starting sending new emails..");
    }
  }
  async tempateHtml(data: EmailSendData, trackId?: string) {
    let template = this.templates.get(data.template);
    if (!template) {
      let t = await fs.readFile(
        `./email-templates/${data.template}.html`,
        "utf-8"
      );
      t = t.replaceAll(`{{WEBSITE}}`, process.env.WEBSITE);
      this.templates.set(data.template, t);
      template = t;
    }
    if (data.template === "text") {
      const text = Array.isArray(data.data.text)
        ? data.data.text
        : [data.data.text];
      let emailContent = text.map(
        (line) =>
          `<p style="font-size: 14px; line-height: 140%;"><span style="font-size: 18px; line-height: 25.2px; color: #666666;">${line}</span></p>`
      );
      template = template.replaceAll(`{{name}}`, data.data.name);
      template = template.replaceAll(`{{title}}`, data.data.title);
      template = template.replaceAll(`{{text}}`, emailContent.join("\n"));
      // replace track id
      template = template.replace("{{trackId}}", trackId ?? "no-track");
    } else {
      const emailData = Object.entries(data.data);

      for (const [key, value] of emailData) {
        template = template.replaceAll(`{{${key}}}`, value);
      }
      // replace track id
      template = template.replace("{{trackId}}", trackId ?? "no-track");
    }
    return template;
  }
  send(data: EmailSendData) {
    logger.info("Recived new email to send.");
    let mailBody = { ...data.data };
    if (data.template === "new-account" && "password" in mailBody) {
      mailBody.password = "NON-DISPONIBILE";
    }
    db.mail
      .newEmail({
        template: data.template,
        body: mailBody,
        from_address: data.from,
        to_address: data.to,
        subject: data.subject,
      })
      .then(({ id, trackId }) => {
        this.queue.push({ ...data, id, trackId });
        this.next();
      });
  }
  sendSync(data: EmailSendData) {
    logger.info("Recived new email to send.");
    let mailBody = { ...data.data };
    if (data.template === "new-account" && "password" in mailBody) {
      mailBody.password = "NON-DISPONIBILE";
    }
    return db.mail
      .newEmail({
        template: data.template,
        body: mailBody,
        from_address: data.from,
        to_address: data.to,
        subject: data.subject,
      })
      .then(({ id, trackId }) => {
        return this.smpt(data, id, trackId);
      });
  }
  private async smpt(data: EmailSendData, id: number, trackId: string) {
    try {
      const template = await this.tempateHtml(data, trackId);
      const emailAddress: string | string[] =
        process.env.NODE_ENV !== "production" ? "dev@codet.it" : data.to;
      const result = await this.smtpTransport.sendMail({
        from: `GlobalFuel <${data.from}>`,
        replyTo: this.replayTo,
        to: emailAddress,
        subject: data.subject,
        text: data.text,
        html: template,
        attachments: data.files?.map((f) => {
          return {
            path: path.join(process.cwd(), f.path),
            filename: f.name
              ? f.name
              : path.basename(path.join(process.cwd(), f.path)),
          };
        }),
      });
      logger.info(result);
      await db.mail.markMailSent(id);
      return true;
    } catch (e) {
      logger.error(e, `MAIL ID ${id}`);
      let errMsg = `Errore sconosciuto - MAIL ID ${id}`;
      if (e instanceof Error) {
        errMsg = e.message + ` - MAIL ID ${id}`;
      }
      await db.mail.markMailError(id, errMsg);
      return false;
    }
  }
  private async next() {
    if (this.isShutdown) return;
    if (this.sending) return;
    if (this.delay !== undefined) return;
    const nextEmail = this.queue.shift();
    if (nextEmail) {
      this.sending = true;
      await this.smpt(nextEmail, nextEmail.id, nextEmail.trackId);
      this.delay = setTimeout(() => {
        this.sending = false;
        this.delay = undefined;
        this.next();
      }, this.delayTime);
    }
  }
  async shutdown() {
    this.isShutdown = true;
    if (this.sending === false && this.queueSize === 0) return;
    while (this.sending !== false) {
      await sleep(500);
    }
    if (this.queueSize > 0) {
      await fs.writeFile("./tempmail.json", JSON.stringify(this.queue));
      logger.info(
        `Flushed ${this.queueSize} emails to disk.. will resume after restart...`
      );
    }
    return;
  }
}
export type EmailSendData = DefaultEmailData &
  (
    | NewAccountTemplate
    | ResetPasswordTemplate
    | TextTemplate
    | NewClientTemplate
    | NewWorkWithUsTemplate
  );
type DefaultEmailData = {
  subject: string;
  to: string;
  text?: string;
  from: "noreplay@globalfuel.it";
  files?: { path: string; name: string }[];
};
type NewAccountTemplate = {
  template: "new-account";
  data: {
    name: string;
    email: string;
    password: string;
  };
};
type ResetPasswordTemplate = {
  template: "reset-password";
  data: {
    name: string;
    passwordResetUrl: string;
  };
};
type TextTemplate = {
  template: "text";
  data: {
    name: string;
    title: string;
    text: string | string[];
  };
};
type NewClientTemplate = {
  template: "new-client";
  data: {
    clientLink: string;
    clientName: string;
    name: string;
  };
};
type NewWorkWithUsTemplate = {
  template: "new-work-with-us";
  data: {
    authName: string;
    name: string;
    surname: string;
    business: string;
    vat: string;
    email: string;
    phone: string;
  };
};
