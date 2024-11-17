import { models } from "database/models/types";
import { dbConn } from "../database/connection";
import { db } from "../database/db";
import { batchInsertClients } from "./batchInsertClients";
import { genAuth, genClient, randomItemFromArr, randomNumber } from "./gendata";
const onlyAuth = process.argv[2] === "--auth-only";
async function main() {
  const auth = await genAuth();
  await db.auth.create({
    email: "tareq@codet.it",
    name: "tareq",
    password: auth.password,
    role: "admin",
  });
  if (onlyAuth) {
    await dbConn.end();
    process.exit(0);
  }
  let agenciesIds = [];
  const authCount = 3000;
  for (let i = 0; i < authCount; i++) {
    const auth = await genAuth();
    try {
      const { id } = await db.auth.create(auth);
      if (auth.role === "agency") {
        agenciesIds.push(id);
      }
      process.stdout.write(`Current auth: ${i + 1} of ${authCount}\r`);
    } catch (e) {
      console.error("ERROR: ", e);
    }
  }
  process.stdout.write("\r\n");
  let clientsCount = randomNumber(50_000, 100_000);
  const initial = clientsCount;
  while (clientsCount !== 0) {
    const batchSize = Math.min(clientsCount, 1000);
    const batch = getBatchClients(batchSize, agenciesIds);
    try {
      const ids = await batchInsertClients(batch);
      clientsCount = clientsCount - batchSize;
    } catch (e) {
      console.error("ERROR: ", e);
    }
    process.stdout.write(`Remaining: ${clientsCount} of ${initial}\r`);
  }
  /* for (let i = 0; i < clientsCount; i++) {
    const id = await createClient(authId, client);
    const randFileNum = randomNumber(0, 50);
    for (let x = 0; x < randFileNum; x++) {
      const randomFile = genFile(id);
      await createFile(randomFile);
    }
  } */
  // Seed messages

  await dbConn.end();
}

main();

function getBatchClients(num: number, agenciesIds: number[]) {
  let clients: (models.client.ClientCreateInput & { authId: number })[] = [];
  for (let i = 0; i < num; i++) {
    const client = genClient() as models.client.ClientCreateInput & {
      authId: number;
    };
    client.authId = randomItemFromArr(agenciesIds);
    clients.push(client);
  }
  return clients;
}
