"use client";
import CreateEditClientForm from "@/components/clienti/CreateEditClientForm";
import DefaultMain from "@/components/layout/DefaultMain";
import { Protected } from "@/components/layout/Protected";
import { useAuthStore } from "@/store/AuthStore";

import Head from "next/head";
import Link from "next/link";
import React from "react";

export default function NewClient() {
  const { auth } = useAuthStore();
  return (
    <Protected>
      <Head>
        <title>Nuovo cliente</title>
      </Head>
      <DefaultMain>
        <div className="w-[100%] max-w-[800px] my-4 mx-auto">
          <h1 className="text-2xl text-blux-600 font-bold">Nuovo cliente</h1>
        </div>
        {auth?.role === "admin" && (
          <p className="text-white my-4 bg-red-400 p-2 rounded-md shadow-md self-center">
            Questo cliente verrà assegnato a{" "}
            <Link href="/agenzie/1" className="text-blux font-medium">
              Petrol Service
            </Link>
            .
          </p>
        )}
        <div className="w-[100%] max-w-[800px] mx-auto bg-white p-5 shadow-lg rounded-2xl px-6 flex items-center flex-col">
          <CreateEditClientForm data={undefined} />
        </div>
      </DefaultMain>
    </Protected>
  );
}
