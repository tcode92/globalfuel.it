import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import LinkButton from "@/components/ui/LinkButton";
import { formatDate, transformDate } from "@/constants";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { BiCopyAlt } from "react-icons/bi";
import { IoPhonePortraitOutline } from "react-icons/io5";
import { MdOutlineEmail } from "react-icons/md";
import { CardTitle } from "./CardTitle";
import { models } from "@types";
import { Wrapper } from "./Wrapper";

export default function ClientDetails({
  client,
}: {
  client: models.client.FullClient;
}) {
  return (
    <Wrapper>
      <CardTitle>
        Dettagli
        <LinkButton
          href={`/clienti/modifica/${client.id}`}
          className="text-blux text-xs ml-4"
          variant={"outline"}
        >
          Modifica cliente
        </LinkButton>
      </CardTitle>
      <Accordion type="single" collapsible>
        <AccordionItem value="default" className="border-b-0">
          <AccordionTrigger className="px-4 text-blux">
            {client.business}
          </AccordionTrigger>
          <AccordionContent>
            {client.agency_name && (
              <ClientDetail>
                <ClientDetailItem>Agenzia</ClientDetailItem>
                <ClientDetailValue>{client.agency_name}</ClientDetailValue>
              </ClientDetail>
            )}
            <ClientDetail>
              <ClientDetailItem>Ragione sociale</ClientDetailItem>
              <ClientDetailValue>{client.business}</ClientDetailValue>
            </ClientDetail>
            <ClientDetail>
              <ClientDetailItem>Partita IVA</ClientDetailItem>
              <ClientDetailValue>{client.vat}</ClientDetailValue>
            </ClientDetail>
            <ClientDetail>
              <ClientDetailItem>Codice fiscale</ClientDetailItem>
              <ClientDetailValue>{client.cf}</ClientDetailValue>
            </ClientDetail>
            <ClientDetail>
              <ClientDetailItem>Stato</ClientDetailItem>
              <ClientDetailValue>{client.state}</ClientDetailValue>
            </ClientDetail>
            <ClientDetail>
              <ClientDetailItem>Tipo</ClientDetailItem>
              <ClientDetailValue>{client.type}</ClientDetailValue>
            </ClientDetail>
            <ClientDetail>
              <ClientDetailItem>Telefono</ClientDetailItem>
              <ClientDetailValue phone>{client.phone}</ClientDetailValue>
            </ClientDetail>
            <ClientDetail>
              <ClientDetailItem>Email</ClientDetailItem>
              <ClientDetailValue email>{client.email}</ClientDetailValue>
            </ClientDetail>
            <ClientDetail>
              <ClientDetailItem>PEC</ClientDetailItem>
              <ClientDetailValue>{client.pec}</ClientDetailValue>
            </ClientDetail>

            <ClientDetail>
              <ClientDetailItem>Fax</ClientDetailItem>
              <ClientDetailValue>{client.fax}</ClientDetailValue>
            </ClientDetail>
            <ClientDetail>
              <ClientDetailItem>Figura giuridica</ClientDetailItem>
              <ClientDetailValue>{client.fg}</ClientDetailValue>
            </ClientDetail>
            <ClientDetail>
              <ClientDetailItem>Indirizzo</ClientDetailItem>
              <div className="flex gap-1 flex-wrap">
                <ClientDetailValue copy={false}>
                  {client.address.street}
                </ClientDetailValue>
                <ClientDetailValue copy={false}>
                  {client.address.province}
                </ClientDetailValue>
                <ClientDetailValue copy={false}>
                  {client.address.postalCode}
                </ClientDetailValue>
              </div>
            </ClientDetail>

            <ClientDetail>
              <ClientDetailItem>Codice SDI</ClientDetailItem>
              <ClientDetailValue>{client.sdi}</ClientDetailValue>
            </ClientDetail>

            <ClientDetail>
              <ClientDetailItem>Inizio attività</ClientDetailItem>
              <ClientDetailValue>
                {client.business_start
                  ? transformDate(client.business_start)
                  : null}
              </ClientDetailValue>
            </ClientDetail>

            <ClientDetail>
              <ClientDetailItem>Ultima modifica</ClientDetailItem>
              <ClientDetailValue>
                {formatDate(client.updated_at)}
              </ClientDetailValue>
            </ClientDetail>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Wrapper>
  );
}
function ClientDetail({ children }: { children?: ReactNode }) {
  return (
    <div className="border-b border-blux-50 py-2 pl-4 [&:last-child]:border-0 ">
      {children}
    </div>
  );
}
function ClientDetailItem({ children }: { children?: ReactNode }) {
  return <div className="text-xs font-bold text-neutral-500">{children}</div>;
}
function ClientDetailValue({
  children,
  copy = true,
  email = false,
  phone = false,
}: {
  children?: ReactNode;
  copy?: boolean;
  email?: boolean;
  phone?: boolean;
}) {
  return (
    <div className="flex items-center pr-2 flex-wrap">
      {copy && typeof children === "string" && (
        <Copy value={children} className="mr-2" />
      )}
      {phone && typeof children === "string" && (
        <Phone value={children} className="mr-2" />
      )}
      {email && typeof children === "string" && (
        <Email value={children} className="mr-2" />
      )}
      {children}
    </div>
  );
}
function Copy({ value, className }: { value: string; className?: string }) {
  return (
    <Button
      onClick={async () => {
        await copyText(value);
      }}
      variant={"outline"}
      size={"icon"}
      className={cn("rounded-full w-7 h-7 flex-shrink-0", className)}
    >
      <span className="flex">
        <BiCopyAlt />
      </span>
    </Button>
  );
}
function Email({ value, className }: { value: string; className?: string }) {
  return (
    <LinkButton
      href={`mailto:${value}`}
      className={cn("rounded-full w-7 h-7 flex-shrink-0 p-0", className)}
      variant={"outline"}
    >
      <span className="flex">
        <MdOutlineEmail />
      </span>
    </LinkButton>
  );
}
function Phone({ value, className }: { value: string; className?: string }) {
  return (
    <LinkButton
      href={`tel:${value}`}
      className={cn("rounded-full w-7 h-7 flex-shrink-0 p-0", className)}
      variant={"outline"}
    >
      <span className="flex">
        <IoPhonePortraitOutline />
      </span>
    </LinkButton>
  );
}

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}
