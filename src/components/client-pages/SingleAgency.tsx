"use client";
import { agency } from "@/api/agency";
import StatsChart from "@/components/charts/StatsChart";
import DefaultMain from "@/components/layout/DefaultMain";
import { NoResult } from "@/components/layout/NoResult";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";

import TypesChart from "@/components/charts/TypesChart";
import ClientiTable from "@/components/clienti/Table";
import { HeadMeta } from "@/components/layout/HeadMeta";
import { Protected } from "@/components/layout/Protected";
import { useClientStore } from "@/store/ClientStore";
import { ClientState, ClientType } from "@constants";
import { models } from "@types";

export default function SingleAgency() {
  const { setAgencyId, clearClients } = useClientStore();
  const [data, setData] = useState<undefined | "Not found" | models.agency.AgencyDetails>(
    undefined
  );
  const params = useParams();
  useEffect(() => {
    if (!params.id) {
      setData("Not found");
      return;
    }
    const id = parseInt(params.id.toString() || "NaN");
    if (isNaN(id)) {
      setData("Not found");
      return;
    }
    const { abort, request } = agency.getOne(id);
    request.then((response) => {
      const { data, error, success, status } = response;
      if (success) {
        setData(data);
        setAgencyId(data.id);
        return;
      }
      if (status === 404) {
        setData("Not found");
        return;
      }
      if (error.isAbortError) return;
      error.display();
    });
    return () => {
      abort();
      clearClients();
      setAgencyId(undefined);
    };
  }, [params.id, clearClients, setAgencyId]);
  if (data === "Not found") {
    notFound();
  }
  /* return (
    <NotFoundPage>
      <Head>
        <title>Agenzia non trovata</title>
      </Head>
      Agenzia non trovata
    </NotFoundPage>
  ); */
  return (
    <Protected role="admin">
      <DefaultMain>
        {data === undefined && (
          <NoResult>
            <HeadMeta title="Recupero dati in corso..." />
          </NoResult>
        )}
        {typeof data === "object" && (
          <>
            <HeadMeta title={`Agenzia ${data.name}`} />

            <h1 className="text-xl font-bold my-4 text-blux">{data.name}</h1>
            <div className="flex flex-col gap-2 md:flex-row mb-10">
              <StatsChart
                data={Object.entries(data.states).map(([key, val]) => {
                  return {
                    state: key as ClientState,
                    count: val,
                  };
                })}
              />
              <TypesChart
                data={Object.entries(data.types).map(([key, val]) => {
                  return {
                    type: key as ClientType | "Nessun tipo",
                    count: val,
                  };
                })}
              />
            </div>
            <ClientiTable
              showAgency={false}
              updateChart={(key, inc, dec) => {
                setData((prev) => {
                  if (typeof prev !== "object") {
                    return prev;
                  }
                  prev[key][inc] = (
                    +(prev[key][inc] ?? 0) + 1
                  ).toString() as (typeof prev)[typeof key][typeof inc];
                  prev[key][dec] = (
                    +(prev[key][dec] ?? 0) - 1
                  ).toString() as (typeof prev)[typeof key][typeof dec];

                  return { ...prev, [key]: { ...prev[key] } };
                });
              }}
            />
          </>
        )}
      </DefaultMain>
    </Protected>
  );
}
