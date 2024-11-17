"use client";
import { msg } from "@/api/message";
import { useAuthStore } from "@/store/AuthStore";
import { useMessagetStore } from "@/store/messageStore";
import { models } from "@types";
import { MessageCircleIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImCheckmark2 } from "react-icons/im";
import { PaginationCustom } from "../customComponents/Pagination";
import DefaultMain from "../layout/DefaultMain";
import { Protected } from "../layout/Protected";
import { sendMessage } from "../sharedDialogs/NewMessageDialog";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { debounce } from "@/utils/debounce_throttle";
export const MessagesPage = () => {
  const [data, setData] = useState<models.message.MessagePagination | null>(
    null
  );
  const query = useSearchParams();
  const getQuery = useCallback(async (query?: string) => {
    const result = await msg.get(query).request;
    if (result.success) setData(result.data);
  }, []);

  const debouncedGetQuery = useMemo(() => debounce(getQuery, 500), [getQuery]);

  useEffect(() => {
    const { abort, request } = msg.get(window.location.search.slice(1));
    request.then((response) => {
      if (response.success) setData(response.data);
      if (response.error && !response.error.isAbortError)
        response.error.display();
    });
    return () => {
      abort();
    };
  }, []);
  useEffect(() => {
    debouncedGetQuery(query.toString());
  }, [query, debouncedGetQuery]);
  return (
    <Protected>
      <DefaultMain>
        <SearchFilter />
        {data && (
          <div className="mt-6 flex flex-col gap-4">
            {data.list.map((msg) => (
              <Message message={msg} key={msg.id} />
            ))}
          </div>
        )}
      </DefaultMain>
    </Protected>
  );
};

const Message = ({ message }: { message: models.message.Message }) => {
  const { ack } = useMessagetStore();
  return (
    <div className={"rounded-lg shadow-sm overflow-hidden border bg-white"}>
      <div className="flex justify-between items-center bg-blux-400 p-2">
        <Link
          href={`/clienti/${message.client_id}`}
          className="font-semibold text-md hover:text-blue-50"
        >
          {message.client}
        </Link>
        <div className="flex gap-2 justify-center items-center">
          {message.agency_id ? (
            <Link
              href={`/agenzie/${message.agency_id}`}
              className="hover:text-blue-50"
            >
              {message.sender}
            </Link>
          ) : (
            message.sender
          )}
          {message.ack === false && (
            <Button
              size={"sm"}
              variant={"none"}
              className="w-5 h-5 p-0 text-white"
              onClick={() => {
                msg.ack(message.id);
                ack(message.id);
              }}
            >
              <ImCheckmark2 />
            </Button>
          )}
          <Button
            size={"sm"}
            variant={"none"}
            className="w-5 h-5 p-0 text-orange-300"
            onClick={() => {
              sendMessage(message.client_id, message.client);
            }}
          >
            <MessageCircleIcon />
          </Button>
        </div>
      </div>
      <div className="text-sm text-gray-500 text-right w-full px-2">
        {new Date(message.created_at).toLocaleDateString("it-IT")} alle{" "}
        {new Date(message.created_at).toLocaleTimeString("it-IT")}
      </div>
      <p className="p-2 pt-0 -mt-2 text-gray-700 whitespace-pre">
        {message.message}
      </p>
    </div>
  );
};

export default function SearchFilter({
  totalPages = 1,
}: {
  totalPages?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const query = useSearchParams();
  const { auth } = useAuthStore();

  return (
    <div className="flex flex-wrap md:flex-nowrap md:justify-between md:items-center gap-2 bg-blux-300 p-3 rounded-lg mt-4 shadow-xl relative overflow-hidden">
      <div className="flex w-full gap-2">
        <Input
          placeholder="Cliente"
          type="search"
          onChange={(e) => {
            const newQuery = updateQuery(
              "client",
              e.target.value.trim() === "" ? null : e.target.value
            );
            router.replace(pathname + `?${newQuery}`);
          }}
          className="w-full"
        />
        {auth?.role === "admin" && (
          <Input
            placeholder="Agenzia"
            type="search"
            onChange={(e) => {
              const newQuery = updateQuery(
                "agency",
                e.target.value.trim() === "" ? null : e.target.value
              );
              router.replace(pathname + `?${newQuery}`);
            }}
            className="w-full"
          />
        )}
        <Label className="flex whitespace-nowrap items-center gap-2 text-white">
          <Checkbox
            defaultChecked={query.get("toAck") === "yes"}
            onCheckedChange={(e) => {
              const query = updateQuery("toAck", e ? "yes" : null);
              router.replace(pathname + `?${query}`);
            }}
          />
          Da leggere
        </Label>
      </div>

      <PaginationCustom
        className="md:w-auto"
        current={+(query.get("page") || 1) || 1}
        total={totalPages}
        threshhold={0}
        onPage={(page) => {
          const query = updateQuery("page", page);
          router.replace(pathname + `?${query}`);
        }}
      />
    </div>
  );
}

function updateQuery(
  key: string,
  value: string | number | undefined | null | string[]
) {
  const query = window.location.search;
  const newParams = new URLSearchParams(query);
  if (value === null || value === undefined) {
    newParams.delete(key);
  } else {
    if (Array.isArray(value)) {
      const first = value.shift();
      if (first) {
        newParams.set(key, first);
      }
      for (const entry of value) {
        newParams.append(key, entry);
      }
    } else {
      newParams.set(key, String(value));
    }
  }
  return newParams.toString();
}
