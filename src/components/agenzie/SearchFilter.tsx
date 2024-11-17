import { useAgencyStore } from "@/store/AgencyStore";
import { debounce } from "@/utils/debounce_throttle";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { PaginationCustom } from "../customComponents/Pagination";
import { SearchResultLimit } from "../customComponents/SearchResultLimit";
import { PlusIcon } from "../icons/PlusIcon";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { createEditAgency } from "./CreateEdit";
export default function SearchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const query = useSearchParams();
  const { getQuery, totalPages } = useAgencyStore();
  const debouncedGetQuery = useMemo(() => debounce(getQuery, 500), [getQuery]);
  const initialQuery = useRef(query);
  useEffect(() => {
    if (!initialQuery) return;
    let page = initialQuery.current.get("page");
    let limit = initialQuery.current.get("limit");
    const newQuery = updateMultipleQuery([
      {
        key: "page",
        value: page ?? 1,
      },
      {
        key: "limit",
        value: limit,
      },
    ]);
    router.replace(pathname + `?${newQuery}`);
  }, [initialQuery, router, pathname]);
  useEffect(() => {
    debouncedGetQuery(query.toString());
  }, [query, debouncedGetQuery]);
  return (
    <div className="flex flex-wrap md:flex-nowrap md:justify-between md:items-center gap-2 bg-blux-300 p-3 rounded-lg mt-4 shadow-xl">
      <div className="flex w-full gap-2 ">
        <Button
          variant={"none"}
          className="text-white text-xl hover:bg-blux-400 focus-visible:bg-blux-400 active:bg-blue-700"
          onClick={() => {
            createEditAgency();
          }}
        >
          <PlusIcon />
        </Button>
        <Input
          placeholder="Cerca"
          type="search"
          onChange={(e) => {
            const newQuery = updateQuery(
              "search",
              e.target.value.trim() === "" ? null : e.target.value
            );
            router.replace(pathname + `?${newQuery}`);
          }}
          className="w-full"
        />
        <SearchResultLimit
          limit={query.get("limit")}
          onLimitChange={(limit) => {
            const query = updateQuery("limit", limit);
            router.replace(pathname + `?${query}`);
          }}
        />
      </div>
      <PaginationCustom
        className="w-auto"
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
function updateMultipleQuery(
  queryArr: { key: string; value: string | number | undefined | null }[]
) {
  const query = window.location.search;
  const newParams = new URLSearchParams(query);
  for (const { key, value } of queryArr) {
    if (value === null || value === undefined) {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }
  }
  return newParams.toString();
}
function updateQuery(key: string, value: string | number | undefined | null) {
  const query = window.location.search;
  const newParams = new URLSearchParams(query);
  if (value === null || value === undefined) {
    newParams.delete(key);
  } else {
    newParams.set(key, String(value));
  }
  return newParams.toString();
}
