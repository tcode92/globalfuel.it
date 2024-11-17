import { client } from "@/api/clients";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useAuthStore } from "@/store/AuthStore";
import { useClientStore } from "@/store/ClientStore";
import { MessageCircleIcon, PlusCircleIcon } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Link from "next/link";
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { HiTrash } from "react-icons/hi";
import { MdOutlineModeEditOutline, MdOutlineUploadFile } from "react-icons/md";
import { RiSortAsc, RiSortDesc } from "react-icons/ri";
import { SlOptions } from "react-icons/sl";
import { NoResultRow } from "../layout/NoResult";
import { clientCode } from "../sharedDialogs/ClientCode";
import { uploadFile } from "../sharedDialogs/UploadDocs";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { deleteClient } from "./DeleteClient";
import SearchFilter from "./SearchFilter";
import { sendMessage } from "../sharedDialogs/NewMessageDialog";
import { ClientState, ClientType, ROLES } from "@constants";
import { models } from "@types";
import { MessageIcon } from "../icons/MesageIcon";
type UpdateFn = <K extends "types" | "states">(
  key: K,
  // key to increment
  inc: keyof models.agency.AgencyDetails[K],
  // key to decrement
  dec: keyof models.agency.AgencyDetails[K]
) => void;

export default function ClientiTable({
  showAgency = true,
  updateChart,
}: {
  showAgency?: boolean;
  updateChart?: UpdateFn;
}) {
  const { clients, loading } = useClientStore();
  const query = useSearchParams();
  const role = useAuthStore((state) => state.auth?.role);
  const router = useRouter();
  if (!role) return null;
  return (
    <>
      <SearchFilter />
      <div className="w-full mt-4">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="whitespace-nowrap px-2">
                <SortTable
                  name="Rag. sociale"
                  sortBy="business"
                  query={getQuerySortValue(query, "business")}
                  router={router}
                />
              </TableHead>
              <TableHead className="px-2">
                <SortTable
                  name="Telefono"
                  sortBy="phone"
                  query={getQuerySortValue(query, "phone")}
                  router={router}
                />
              </TableHead>
              <TableHead className="px-2">
                <SortTable
                  name="Email"
                  sortBy="email"
                  query={getQuerySortValue(query, "email")}
                  router={router}
                />
              </TableHead>
              <TableHead className="whitespace-nowrap px-2">
                <SortTable
                  name="P.Iva"
                  sortBy="vat"
                  query={getQuerySortValue(query, "vat")}
                  router={router}
                />
              </TableHead>
              {showAgency && role === "admin" && (
                <TableHead className="px-2">
                  <SortTable
                    name="Agenzia"
                    sortBy="agency"
                    query={getQuerySortValue(query, "agency")}
                    router={router}
                  />
                </TableHead>
              )}
              <TableHead className="px-2">
                <SortTable
                  name="Stato"
                  sortBy="state"
                  query={getQuerySortValue(query, "state")}
                  router={router}
                />
              </TableHead>
              <TableHead className="px-2">
                <SortTable
                  name="Tipo"
                  sortBy="type"
                  query={getQuerySortValue(query, "type")}
                  router={router}
                />
              </TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 && (
              <NoResultRow span={role === "admin" ? 8 : 7} className="py-10">
                {loading ? "Caricamento..." : "Nessun cliente trovato"}
              </NoResultRow>
            )}
            {clients.map((item) => (
              <Row
                item={item}
                role={role}
                showAgency={showAgency}
                key={item.id}
                updateChart={updateChart}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
function SortTable({
  name,
  sortBy,
  query,
  router,
}: {
  name: string;
  sortBy: string;
  query: "asc" | "desc" | undefined;
  router: AppRouterInstance;
}) {
  return (
    <Button
      className="flex justify-between w-full px-2 hover:bg-blux-50"
      variant={"ghost"}
      onClick={() => {
        switch (query) {
          case "asc": {
            const newQuery = updateQuery(`s${sortBy}`, "desc");
            router.replace(window.location.pathname + "?" + newQuery);
            return;
          }
          case "desc": {
            const newQuery = updateQuery(`s${sortBy}`, null);
            router.replace(window.location.pathname + "?" + newQuery);
            return;
          }
          default:
            const newQuery = updateQuery(`s${sortBy}`, "asc");
            router.replace(window.location.pathname + "?" + newQuery);
            return;
        }
      }}
    >
      {name}{" "}
      <span>
        {!query ? null : query === "asc" ? <RiSortAsc /> : <RiSortDesc />}
      </span>
    </Button>
  );
}
function updateQuery(
  key: string,
  value: string | number | undefined | null | string[]
) {
  const query = window.location.search;
  const newParams = new URLSearchParams(query);
  if (value === null || value === undefined) {
    newParams.delete(key);
  } else {
    if (Array.isArray(value)) {
      const first = value.shift();
      if (first) {
        newParams.set(key, first);
      }
      for (const entry of value) {
        newParams.append(key, entry);
      }
    } else {
      newParams.set(key, String(value));
    }
  }
  return newParams.toString();
}
function getQuerySortValue(
  query: ReadonlyURLSearchParams,
  sortKey: string
): undefined | "asc" | "desc" {
  const value = query.get(`s${sortKey}`);
  if (!value) return undefined;
  if (value.toLowerCase() === "asc") return "asc";
  if (value.toLowerCase() === "desc") return "desc";
  return undefined;
}

const stateColor: Record<models.client.ClientTable["state"], string> = {
  "Codificato SAP": "bg-neutral-500",
  "In Lavorazione": "bg-green-500",
  "Sospeso con blocco": "bg-red-500",
  Attivo: "bg-indigo-500",
  Bloccato: "bg-red-500",
  Soppresso: "bg-red-800",
};
const typeColor: Record<
  NonNullable<models.client.ClientTable["type"]> | "Nessun tipo",
  string
> = {
  "Nessun tipo": "bg-neutral-500",
  AUMENTO: "bg-indigo-500",
  CONCESSIONE: "bg-green-500",
  DIMINUZIONE: "bg-red-500",
  REVOCA: "bg-red-800",
};

const Row = ({
  item,
  role,
  showAgency,
  updateChart,
}: {
  item: models.client.ClientTable;
  role: ROLES;
  showAgency?: boolean;
  updateChart?: UpdateFn;
}) => {
  const { update } = useClientStore();

  return (
    <>
      <TableRow>
        <TableCell className="font-medium whitespace-nowrap">
          <Link
            href={`/clienti/${item.id}`}
            className="text-blux flex items-center"
          >
            {item.toAck > 0 ? (
              <MessageIcon className="mr-1 scale-x-[-1] text-green-700" />
            ) : null}
            {item.business}
          </Link>
        </TableCell>
        <TableCell className="whitespace-nowrap">{item.phone}</TableCell>
        <TableCell className="whitespace-nowrap">{item.email}</TableCell>
        <TableCell className="whitespace-nowrap">{item.vat}</TableCell>
        {showAgency && role === "admin" && (
          <TableCell className="whitespace-nowrap font-medium">
            <Link href={`/agenzie/${item.auth_id}`} className="text-blux">
              {item.agency_name}
            </Link>
          </TableCell>
        )}
        {/* State */}
        <TableCell>
          {role === "admin" ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <StateBadge state={item.state} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(
                  [
                    "In Lavorazione",
                    "Attivo",
                    "Codificato SAP",
                    "Bloccato",
                    "Soppresso",
                    "Sospeso con blocco",
                  ] as ClientState[]
                ).map((state) => (
                  <DropdownMenuItem
                    key={state}
                    onClick={async () => {
                      if (item.state === state) return;
                      const { data, success, error } = await client.updateState(
                        item.id,
                        state
                      ).request;
                      if (success) {
                        updateChart?.("states", state, item.state);
                        update(data);
                      } else {
                        error.display();
                      }
                    }}
                  >
                    {state}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <StateBadge state={item.state} />
          )}
        </TableCell>
        {/* Type */}
        <TableCell className="w-0">
          {role === "admin" ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <TypeBadge type={item.type ?? "Nessun tipo"} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(
                  [
                    null,
                    "AUMENTO",
                    "CONCESSIONE",
                    "DIMINUZIONE",
                    "REVOCA",
                  ] as (ClientType | null)[]
                ).map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={async () => {
                      const { data, success, error } = await client.updateType(
                        item.id,
                        type
                      ).request;
                      if (success) {
                        updateChart?.(
                          "types",
                          type ?? "Nessun tipo",
                          item.type ?? "Nessun tipo"
                        );
                        update(data);
                      } else {
                        error.display();
                      }
                    }}
                  >
                    {type ? type : "Nessun tipo"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <TypeBadge type={item.type ?? "Nessun tipo"} />
          )}
        </TableCell>
        <TableCell className="text-right justify-end w-12">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="px-2 flex w-12 justify-center items-center h-5 text-blux">
              <SlOptions />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <SendMessage id={item.id} name={item.business} />
              <DropdownMenuSeparator />

              {role === "admin" && (
                <DropdownMenuItem
                  className="text-green-600 font-medium focus:text-green-600"
                  onClick={async () => {
                    const code = await clientCode(
                      item.id,
                      item.business,
                      item.code
                    );
                    if (code !== undefined) {
                      update({ ...item, code });
                    }
                  }}
                >
                  {" "}
                  <span className="mr-2">
                    <PlusCircleIcon width={14} height={14} />
                  </span>
                  Codice
                </DropdownMenuItem>
              )}
              <EditMenuItem id={item.id} />
              <DropdownMenuSeparator />
              <UploadFileItem id={item.id} name={item.business} />
              {role === "admin" && (
                <>
                  <DropdownMenuSeparator />
                  <DropDownDeleteItem name={item.business} id={item.id} />
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    </>
  );
};
function SendMessage({ id, name }: { id: number; name: string }) {
  return (
    <DropdownMenuItem
      className="text-blux-600 font-medium focus:text-blux-600"
      onClick={() => {
        sendMessage(id, name);
      }}
    >
      <span className="mr-2">
        <MessageCircleIcon className="w-[14px] h-[14px]" />
      </span>
      Messaggio
    </DropdownMenuItem>
  );
}
function UploadFileItem({ id, name }: { id: number; name: string }) {
  return (
    <DropdownMenuItem
      className="text-blux-600 font-medium focus:text-blux-600"
      onClick={() => {
        uploadFile(id, name);
      }}
    >
      <span className="mr-2">
        <MdOutlineUploadFile />
      </span>
      Carica file
    </DropdownMenuItem>
  );
}
function EditMenuItem({ id }: { id: number }) {
  return (
    <DropdownMenuItem className="text-green-600 font-medium focus:text-green-600">
      <Link
        href={`/clienti/${id}/modifica`}
        className="w-full h-full flex items-center"
      >
        <span className="mr-2">
          <MdOutlineModeEditOutline />
        </span>{" "}
        Modifica
      </Link>
    </DropdownMenuItem>
  );
}
function DropDownDeleteItem({ name, id }: { name: string; id: number }) {
  const { refresh } = useClientStore();
  return (
    <DropdownMenuItem
      className="text-red-600 font-medium focus:text-red-600"
      onClick={async () => {
        const result = await deleteClient(id, name);
        if (result) refresh();
      }}
    >
      <span className="mr-2">
        <HiTrash />
      </span>
      Elimina
    </DropdownMenuItem>
  );
}

function StateBadge({ state }: { state: ClientState }) {
  return (
    <Badge
      variant="outline"
      className={`uppercase whitespace-nowrap ${stateColor[state]}  text-white h-6`}
    >
      {state}
    </Badge>
  );
}
function TypeBadge({ type }: { type: ClientType | "Nessun tipo" }) {
  return (
    <Badge
      variant="outline"
      className={`uppercase whitespace-nowrap ${typeColor[type]}  text-white h-6`}
    >
      {type}
    </Badge>
  );
}
