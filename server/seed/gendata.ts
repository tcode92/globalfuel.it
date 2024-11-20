import { fakerIT as faker } from "@faker-js/faker";
import { hashPassword } from "../lib/password";
import { ClientFG, ClientState, FILETYPE } from "@constants";
import { models } from "database/models/types";

let password: string;
export async function genAuth() {
  password = password || (await hashPassword("Password123"));
  const auth: models.auth.AuthCreateInput = {
    email: faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    password,
    role: "agency",
  };
  return auth;
}
export function genClient() {
  const client: Omit<models.client.ClientCreateInput, "id" | "authId"> = {
    address: faker.location.streetAddress(),
    business: faker.company.name(),
    email: faker.internet.email().toLowerCase(),
    vat: faker.string.numeric(11),
    pec: faker.internet.email(),
    phone: faker.phone.number(),
    type: null,
    cf: null,
    business_start: null,
    fax: null,
    fg: randomItemFromArr(ClientFG),
    sdi: null,
    state: randomItemFromArr(ClientState),
  };
  return client;
}
export function genFile(clientId: number) {
  const fileName = faker.string.alphanumeric({ length: { min: 5, max: 10 } });
  const file: models.file.CreateFileInput = {
    clientId,
    ext: ".pdf",
    mime: "application/pdf",
    name: fileName,
    src: `/files/${clientId}/${fileName}.pdf`,
    type: randomItemFromArr(FILETYPE),
  };
  return file;
}
export function randomItemFromArr<T>(arr: T[]) {
  const max = arr.length - 1;
  const n = randomNumber(0, max);
  return arr[n];
}
export function randomNumber(min: number, max: number) {
  return faker.number.int({
    min: min,
    max: max,
  });
}
