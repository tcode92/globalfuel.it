"use client";
import { auth } from "@/api/auth";
import { getFormDataFromEvent } from "@/utils/formdata";
import logo from "@public/logo.png";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import InputWrapper from "../customComponents/InputWrapper";
import { InputPassword } from "../customComponents/PasswordInput";
import DefaultMain from "../layout/DefaultMain";
import LinkButton from "../ui/LinkButton";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
export default function Login({ onLoggedIn }: { onLoggedIn?: () => void }) {
  const [errors, setErrors] = useState<Record<string, string | null>>({
    email: null,
    password: null,
    all: null,
  });
  let loading: true | undefined;
  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({
      email: null,
      password: null,
      all: null,
    });
    if (loading) return;
    loading = true;
    const body = getFormDataFromEvent<{ email: string; password: string }>(e);
    const { success, error } = await auth.login(body).request;
    if (success) {
      if (onLoggedIn) onLoggedIn();
    } else {
      error.display();
    }
    loading = undefined;
  }
  return (
    <>
      <DefaultMain className="flex items-center justify-center flex-row min-w-full h-full flex-1">
        <Head>
          <title>Accedi</title>
        </Head>
        <div className="h-full flex items-center justify-center max-w-full w-[500px] flex-col p-6 bg-white rounded-xl shadow-xl">
          <Link href="/">
            <div className="flex flex-col items-center gap-3 text-4xl font-bold uppercase text-blux-500">
              <Image src={logo} alt="Logo" height={50} />
              Accedi
            </div>
          </Link>
          <form
            className="mt-8 flex gap-4 flex-col w-64 max-w-full px-2"
            onSubmit={login}
          >
            <InputWrapper>
              <Label>Email</Label>
              <Input
                name="email"
                defaultValue={"tareq@codet.it"}
                id="email"
                type="email"
                autoComplete="username"
              />
              {errors.password && errors.password}
            </InputWrapper>
            <InputWrapper>
              <Label>Password</Label>
              <InputPassword
                name="password"
                defaultValue={"Password123"}
                id="password"
                autoComplete="current-password"
              />
            </InputWrapper>
            <Button type="submit" variant={"blue"}>
              Login
            </Button>
            <p className="text-red-800 text-center min-h-6">{errors.all}</p>
            <LinkButton
              variant={"none"}
              href="/password-dimenticata"
              className="hover:text-blux"
            >
              Password dimenticata?
            </LinkButton>
          </form>
        </div>
      </DefaultMain>
    </>
  );
}
