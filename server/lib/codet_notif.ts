class CodetNotification {
  private service: string;
  private access_token: string;
  private enabled: boolean;
  constructor(service: string) {
    this.service = service;
    if (process.env.CODET_TOKEN) {
      this.access_token = process.env.CODET_TOKEN;
      this.enabled = true;
    } else {
      this.enabled = false;
      this.access_token = "";
    }
  }
  async send({
    text,
    type,
  }: {
    type?: "success" | "warn" | "error";
    text: string;
  }) {
    if (!this.enabled || process.env.NODE_ENV !== "production") return;
    const _type = {
      success: "🟢",
      error: "🔴",
      warn: "🟡",
    };
    let msg = type ? _type[type] : "";
    type ? (msg += ` ${text}`) : text;
    await fetch("https://notification.codet.it/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.access_token}`,
      },
      body: JSON.stringify({
        to: "tareq",
        title: this.service,
        body: msg,
      }),
    });
  }
}

export const codetNotification = new CodetNotification(
  process.env.NODE_ENV === "production" ? "globalfuel.it" : "DEV: globalfuel.local"
);
