import { msg } from "@/api/message";
import { useMessagetStore } from "@/store/messageStore";
import { models } from "@types";
import { CheckIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TiArrowForward } from "react-icons/ti";
import { MessageIcon } from "../icons/MesageIcon";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { openMessages } from "./MessageModal";

export const MessagesHeader = () => {
  const { toAck, getAck, messages } = useMessagetStore();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const abort = getAck();

    return () => {
      abort();
    };
  }, [getAck]);
  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <span className="relative flex items-center justify-center">
          {toAck > 0 && (
            <span className="absolute z-10 text-blue-800 font-semibold text-xs -top-2 text-center bg-blux-100 rounded-full px-1.5">
              {toAck}
            </span>
          )}
          <MessageIcon className="text-blux-700 w-[30px] h-[30px]" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-0" avoidCollisions collisionPadding={5}>
        <div className="overflow-hidden overflow-y-auto max-h-[70vh]">
          {messages.length === 0 ? (
            <div className="p-2 text-gray-400">
              Non ci sono messaggi da leggere
            </div>
          ) : (
            messages.map((m) => (
              <Message
                key={m.id}
                message={m}
                closeDropDown={() => setOpen(false)}
              />
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Message = ({
  message,
  closeDropDown,
}: {
  message: models.message.Message;
  closeDropDown: () => void;
}) => {
  const { ack } = useMessagetStore();
  const time = useMemo(
    () => timeSince(message.created_at),
    [message.created_at]
  );
  return (
    <div className="hover:bg-blux-50/20 p-2 border-b last:border-none">
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <span className="text-orange-600 text-sm font-semibold">
          {message.client}
        </span>
        <span className="text-sm text-gray-400">{time}</span>
      </div>
      <div className="text-sm font-semibold text-blux grid grid-cols-[1fr_auto] gap-3">
        {message.sender}
        <Button
          variant={"outline"}
          size={"icon"}
          className="rounded-full w-6 h-6"
          onClick={() => {
            openMessages(message.client_id, message.client);
            closeDropDown();
          }}
        >
          <TiArrowForward />
        </Button>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-3 mt-3">
        <div>{message.message}</div>
        <div>
          <Button
            variant={"outline"}
            size={"icon"}
            className="rounded-full w-6 h-6"
            onClick={() => {
              msg.ack(message.id).request;
              ack(message.id);
            }}
          >
            <CheckIcon className="w-4 h-4 text-green-600" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const timeSince = (createdAt: string) => {
  const dateTime = new Date(createdAt);
  const now = new Date();
  const elapsedSeconds = (now.getTime() - dateTime.getTime()) / 1000;

  const rtf = new Intl.RelativeTimeFormat("it", { numeric: "auto" });

  if (elapsedSeconds < 60) {
    return rtf.format(-Math.round(elapsedSeconds), "second");
  }

  const elapsedMinutes = elapsedSeconds / 60;
  if (elapsedMinutes < 60) {
    return rtf.format(-Math.round(elapsedMinutes), "minute");
  }

  const elapsedHours = elapsedMinutes / 60;
  if (elapsedHours < 24) {
    return rtf.format(-Math.round(elapsedHours), "hour");
  }

  const elapsedDays = elapsedHours / 24;
  if (elapsedDays < 7) {
    return rtf.format(-Math.round(elapsedDays), "day");
  }

  const elapsedWeeks = elapsedDays / 7;
  if (elapsedWeeks < 4) {
    return rtf.format(-Math.round(elapsedWeeks), "week");
  }

  const elapsedMonths = elapsedDays / 30; // Approximation
  if (elapsedMonths < 12) {
    return rtf.format(-Math.round(elapsedMonths), "month");
  }

  const elapsedYears = elapsedDays / 365; // Approximation
  return rtf.format(-Math.round(elapsedYears), "year");
};
