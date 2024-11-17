export type ROLES = "admin" | "agency";
export const FILETYPE: [FileType, ...FileType[]] = [
  "Visura camerale",
  "Documento di identità",
  "Libretto",
  "Lettera di manleva per Carte Jolly",
  "Moduli vari",
  "Verifica cerved",
] as const;
export type FileType =
  | "Visura camerale"
  | "Documento di identità"
  | "Libretto"
  | "Lettera di manleva per Carte Jolly"
  | "Moduli vari"
  | "Verifica cerved";
export type ClientState =
  | "Attivo"
  | "Bloccato"
  | "Codificato SAP"
  | "Sospeso con blocco"
  | "Soppresso"
  | "In Lavorazione";
export const ClientState: [ClientState, ...ClientState[]] = [
  "Attivo",
  "Bloccato",
  "Codificato SAP",
  "Sospeso con blocco",
  "Soppresso",
  "In Lavorazione",
] as const;
export type ClientType = "CONCESSIONE" | "AUMENTO" | "DIMINUZIONE" | "REVOCA";
export const ClientType: [ClientType, ...ClientType[]] = [
  "CONCESSIONE",
  "AUMENTO",
  "DIMINUZIONE",
  "REVOCA",
] as const;
export type ClientFG =
  | "assoc."
  | "coop"
  | "ditta individuale"
  | "libero professionista"
  | "onlus e CRI"
  | "pubblica amministrazione"
  | "sas"
  | "snc"
  | "spa"
  | "srl"
  | "srls";
export const ClientFG: [ClientFG, ...ClientFG[]] = [
  "assoc.",
  "coop",
  "ditta individuale",
  "libero professionista",
  "onlus e CRI",
  "pubblica amministrazione",
  "sas",
  "snc",
  "spa",
  "srl",
  "srls",
] as const;

export const CLIENT_STATE: ClientState[] = [
  "In Lavorazione",
  "Attivo",
  "Codificato SAP",
  "Bloccato",
  "Sospeso con blocco",
  "Soppresso",
];
export const CLIENT_FG: ClientFG[] = [
  "assoc.",
  "coop",
  "ditta individuale",
  "libero professionista",
  "onlus e CRI",
  "pubblica amministrazione",
  "sas",
  "snc",
  "spa",
  "srl",
  "srls",
];
export const CLIENT_TYPE: ClientType[] = [
  "CONCESSIONE",
  "AUMENTO",
  "DIMINUZIONE",
  "REVOCA",
];
