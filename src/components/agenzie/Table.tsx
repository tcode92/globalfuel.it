"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAgencyStore } from "@/store/AgencyStore";
import { useAuthStore } from "@/store/AuthStore";

import Link from "next/link";
import { useEffect } from "react";
import { SlOptions } from "react-icons/sl";
import { NoResultRow } from "../layout/NoResult";
import { createEditAgency } from "./CreateEdit";
import { deleteAgency } from "./DeleteDialog";
import SearchFilter from "./SearchFilter";
import { EditIcon } from "../icons/EditIcon";
import { TrashIcon } from "../icons/TrashIcon";
import { models } from "@types";

export default function AgenzieTable() {
  const { agencies, getQuery } = useAgencyStore();
  const role = useAuthStore((state) => state.auth?.role);
  useEffect(() => {
    const abort = getQuery();
    return () => {
      return abort();
    };
  }, [getQuery]);
  if (!agencies || !role) return null;
  return (
    <>
      <SearchFilter />
      <div className="w-full mt-4">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Agenzia</TableHead>
              <TableHead>Email</TableHead>
              {/* <TableHead>Stato</TableHead> */}
              <TableHead>Clienti</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agencies.length === 0 && (
              <NoResultRow span={4} className="py-10">
                Nessun agenzia trovata
              </NoResultRow>
            )}
            {agencies.map((item) => (
              <Row item={item} key={item.id} />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

const Row = ({ item }: { item: models.agency.Agency }) => {
  const { refresh } = useAgencyStore();
  return (
    <>
      <TableRow>
        <TableCell className="font-medium whitespace-nowrap">
          <Link href={`/agenzie/${item.id}`} className="text-blux-500">
            {item.name}
          </Link>
        </TableCell>
        <TableCell>{item.email}</TableCell>
        <TableCell>{item.clients ?? 0}</TableCell>
        {item.id !== 1 && (
          <TableCell className="w-6 text-right">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="px-2 flex justify-center items-center h-5 text-blux-500">
                <SlOptions />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mr-10">
                <DropdownMenuItem
                  onClick={() => {
                    createEditAgency(item);
                  }}
                  className="text-green-600 focus:text-green-600"
                >
                  <span className="mr-2">
                    <EditIcon />
                  </span>
                  Modifica
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    const deleted = await deleteAgency(
                      item.id,
                      item.name,
                      item.clients
                    );
                    if (deleted) {
                      refresh();
                    }
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <span className="mr-2">
                    <TrashIcon />
                  </span>
                  Elimina
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        )}
      </TableRow>
    </>
  );
};
