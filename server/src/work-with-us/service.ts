import { CreateWorkWithUsInput } from "@validation/workWithUs";
import { db } from "../../database/db";
import { logger } from "../../lib/log";

export const createWorkWithUsService = async (data: CreateWorkWithUsInput) => {
  const exists = await db.wwu.checkEmailExists(data.email);
  if (exists) {
    logger.warn(data, "WORK WITH US MULTI ATTEMPT");
    return true;
  }
  const result = await db.wwu.create(data);
  if (!result) {
    logger.error("Could not create a new record.");
  }
  db.staff.get().then(async (staff) => {
    for (const member of staff) {
      mailer.send({
        subject: "Nuova richiesta di collaborazione",
        data: {
          authName: member.name,
          business: data.business,
          email: data.email,
          name: data.name,
          phone: data.phone,
          surname: data.surname,
          vat: data.vat,
        },
        template: "new-work-with-us",
        to: member.email,
        from: "noreplay@globalfuel.it",
      });
    }
  });
  return true;
};
