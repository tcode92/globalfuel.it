"use client";
import { staff as staffApi } from "@/api/staff";
import { EditIcon } from "@/components/icons/EditIcon";
import { OptionsIcon } from "@/components/icons/OptionsIcon";
import { PlusIcon } from "@/components/icons/PlusIcon";
import { TrashIcon } from "@/components/icons/TrashIcon";
import DefaultMain from "@/components/layout/DefaultMain";
import { createUpdateStaff } from "@/components/sharedDialogs/CreateUpdateStaff";
import { deleteDialog } from "@/components/sharedDialogs/DeleteDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Head from "next/head";
import { useEffect, useState } from "react";

type Staff = {
  id: number;
  name: string;
  email: string;
};
export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  useEffect(() => {
    const { abort, request } = staffApi.get();
    request.then((response) => {
      const { data, success, error } = response;
      if (success) {
        setStaff(data);
      } else {
        if (!error.isAbortError) error.display();
      }
    });
    return () => {
      abort();
    };
  }, []);
  return (
    <DefaultMain>
      <Head>
        <title>Staff</title>
      </Head>
      <div className="flex items-center justify-end">
        <Button
          onClick={async () => {
            const result = await createUpdateStaff();
            if (result) {
              setStaff((prev) => [...prev, result]);
            }
          }}
          className="mb-4 flex gap-2"
          variant={"orange"}
        >
          <PlusIcon />
          Nuovo utente
        </Button>
      </div>
      <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
        {staff.map((user) => (
          <div
            key={user.id}
            className="relative min-w-14 min-h-12 shadow-sm flex flex-col items-center p-4 gap-2 border rounded-md bg-gradient-to-tr from-orangex-100 to-orangex-200"
          >
            <DropdownMenu>
              <DropdownMenuTrigger className="absolute top-0 right-0 p-3 outline-none text-blux">
                <OptionsIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="text-green-600 font-medium focus:text-green-700"
                  onClick={async () => {
                    const result = await createUpdateStaff(user);
                    if (result) {
                      setStaff((prev) =>
                        prev.map((item) =>
                          item.id === user.id ? result : item
                        )
                      );
                    }
                  }}
                >
                  <span className="mr-2">
                    <EditIcon />
                  </span>
                  Modifica
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500 font-medium focus:text-red-700"
                  onClick={async () => {
                    const result = await deleteDialog({
                      title: `Elimina utente`,
                      description: `Sei sicuro di voler eliminare ${user.name}?`,
                    });
                    if (result) {
                      const { success, error } = await staffApi.delete(user.id)
                        .request;
                      if (success) {
                        setStaff((prev) =>
                          prev.filter((item) => item.id !== user.id)
                        );
                      } else {
                        error.display();
                      }
                    }
                  }}
                >
                  <span className="mr-2">
                    <TrashIcon />
                  </span>
                  Elimina
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Avatar>
              <AvatarFallback className="uppercase font-bold">
                {user.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>{user.name}</div>
            <div>{user.email}</div>
          </div>
        ))}
      </div>
    </DefaultMain>
  );
}
