"use client";
import ClientiTable from "../clienti/Table";
import DefaultMain from "../layout/DefaultMain";
import { Protected } from "../layout/Protected";

export function ClientsList() {
  return (
    <Protected>
      <DefaultMain className="block max-w-screen-2xl">
        <ClientiTable />
      </DefaultMain>
    </Protected>
  );
}
