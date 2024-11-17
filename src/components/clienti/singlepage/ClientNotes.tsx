import { note as noteApi } from "@/api/note";
import { RoundButton } from "@/components/customComponents/RoundedButton";
import { NoResult } from "@/components/layout/NoResult";
import { createEditNote } from "@/components/sharedDialogs/CreateEditNote";
import { deleteDialog } from "@/components/sharedDialogs/DeleteDialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/constants";
import { HiTrash } from "react-icons/hi";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { useClientPage } from "../useClientPage";
import { CardTitle } from "./CardTitle";
import { models } from "@types";
export default function ClientNotes({
  notes,
  clientId,
  clientName,
}: {
  notes: models.client.FullClient["note"];
  clientId: number;
  clientName: string;
}) {
  const { addNote, updateNote, deleteNote } = useClientPage();
  return (
    <>
      <div className="border border-blux-50 rounded-2xl mt-5">
        <CardTitle>
          Note{" "}
          <Button
            variant={"outline"}
            className="text-blux text-xs ml-4"
            size={"sm"}
            onClick={async () => {
              const result = await createEditNote(clientId, clientName);
              if (result !== null) {
                addNote(result);
              }
            }}
          >
            Nuova nota
          </Button>
        </CardTitle>
        {notes.length === 0 && (
          <NoResult variant="small">Non ci sono note salvate</NoResult>
        )}
        {notes.map((note) => (
          <Accordion type="single" collapsible key={note.id}>
            <AccordionItem value="default" className="border-b-0">
              <AccordionTrigger className="px-4">
                <div className="flex justify-between items-center w-full text-left text-xs">
                  <span>{formatDate(note.created_at)}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 grid grid-cols-[1fr_auto]">
                <div className="whitespace-pre-wrap">{note.text}</div>
                <div className="flex gap-2">
                  <RoundButton
                    className="text-green-500"
                    onClick={async () => {
                      const result = await createEditNote(
                        note.id,
                        clientName,
                        note.text
                      );
                      if (result) {
                        updateNote(result);
                      }
                    }}
                  >
                    <MdOutlineModeEditOutline />
                  </RoundButton>
                  <RoundButton
                    className="text-red-500"
                    onClick={async () => {
                      const result = await deleteDialog({
                        title: "Elimina nota",
                        description: "Sei sicuro di voler eliminare la nota?",
                      });
                      if (result) {
                        deleteNote(note.id);
                        await noteApi.delete(note.id).request;
                      }
                    }}
                  >
                    <HiTrash />
                  </RoundButton>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
      <div className="min-h-2 h-2"></div>
    </>
  );
}
