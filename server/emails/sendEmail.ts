import fs from "node:fs/promises";
import { createTransport, Transporter } from "nodemailer";
import path from "node:path";
import { logger } from "../lib/log";
import { setTimeout as sleep } from "node:timers/promises";
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
  protected from?: string;
  private queue: EmailSendData[];
  private delay: NodeJS.Timeout | undefined;
  private sending: boolean;
  private delayTime: number;
  private templates: Map<string, string>;
  private smtpTransport: Transporter;
  private isShutdown: boolean;
  constructor({
    host,
    port,
    user,
    password,
    delay = 10,
    from,
    replayTo,
  }: EmailArgs) {
    this.host = host;
    this.from = from;
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
      const mails = JSON.parse(temp) as EmailSendData[];
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
  send(data: EmailSendData) {
    logger.info("Recived new email to send.");
    this.queue.push(data);
    this.next();
  }
  sendSync(data: EmailSendData) {
    return this.smpt(data);
  }
  private async smpt(data: EmailSendData) {
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
    } else {
      const emailData = Object.entries(data.data);

      for (const [key, value] of emailData) {
        template = template.replaceAll(`{{${key}}}`, value);
      }
    }
    try {
      const emailAddress: string | string[] =
        process.env.NODE_ENV !== "production" ? "dev@codet.it" : data.to;
      const result = await this.smtpTransport.sendMail({
        from: data.from || this.from,
        replyTo: data.replayTo || this.replayTo,
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
      return true;
    } catch (e) {
      logger.error(e);
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
      await this.smpt(nextEmail);
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
type EmailSendData = DefaultEmailData &
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
  from?: string;
  replayTo?: string;
  files?: { path: string; name: string }[];
};
type NewAccountTemplate = {
  template: "new-account";
  data: {
    name: string;
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
