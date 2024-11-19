import { MailSearchInput } from "@validation/mail";
import { db } from "../../database/db";
import { logger } from "../../lib/log";

export const trackService = async (trackId?: string) => {
  if (!trackId) return;
  try {
    await db.mail.markMailOpen(trackId);
  } catch (e) {
    logger.error(e, "MAIL TRACK SERVICE");
  }
};

export const mailGetService = async (query: MailSearchInput) => {
  const result = await db.mail.getEmailTableWithPagination(query);
  return result;
};
