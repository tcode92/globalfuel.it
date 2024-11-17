"use client";
import ClientDetails from "@/components/clienti/singlepage/ClientDetails";
import ClientDocs from "@/components/clienti/singlepage/ClientDocs";
import ClientNotes from "@/components/clienti/singlepage/ClientNotes";
import {
  useClientFetch,
  useClientPage,
} from "@/components/clienti/useClientPage";
import DefaultMain from "@/components/layout/DefaultMain";
import { Protected } from "@/components/layout/Protected";
import { notFound } from "next/navigation";
import { HeadMeta } from "../layout/HeadMeta";

export function ClientPage() {
  const { client } = useClientPage();
  useClientFetch();
  if (client === undefined) return null;
  if (client === "Not found") {
    notFound();
  }
  if (client === "Error") {
    notFound();
  }
  return (
    <Protected>
      <DefaultMain>
        <HeadMeta title={client.business + " | Petrol Service S.R.L."} />
        <ClientDetails client={client} />
        <ClientDocs docs={client.docs} clientId={client.id} />
        <ClientNotes
          notes={client.note}
          clientId={client.id}
          clientName={client.business}
        />
      </DefaultMain>
    </Protected>
  );
}
