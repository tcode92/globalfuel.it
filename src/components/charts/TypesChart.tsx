import { CLIENT_TYPE, ClientType } from "@constants";
import { useMemo } from "react";
import {
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { DashboardResponse } from "../../../server/src/dashboard/service";
export default function TypesChart({
  data,
}: {
  data?: DashboardResponse["type"];
}) {
  const sumType = useMemo(() => {
    if (!data) return 0;
    return data.reduce((prev, curr) => {
      return (prev += +curr.count);
    }, 0);
  }, [data]);
  const LabelColorType: { [K in ClientType | "Nessun tipo"]: string } = {
    "Nessun tipo": "rgb(115 115 115)",
    AUMENTO: "rgb(99 102 241)",
    CONCESSIONE: "rgb(34,197,94)",
    DIMINUZIONE: "rgb(239,68,68)",
    REVOCA: "rgb(153 27 27)",
  };
  return (
    <div className="w-full flex flex-col items-center border p-2 rounded-sm md:flex-row">
      <ResponsiveContainer height={200} className="w-full">
        <PieChart width={400} height={400}>
          {sumType === 0 ? (
            <Pie
              dataKey={"count"}
              data={[{ count: 1, name: "no-data" }]}
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
                {sumType}
              </Label>
            </Pie>
          ) : (
            <Pie
              dataKey="count"
              data={data?.map((item) => ({
                name: item.type,
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
                {sumType}
              </Label>
              {data?.map((item) => (
                <Cell
                  style={{
                    outline: "none !important",
                  }}
                  key={item.type}
                  fill={LabelColorType[item.type]}
                  name={item.type}
                />
              ))}
            </Pie>
          )}
          {sumType > 0 && (
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
        {CLIENT_TYPE.map((state) => (
          <div key={state} className="w-full flex items-center">
            <span
              className="w-3 h-3 rounded-full inline-block mr-2"
              style={{
                backgroundColor: LabelColorType[state],
              }}
            ></span>{" "}
            {state}
          </div>
        ))}
      </div>
    </div>
  );
}
