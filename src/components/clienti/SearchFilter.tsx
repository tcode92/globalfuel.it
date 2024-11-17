import { CLIENT_STATE, CLIENT_TYPE } from "@constants";
import { useClientStore } from "@/store/ClientStore";
import { debounce } from "@/utils/debounce_throttle";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { FilterItems } from "../customComponents/FilterItems";
import { PaginationCustom } from "../customComponents/Pagination";
import { SearchResultLimit } from "../customComponents/SearchResultLimit";
import { PlusIcon } from "../icons/PlusIcon";
import LinkButton from "../ui/LinkButton";
import { Input } from "../ui/input";
export default function SearchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const query = useSearchParams();
  const { getQuery, totalPages } = useClientStore();
  const debouncedGetQuery = useMemo(() => debounce(getQuery, 500), [getQuery]);
  useEffect(() => {
    debouncedGetQuery(query.toString());
  }, [query, debouncedGetQuery]);

  return (
    <div className="flex flex-wrap md:flex-nowrap md:justify-between md:items-center gap-2 bg-blux-300 p-3 rounded-lg mt-4 shadow-xl relative overflow-hidden">
      {/* Maybe add loading animation? */}
      {/* {loading && (
        <span className="absolute h-[2px] bg-gradient-to-r from-transparent via-blux-950 to-transparent w-[150px] top-0 left-0 animate-loading z-[0]"></span>
      )} */}
      <div className="flex w-full gap-2">
        <LinkButton
          href={"/clienti/nuovo"}
          variant={"none"}
          className="text-white text-xl hover:bg-blux-400 focus-visible:bg-blux-400 active:bg-blue-700"
        >
          <PlusIcon />
        </LinkButton>
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
      <FilterItems
        options={CLIENT_STATE}
        selectedValues={query.getAll("state") || []}
        title="Stato"
        add={(state) => {
          const currentStates = query.getAll("state");
          let newSet = new Set(currentStates);
          newSet.add(state);
          const newQuery = updateQuery("state", Array.from(newSet));
          router.replace(pathname + `?${newQuery}`);
        }}
        remove={(state) => {
          const currentStates = query.getAll("state");
          let newSet = new Set(currentStates);
          newSet.delete(state);
          const newQuery = updateQuery(
            "state",
            newSet.size === 0 ? null : Array.from(newSet)
          );
          router.replace(pathname + `?${newQuery}`);
        }}
        clearAll={() => {
          const newQuery = updateQuery("state", null);
          router.replace(pathname + `?${newQuery}`);
        }}
      />
      <FilterItems
        options={["Nessun tipo", ...CLIENT_TYPE]}
        selectedValues={query.getAll("type") || []}
        title="Tipo"
        add={(type) => {
          const currentTypes = query.getAll("type");
          let newSet = new Set(currentTypes);
          newSet.add(type);
          const newQuery = updateQuery("type", Array.from(newSet));
          router.replace(pathname + `?${newQuery}`);
        }}
        remove={(type) => {
          const currentTypes = query.getAll("type");
          let newSet = new Set(currentTypes);
          newSet.delete(type);
          const newQuery = updateQuery(
            "type",
            newSet.size === 0 ? null : Array.from(newSet)
          );
          router.replace(pathname + `?${newQuery}`);
        }}
        clearAll={() => {
          const newQuery = updateQuery("type", null);
          router.replace(pathname + `?${newQuery}`);
        }}
      />
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
