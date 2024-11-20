"use client";
import { client } from "@/api/clients";
import CreateEditClientForm from "@/components/clienti/CreateEditClientForm";
import DefaultMain from "@/components/layout/DefaultMain";
import { HeadMeta } from "@/components/layout/HeadMeta";
import { models } from "@types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditClient() {
  const [data, setData] = useState<
    Partial<models.client.FullClient> | undefined
  >(undefined);
  const params = useParams();
  useEffect(() => {
    if (!params) return;
    if (!params.id) {
      return;
    }
    const id = +params.id;
    const { request, abort } = client.getFullClient(id);
    request.then((data) => {
      if (data.success) setData(data.data);
    });
    return () => {
      abort();
    };
  }, [params]);

  if (data === undefined) return null;

  return (
    <>
      <HeadMeta title={`Modifica ${data.business}`} />
      <DefaultMain>
        <div className="w-[100%] max-w-[800px] my-4 mx-auto">
          <h1 className="text-2xl text-blux-600 font-bold">Modifica cliente {data.business}</h1>
        </div>
        <div className="w-[100%] max-w-[800px] mx-auto bg-white p-5 shadow-lg rounded-2xl px-6 flex items-center flex-col">
          <CreateEditClientForm data={data} />
        </div>
      </DefaultMain>
    </>
  );
}
