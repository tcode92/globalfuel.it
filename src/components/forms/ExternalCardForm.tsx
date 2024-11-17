"use client"
import { useState } from "react";
import CreateEditClientForm, {
  ClientErrors,
} from "../clienti/CreateEditClientForm";
import { client } from "@/api/clients";

export const CardForm = () => {
  const [done, setDone] = useState(false);
  if (done) {
    return (
      <>
        <h1 className="text-blux text-4xl mb-4">Richiesta inviata</h1>
        <p>Verrai contattato dal nostro staff a breve.</p>
      </>
    );
  }
  return (
    <>
      <p className="text-center mt-4 font-bold text-xl text-blux">
        Inserisci i dati per richiedere la tua carta carburante.
      </p>
      <p className="text-center mb-4">
        I campi contrassegnati con <span className="font-bold">*</span> sono
        obbligatori.
      </p>
      <CreateEditClientForm
        isPublic
        onValidData={async (clientData) => {
          const { error, success, data, status } = await client.createExternal(
            clientData
          ).request;
          if (success) {
            setDone(true);
          } else {
            if (status === 409) {
              setDone(true);
              return;
            }
            if (data?.error?.fields) {
              return data.error.fields as ClientErrors;
            } else {
              error.display();
            }
          }
        }}
      />
    </>
  );
};
