import React, { useMemo } from "react";
import {
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CLIENT_STATE, ClientState } from "@constants";
import { models } from "@types";
type StatsChartData = models.dashboard.ClientStats[];
export default function StatsChart({ data }: { data?: StatsChartData }) {
  const sumState = useMemo(() => {
    if (!data) return 0;
    return data.reduce((prev, curr) => {
      return (prev += +curr.count);
    }, 0);
  }, [data]);
  const LabelColor: { [K in ClientState]: string } = {
    "In Lavorazione": "rgb(34,197,94)",
    Bloccato: "rgb(239,68,68)",
    "Codificato SAP": "rgb(115 115 115)",
    Soppresso: "rgb(153 27 27)",
    Attivo: "rgb(99 102 241)",
    "Sospeso con blocco": "rgb(239 68 68)",
  };
  return (
    <div className="w-full flex flex-col items-center border p-2 rounded-sm md:flex-row">
      <ResponsiveContainer height={200} className="w-full">
        <PieChart width={400} height={400} className="outline-none">
          {sumState === 0 ? (
            <Pie
              dataKey={"count"}
              data={[{ count: 1, name: "test" }]}
              cx={"50%"}
              cy={"50%"}
              innerRadius={60}
              outerRadius={80}
              blendStroke
            >
              <Label
                position={"center"}
                className="outline-none fill-slate-800 dark:fill-slate-300"
                fontWeight={"bold"}
              >
                {sumState}
              </Label>
            </Pie>
          ) : (
            <Pie
              className="outline-none"
              dataKey="count"
              data={data?.map((item) => ({
                name: item.state,
                count: +item.count,
              }))}
              cx={"50%"}
              cy={"50%"}
              innerRadius={60}
              outerRadius={80}
              blendStroke
            >
              <Label
                position={"center"}
                className="outline-none fill-slate-800 dark:fill-slate-300"
                fontWeight={"bold"}
              >
                {sumState}
              </Label>
              {data?.map((item) => (
                <Cell
                  style={{
                    outline: "none !important",
                  }}
                  key={item.state}
                  fill={LabelColor[item.state] as unknown as string} // TODO: FIXME:
                  name={item.state}
                />
              ))}
            </Pie>
          )}
          {sumState > 0 && (
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-black p-2 flex items-center flex-col rounded-md shadow-md">
                      <p>{payload[0].name}</p>
                      <p>{payload[0].value}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
      <div>
        {CLIENT_STATE.map((state) => (
          <div
            key={state}
            className="w-full flex items-center whitespace-nowrap"
          >
            <span
              className="w-3 h-3 rounded-full inline-block mr-2"
              style={{
                backgroundColor: LabelColor[state],
              }}
            ></span>{" "}
            {state}
          </div>
        ))}
      </div>
    </div>
  );
}
