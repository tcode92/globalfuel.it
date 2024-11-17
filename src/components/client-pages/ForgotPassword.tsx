"use client";
import { auth } from "@/api/auth";
import DefaultMain from "@/components/layout/DefaultMain";
import LinkButton from "@/components/ui/LinkButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getFormDataFromEvent } from "@/utils/formdata";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import forgotPasswordSvg from "@public/forgotpassword.svg";
import logo from "@public/logo.png";
import mailSent from "@public/mail-sent.svg";
export function ForgotPasswordPage() {
  const [errors, setErrors] = useState({
    email: null,
  });
  const [done, setDone] = useState(false);
  async function reset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({
      email: null,
    });
    const body = getFormDataFromEvent<{ email: string }>(e);
    const { success, data, error } = await auth.forgotPassword(body).request;
    if (success && data) {
      setDone(true);
    } else {
      error?.display();
    }
  }
  if (done)
    return (
      <DefaultMain className="flex items-center flex-col justify-center w-full h-full p-4 flex-1">
        <Head>
          <title>Password dimenticata</title>
        </Head>
        <Image
          alt="Mail sent illustration"
          src={mailSent}
          className="max-w-[90%] max-h-[90%] h-[200px]"
        />
        <div className="mt-4 text-center text-2xl font-bold uppercase">
          Email inviata
        </div>
        <p className="text-center">
          Controlla la tua email, troverai le istruzioni su come recuperare la
          password del tuo account.
        </p>
        {/* <Button variant={"blue"}>
          <span className="animate-spin">
            <Loader />
          </span>
          Invia di nuovo
        </Button> */}
      </DefaultMain>
    );
  return (
    <>
      <DefaultMain className="flex flex-row h-full items-center gap-4 flex-1 ">
        <Head>
          <title>Password dimenticata</title>
        </Head>
        <div className="hidden md:flex w-[50%] items-center px-4">
          <Image
            className="w-full max-h-[400px]"
            src={forgotPasswordSvg}
            alt="Password illustration"
          />
        </div>
        <div className="w-full md:w-1/2 flex items-center flex-col">
          <div className="flex flex-col items-center gap-3 text-center text-2xl font-bold uppercase text-blux">
            <Link href="/">
              <Image src={logo} alt="Logo" height={50} />
            </Link>
            Password dimenticata
          </div>
          <p className="px-4 text-center">
            Per recuperare la password inserisci la tua email.
          </p>
          <form
            className="mt-4 flex gap-4 flex-col w-64 max-w-full px-2"
            onSubmit={reset}
          >
            <div className="flex flex-col w-full">
              <Label>Email</Label>
              <Input name="email" className="mt-2" />
            </div>

            <Button type="submit" variant={"blue"}>
              Recupera password
            </Button>
            {errors.email && <p>{errors.email}</p>}
            <LinkButton
              href="/accedi"
              variant={"none"}
              className="hover:text-blux"
            >
              Accedi
            </LinkButton>
          </form>
        </div>
      </DefaultMain>
    </>
  );
}
