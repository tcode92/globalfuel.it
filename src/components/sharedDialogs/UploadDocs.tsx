import { Progress } from "@/components/ui/progress";
import { addDialog, removeDialog } from "@/store/DialogsUiStore";
import { Plus, X } from "lucide-react";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { Button } from "../ui/button";
type PromiseResult = models.file.Doc[] | null;
type UploadDialogProps = {
  resolver: (value: PromiseResult) => void;
  clientId: number;
  clientName?: string;
};

import { fileApi } from "@/api/file";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerTitle,
} from "@/components/ui/drawer";
import { showMsg } from "@/lib/myutils";
import {
  LocalFile,
  handleAddFilesDroppable,
  triggerNativeFileDialog,
} from "@/utils/file";
import InputError from "../customComponents/InputError";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { FileType } from "@constants";
import { models } from "@types";

function UploadFile({ clientId, resolver, clientName }: UploadDialogProps) {
  const [open, setOpen] = useState(true);
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    [k: string | number]: string | undefined;
  }>({});
  const dropAreaRef = useRef<HTMLDivElement | null>(null);
  const dropContentRef = useRef<HTMLDivElement | null>(null);
  const [perc, setPerc] = useState(0);
  const currFileSize = formatBytes(
    files.reduce((prev, curr) => {
      return (prev += curr.file.size);
    }, 0)
  );
  async function handleUpload() {
    setErrors({});
    let filesErrs: { [k: string | number]: string } = {};
    for (let f = 0; f < files.length; f++) {
      if (!files[f].type) {
        filesErrs[f] = "Seleziona il tipo di documento.";
      }
    }
    if (Object.keys(filesErrs).length > 0) {
      setErrors(filesErrs);
      showMsg(
        [
          "Alcuni documenti sono senza nessun tipo.",
          "Seleziona il tipo del documento o rimuovilo per caricare.",
        ],
        "warning"
      );
      return;
    }
    setLoading(true);
    const { data, error, status, success } = await fileApi.upload(
      files,
      clientId,
      (perc) => {
        setPerc(perc);
      }
    ).request;
    if (success) {
      setOpen(false);
      resolver(data);
    } else {
      setPerc(0);
      if (status === 413) {
        error.display("È consentito caricare massimo 100MB per volta.");
      } else {
        error.display();
      }
    }
    setLoading(false);
  }
  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    setLoading(true);
    e.preventDefault();
    e.stopPropagation();
    let dt = e.dataTransfer;
    const droppedFiles = dt.files;
    if (e.type == "drop" && droppedFiles.length > 0) {
      const returnVal = await handleAddFilesDroppable(droppedFiles);

      setFiles((prev) => [...prev, ...returnVal]);
    }
    setLoading(false);
  }
  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <Drawer
      modal={true}
      open={open}
      onOpenChange={(value) => {
        if (loading) return;
        setOpen(value);
        if (value === false) {
          resolver(null);
        }
      }}
      shouldScaleBackground={true}
    >
      <DrawerOverlay
        ref={dropAreaRef}
        onDrop={handleDrop}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
      />
      <DrawerContent
        overlay={false}
        ref={dropContentRef}
        onDrop={handleDrop}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
      >
        <div className="mx-auto w-full relative">
          <DrawerHeader>
            <Button
              variant={"none"}
              className="rounded-full w-6 h-6 min-h-6 p-0 absolute right-2 -top-3"
              onClick={() => {
                if (!loading) {
                  setOpen(false);
                  resolver(null);
                }
              }}
            >
              <X width={16} />
            </Button>
            <DrawerTitle className="relative py-2 text-blux ">
              Carica documenti {clientName ? `per ${clientName}` : null}
            </DrawerTitle>
            <DrawerDescription className="flex items-center justify-center gap-2">
              <Button
                size={"sm"}
                variant={"outline"}
                onClick={async () => {
                  const files = await triggerNativeFileDialog();
                  if (files) {
                    setFiles((prev) => [...prev, ...files]);
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Aggiungi
              </Button>{" "}
              o trascina i documenti sulla pagina
            </DrawerDescription>
            <p className="text-xs text-center text-gray-600 dark:text-gray-400">
              Massimo 100MB per volta, attuale {currFileSize}
            </p>
            <Progress value={perc} className="bg-orangex-50" />
          </DrawerHeader>
          <div className="p-4 pb-0 w-full h-auto max-h-[70vh] overflow-hidden overflow-y-auto">
            {files.map((file, i) => (
              <FileItem
                key={file.id}
                errors={errors}
                file={file}
                index={i}
                setErrors={setErrors}
                setFiles={setFiles}
              />
            ))}
          </div>
          <DrawerFooter>
            <Button
              disabled={files.length === 0}
              onClick={handleUpload}
              variant="blue"
            >
              Carica
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
function FileItem({
  file,
  index,
  setFiles,
  setErrors,
  errors,
}: {
  file: LocalFile;
  index: number;
  setFiles: Dispatch<SetStateAction<LocalFile[]>>;
  setErrors: Dispatch<
    SetStateAction<{
      [k: string]: string | undefined;
      [k: number]: string | undefined;
    }>
  >;
  errors: {
    [k: string]: string | undefined;
    [k: number]: string | undefined;
  };
}) {
  return (
    <div
      key={file.id}
      className="flex flex-col w-full md:flex-row md:justify-between gap-2 py-2"
    >
      <div>{file.name}</div>
      <div className="flex flex-col text">
        <div className="flex items-center justify-between w-full">
          <Select
            onValueChange={(value: FileType) => {
              setFiles((prev) => {
                return prev.map((f) => {
                  if (f.id === file.id) f.type = value;
                  return f;
                });
              });
              if (errors[index]) {
                setErrors((prev) => ({
                  ...prev,
                  [index]: undefined,
                }));
              }
            }}
          >
            <SelectTrigger className="w-full text-left h-7 justify-between gap-4 px-2">
              <SelectValue placeholder="Seleziona tipo documento" />
            </SelectTrigger>
            <SelectContent avoidCollisions={true} position="popper">
              <SelectGroup>
                {(
                  [
                    "Documento di identità",
                    "Libretto",
                    "Moduli vari",
                    "Visura camerale",
                    "Verifica cerved",
                    "Lettera di manleva per Carte Jolly",
                  ] as FileType[]
                ).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            variant={"ghost"}
            className="rounded-full min-w-6 w-6 h-6 min-h-6 p-0"
            onClick={() => {
              setFiles((prev) => prev.filter((f) => f.id !== file.id));
            }}
          >
            <X width={16} />
          </Button>
        </div>

        <InputError>{errors[index]}</InputError>
      </div>
    </div>
  );
}
export function uploadFile(
  clientId: number,
  clientName?: string
): Promise<PromiseResult> {
  const unmountDelay = 500;
  return new Promise<PromiseResult>((r) => {
    const resolver = (value: PromiseResult) => {
      r(value);
      setTimeout(() => {
        removeDialog("upload-document");
      }, unmountDelay);
    };
    addDialog(
      <UploadFile
        resolver={resolver}
        clientId={clientId}
        clientName={clientName}
      />,
      "upload-document"
    );
  });
}
function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
