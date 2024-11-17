import InputError from "@/components/customComponents/InputError";
import InputWrapper from "@/components/customComponents/InputWrapper";
import DefaultMain from "@/components/layout/DefaultMain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function WorkWithUs() {
  return (
    <DefaultMain>
      <h1 className="text-blux-600 font-bold text-2xl my-4">Lavora con noi</h1>
      <form className="bg-white p-4 rounded-md shadow-md gap-4  flex flex-col md:grid md:grid-cols-2 justify-items-end">
        <InputWrapper>
          <Label>Nome *</Label>
          <Input placeholder="Nome" />
          <InputError />
        </InputWrapper>
        <InputWrapper>
          <Label>Cognome *</Label>
          <Input placeholder="Nome" />
        </InputWrapper>
        <InputWrapper>
          <Label>Ragione sociale *</Label>
          <Input placeholder="Nome" />
        </InputWrapper>
        <InputWrapper>
          <Label>P. IVA *</Label>
          <Input placeholder="Nome" />
        </InputWrapper>
        <div className="col-span-2"></div>
        <Button variant={"blue"} className="self-end col-span-2">
          Invia candidatura
        </Button>
      </form>
    </DefaultMain>
  );
}
