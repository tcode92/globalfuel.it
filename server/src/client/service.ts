import { ClientType, ROLES } from "@constants";
import { unlink } from "fs/promises";
import path from "path";
import {
  ClientCreateUpdateInput,
  ClientQueryInput,
  ClientUpdateStateInput,
  ClientUpdateTypeInput,
} from "@validation/client";
import { db } from "../../database/db";
import { ClientSortOptions } from "../../database/models/client";
import { logger } from "../../lib/log";
import { CriticalError, KnownError } from "../../utils/error";

export const clientGetService = async (
  query: ClientQueryInput,
  role: ROLES,
  authId: number
) => {
  // Get a single client details.
  if (query.id) {
    const data = await db.client.getOne(
      query.id,
      role === "admin",
      role === "admin" ? undefined : authId
    );
    if (!data) return new KnownError("Cliente non trovato.", "error", 404);
    return data;
  }
  let hasNull: boolean | undefined;
  if (query.type) {
    const nessunTipoIndex = query.type.indexOf("Nessun tipo");
    if (nessunTipoIndex > -1) {
      query.type.splice(nessunTipoIndex, 1);
      hasNull = true;
    }
  }
  const sortBy: ClientSortOptions = {
    business: query.sbusiness,
    email: query.semail,
    vat: query.svat,
    phone: query.sphone,
    agency: query.sagency,
    state: query.sstate,
    type: query.stype,
  };
  return await db.client.getClientsTable(
    query.page,
    query.limit,
    query.search,
    query.state,
    query.type as ClientType[] | undefined,
    hasNull,
    role === "admin" ? undefined : authId,
    undefined,
    sortBy
  );
};

export const clientAgencyGetService = async (
  query: ClientQueryInput,
  agencyId: number
) => {
  let hasNull: boolean | undefined;
  if (query.type) {
    const nessunTipoIndex = query.type.indexOf("Nessun tipo");
    if (nessunTipoIndex > -1) {
      query.type.splice(nessunTipoIndex, 1);
      hasNull = true;
    }
  }
  const sortBy: ClientSortOptions = {
    business: query.sbusiness,
    email: query.semail,
    vat: query.svat,
    phone: query.sphone,
    agency: query.sagency,
    state: query.sstate,
    type: query.stype,
  };
  return await db.client.getClientsTable(
    query.page,
    query.limit,
    query.search,
    query.state,
    query.type as ClientType[] | undefined,
    hasNull,
    undefined,
    agencyId,
    sortBy
  );
};

export const clientCreateService = async (
  authId: number,
  client: ClientCreateUpdateInput
) => {
  return await db.client.create(authId, client);
};

export const clientCreateExternalService = async (
  client: ClientCreateUpdateInput
) => {
  try {
    const newClient = await db.client.create(1, client); // 1 is the 'system' auth id.
    const staff = await db.staff.get();
    for (const user of staff) {
      mailer.send({
        template: "new-client",
        data: {
          clientLink: `/clienti/${newClient}`,
          clientName: client.business,
          name: user.name,
        },
        from: "noreplay@globalfuel.it",
        to: user.email,
        subject: "Notifica nuovo cliente",
      });
    }
    return true;
  } catch (e) {
    if (e instanceof KnownError && e.errorMessage) {
      if (e.cause === "client_vat_key") {
        return true; // Fake success we have the vat already
      }
    }
    throw e;
  }
};

export const clientUpdateService = async (
  clientId: number,
  client: ClientCreateUpdateInput
) => {
  await db.client.update(clientId, client);
  return await db.client.getOne(clientId);
};

export const clientUpdateStateService = async (
  clientId: number,
  { state }: ClientUpdateStateInput
) => {
  const prevState = await db.client.getCurrentState(clientId);
  await db.client.update(clientId, { state });
  const newClient = await db.client.getOne(clientId, true);
  if (!newClient) {
    throw new CriticalError(
      `Client with id ${clientId} not found after update.`
    );
  }
  if (prevState !== state) {
    const agency = await db.client.getAgency(clientId, ["email", "name"]);
    if (!agency) return newClient; // we assume this is the system agency so no mail needed to be sent.

    mailer.send({
      template: "text",
      data: {
        name: newClient.agency_name,
        text: `Lo stato del cliente ${newClient?.business} è stato modificato da ${prevState} a ${state}.`,
        title: "Modifica stato cliente",
      },
      to: agency.email,
      from: "noreplay@globalfuel.it",
      subject: "Modifica stato cliente",
    });
  }
  return newClient;
};
export const clientUpdateTypeService = async (
  clientId: number,
  { type }: ClientUpdateTypeInput
) => {
  const prevType = await db.client.getCurrentType(clientId);
  await db.client.update(clientId, {
    type,
  });
  const newClient = await db.client.getOne(clientId, true);
  if (!newClient)
    throw new CriticalError(
      `Client with id ${clientId} not found after update.`
    );

  if (prevType !== type) {
    const agency = await db.client.getAgency(clientId, ["email"]);
    if (!agency) return newClient; // we assume this is the system agency so no mail needed to be sent.
    let text;
    if (prevType === null) {
      text = `modificato a ${type}`;
    }
    if (type === null) {
      text = "rimosso";
    }
    if (prevType !== null && type !== null) {
      text = `modificato da ${prevType} a ${type}`;
    }

    mailer.send({
      template: "text",
      from: "noreplay@globalfuel.it",
      data: {
        name: newClient.agency_name,
        text: `Il tipo del cliente ${newClient?.business} è stato ${text}.`,
        title: "Modifica tipo cliente",
      },
      to: agency.email,
      subject: "Modifica tipo cliente",
    });
  }

  return newClient;
};

export const clientUpdateCodeService = async (
  clientId: number,
  code: string | null
) => {
  const oldCode = await db.client.getCode(clientId);
  await db.client.update(clientId, {
    code,
  });
  const newClient = await db.client.getOne(clientId, true);
  if (!newClient) {
    throw new CriticalError(`Updated client not found ${clientId}`);
  }
  // do nothing if nothing changed.
  if (oldCode === code) return newClient;
  // send email to agency
  const agency = await db.auth.getById(newClient.auth_id);
  if (!agency) return newClient;
  let text;
  if (code === null) {
    text = `Il codice del tuo cliente ${newClient.business} è stato rimosso.`;
  } else {
    if (oldCode === null) {
      text = `Il codice del tuo cliente ${newClient.business} è ${code}.`;
    } else {
      text = `Il codice del tuo cliente ${newClient.business} è stato modificato da ${oldCode} a ${code}.`;
    }
  }

  mailer.send({
    template: "text",
    data: {
      name: agency.name,
      text,
      title: "Aggiornamento cliente",
    },
    subject: "Codice Carta",
    to: agency.email,
    from: "noreplay@globalfuel.it",
    text: text,
  });
  return newClient;
};

export const clientDeleteService = async (clientId: number) => {
  const clientFiles = await db.client.del(clientId);
  deleteClientFiles(clientFiles);
  return true;
};
async function deleteClientFiles(files: { src: string }[]) {
  for (const file of files) {
    try {
      await unlink(path.join(process.cwd(), file.src));
    } catch (e: any) {
      logger.error(`Delete file failed cause:  ${e.message}`);
    }
  }
}
