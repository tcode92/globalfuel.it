"use client";
import { msg } from "@/api/message";
import { cn } from "@/lib/utils";
import { addDialog, removeDialog } from "@/store/DialogsUiStore";
import { models } from "@types";
import { ArrowUp, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "../ui/button";
import { timeSince } from "./MessagesHeader";

export const MessagesModal = ({
  clientId,
  clientName,
}: {
  clientId: number;
  clientName: string;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [skip, setSkip] = useState(0);
  function scrollToEnd() {
    if (listRef.current) {
      console.log(listRef.current.scrollTop);
      console.log(listRef.current.scrollHeight);
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }
  const [data, setData] = useState<models.message.MessagePagination>({
    list: [],
    hasMore: false,
  });
  async function handleSend() {
    if (loading) return;
    if (!inputRef.current) return;
    const newText = inputRef.current.innerText;
    console.log(newText);
    if (!newText || newText.trim() === "") {
      return;
    }
    setLoading(true);
    const { success, error, data } = await msg.create({
      clientId,
      message: newText,
    }).request;
    if (success) {
      setData((prev) => {
        return {
          ...prev,
          list: [data, ...prev.list],
        };
      });
      inputRef.current.textContent = "";
      inputRef.current.focus();
    } else {
      error.display();
    }
    setLoading(false);
  }
  useEffect(() => {
    const { abort, request } = msg.get(clientId, skip);
    request.then((response) => {
      if (response.success) {
        setData(response.data);
      } else {
        if (!response.error.isAbortError) response.error.display();
      }
    });
    return () => abort();
  }, [clientId, skip]);
  useEffect(() => {
    scrollToEnd();
  }, [data.list]);
  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, []);
  return (
    <div className="bd max-w-[100vw] p-4">
      <div className="h-[90%] max-w-[600px] w-full bg-white rounded-xl grid grid-rows-[auto_1fr_auto]">
        <header className="grid grid-cols-[1fr_auto] p-2 border-b items-center gap-2">
          <Link href={`/clienti/${clientId}`}>{clientName}</Link>
          <button
            onClick={() => {
              removeDialog("chat-client");
            }}
          >
            <X width={16} />
          </button>
        </header>
        <div
          className="bg-gray-100 overflow-hidden overflow-y-auto py-2 flex flex-col-reverse gap-2"
          ref={listRef}
        >
          {data.list.map((m) => (
            <Message
              key={m.id}
              sender={m.sender}
              message={m.message}
              owner={m.sender === null}
              dateTime={m.created_at}
            />
          ))}
        </div>
        <div className="grid grid-cols-[1fr_auto] border-t p-2 items-end gap-2">
          <div
            ref={inputRef}
            className="max-h-[200px] overflow-hidden overflow-y-auto outline-none h-full"
            contentEditable
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // Prevents the default "new line" behavior
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={loading}
            variant={"outline"}
            size={"icon"}
            className="rounded-full"
          >
            <ArrowUp />
          </Button>
        </div>
      </div>
    </div>
  );
};

function Message({
  dateTime,
  message,
  sender,
  owner = false,
}: {
  dateTime: string;
  message: string;
  sender: string | null;
  owner?: boolean;
}) {
  const t = useMemo(() => timeSince(dateTime), [dateTime]);
  return (
    <div
      className={cn(
        "px-4 w-full flex flex-col flex-shrink-0",
        owner && "items-end"
      )}
    >
      <div
        className={twMerge(
          cn(
            "bg-white p-2 max-w-[90%] w-full rounded-xl flex-shrink-0 flex-1",
            !owner && "rounded-bl-none",
            owner && "rounded-br-none bg-blux-50/40"
          )
        )}
      >
        <div
          className={cn(
            "text-sm font-semibold",
            owner ? "text-blux" : "text-orangex"
          )}
        >
          {sender}
        </div>
        <div className="whitespace-pre-wrap break-words">{message}</div>
      </div>
      <div className="text-gray-400 text-[0.75rem]">{t}</div>
    </div>
  );
}

export const openMessages = (clientId: number, clientName: string) => {
  addDialog(
    <MessagesModal clientId={clientId} clientName={clientName} />,
    "chat-client"
  );
};
