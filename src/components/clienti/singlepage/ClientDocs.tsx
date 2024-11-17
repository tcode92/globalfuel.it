import React from "react";
import { CardTitle } from "./CardTitle";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/components/sharedDialogs/UploadDocs";
import { useClientPage } from "../useClientPage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RoundButton } from "@/components/customComponents/RoundedButton";
import { fileApi } from "@/api/file";
import { TbFileDownload } from "react-icons/tb";
import { renameDocument } from "@/components/sharedDialogs/RenameDocDialog";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { deleteFile } from "@/components/sharedDialogs/DeleteFile";
import { TiDocumentDelete } from "react-icons/ti";
import { ImDownload } from "react-icons/im";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileType } from "@constants";
import { models } from "@types";

export default function ClientDocs({
  docs,
  clientId,
}: {
  docs: models.client.FullClient["docs"];
  clientId: number;
}) {
  const { addDoc } = useClientPage();
  return (
    <div className="border border-blux-50 rounded-2xl mt-5">
      <CardTitle>
        Documenti{" "}
        <Button
          variant={"outline"}
          className="text-blux text-xs ml-4"
          size={"sm"}
          onClick={async () => {
            const files = await uploadFile(clientId);
            if (files) {
              for (const file of files) {
                addDoc(file, file.type);
              }
            }
          }}
        >
          Carica documenti
        </Button>
      </CardTitle>
      {(
        [
          "Documento di identità",
          "Libretto",
          "Moduli vari",
          "Visura camerale",
          "Verifica cerved",
          "Lettera di manleva per Carte Jolly",
        ] as FileType[]
      ).map((key) => (
        <ShowDocs key={key} name={key} docs={docs[key]} />
      ))}
    </div>
  );
}
function ShowDocs({
  docs,
  name,
}: {
  docs: models.client.FullClient["docs"][keyof models.client.FullClient["docs"]];
  name: FileType;
}) {
  const { renameDoc, removeDoc } = useClientPage();
  /*  const [toDelete, setToDelete] = useState<number[]>([]); */
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="default" className="border-b-0">
        <AccordionTrigger className="px-4 hover:no-underline hover:text-blux">
          <div className="flex justify-between items-center w-full text-left">
            <span className="flex">
              <Badge
                className={cn(
                  "mr-2",
                  "bg-gray-200 text-gray-800 hover:bg-gray-200",
                  docs?.length > 0 && "bg-green-600 hover:bg-green-600"
                )}
              >
                {docs?.length || 0}
              </Badge>{" "}
              {name}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {/* <div className="px-4">
            <Checkbox
              className="mr-2"
              checked={docs?.length === toDelete.length}
              onCheckedChange={(state) => {
                if (state) {
                  setToDelete(docs.map((d) => d.id));
                } else {
                  setToDelete([]);
                }
              }}
            />{" "}
            <Button
              variant={"ghost"}
              size={"sm"}
              disabled={toDelete.length === 0}
              onClick={async () => {
                const result = await deleteFile(
                  docs
                    .filter((doc) => toDelete.includes(doc.id))
                    .map((doc) => ({ id: doc.id, name: doc.name }))
                );
              }}
            >
              Elimina selezionati
            </Button>
          </div> */}
          {docs?.map((doc) => (
            <div
              key={doc.id}
              className="grid grid-cols-[1fr_auto] px-4 [&:last-child]:mb-0 hover:bg-gray-50 py-2 dark:hover:bg-gray-900"
            >
              <div className="grid grid-cols-[auto_1fr] items-center mr-2">
                {/* <Checkbox
                  className="mr-2"
                  checked={toDelete.includes(doc.id)}
                  onCheckedChange={(value) => {
                    setToDelete((prev) => {
                      const s = new Set(prev);
                      if (value) {
                        s.add(doc.id);
                      } else {
                        s.delete(doc.id);
                      }
                      return Array.from(s);
                    });
                  }}
                /> */}
                <div className="overflow-x-hidden text-ellipsis w-full whitespace-nowrap">
                  {doc.name}
                </div>
              </div>
              <div className="flex gap-2">
                <RoundButton
                  onClick={() => {
                    fileApi.download(doc.id);
                  }}
                >
                  <TbFileDownload />
                </RoundButton>

                <RoundButton
                  onClick={async () => {
                    const newName = await renameDocument(doc.id, doc.name);
                    if (newName) renameDoc(doc.id, name, newName);
                  }}
                >
                  <MdDriveFileRenameOutline />
                </RoundButton>

                <RoundButton
                  className="bg-red-500 hover:bg-red-300"
                  onClick={async () => {
                    const result = await deleteFile(doc.id, doc.name);
                    if (result) {
                      removeDoc(doc.id, name);
                    }
                  }}
                >
                  <TiDocumentDelete />
                </RoundButton>
              </div>
            </div>
          ))}
          {docs?.length > 1 && (
            <div className="flex justify-end w-full items-center gap-2">
              <span className="text-xs text-gray-500">Scarica tutti</span>
              <RoundButton
                className="mr-4"
                onClick={() => {
                  fileApi.open(docs.map((d) => d.id));
                }}
              >
                <ImDownload />
              </RoundButton>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
