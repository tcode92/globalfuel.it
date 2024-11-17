"use client";
import { dashboard } from "@/api/dashboard";
import StatsChart from "@/components/charts/StatsChart";
import TypesChart from "@/components/charts/TypesChart";
import DefaultMain from "@/components/layout/DefaultMain";

import Head from "next/head";
import { useEffect, useState } from "react";
import { DashboardResponse } from "../../../server/src/dashboard/service";

export function Dashboard() {
  const [data, setData] = useState<DashboardResponse | undefined>();
  useEffect(() => {
    const { abort, request } = dashboard.stats();
    request.then((response) => {
      if (response.success) {
        setData(response.data);
      }
    });
    return () => {
      abort();
    };
  }, []);

  if (!data) return null;
  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <DefaultMain>
        <div className="flex flex-col gap-2 md:flex-row">
          {/* STATES */}
          <StatsChart data={data.state} />
          {/* TYPES */}
          <TypesChart data={data.type} />
        </div>
      </DefaultMain>
    </>
  );
}
