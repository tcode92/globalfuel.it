import { useMailStore } from "@/store/mailStore";
import { debounce } from "@/utils/debounce_throttle";
import { MailSearchInput } from "@validation/mail";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { PaginationCustom } from "../customComponents/Pagination";
import { SearchResultLimit } from "../customComponents/SearchResultLimit";
import { Input } from "../ui/input";
export default function SearchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const query = useSearchParams();
  const { getQuery, totalPages } = useMailStore();
  const debouncedGetQuery = useMemo(() => debounce(getQuery, 500), [getQuery]);
  useEffect(() => {
    debouncedGetQuery(query.toString());
  }, [query, debouncedGetQuery]);

  return (
    <div className="flex flex-wrap md:flex-nowrap md:justify-between md:items-center gap-2 bg-blux-300 p-3 rounded-lg mt-4 shadow-xl relative overflow-hidden">
      <div className="flex w-full gap-2">
        <Input
          placeholder="Cerca"
          type="search"
          defaultValue={query.get("search") || undefined}
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
  key: keyof MailSearchInput,
  value: string | number | null
) {
  const query = window.location.search;
  const newParams = new URLSearchParams(query);
  if (value === null || value === undefined || value === "") {
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
