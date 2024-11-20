"use client";
import { useState } from "react";
import ExternalCardReqForm from "../clienti/ExternalCardRequest";

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
      <ExternalCardReqForm onSuccess={() => setDone(true)} />
    </>
  );
};
