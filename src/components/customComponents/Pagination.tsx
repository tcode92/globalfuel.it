import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";

type PaginationProps = {
  current: number;
  total: number;
  threshhold?: number;
  onPage: (page: number) => void;
  className?: string;
};
export function PaginationCustom({
  current,
  total,
  threshhold,
  onPage,
  className,
}: PaginationProps) {
  const [page, setPage] = useState(current);
  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <Button
            className={
              "h-10 w-10 text-white text-xl hover:bg-blux-400 focus-visible:bg-blux-400 active:bg-blue-700"
            }
            variant={"none"}
            disabled={total <= 1}
            onClick={() => {
              if (current - 1 >= 1) {
                const p = current - 1;
                onPage(p);
                setPage(p);
              } else {
                onPage(total);
                setPage(total);
              }
            }}
          >
            <FaChevronLeft />
          </Button>
        </PaginationItem>
        <div className="flex gap-2 items-center">
          <Input
            disabled={total <= 1}
            value={page}
            onChange={(e) => {
              setPage(e.target.value as unknown as number);
              const p = parseInt(e.target.value);
              if (!isNaN(p) && p > 0 && p <= total) onPage(p);
            }}
            className="w-12 text-center bg-blux-300 border-blux h-8 line leading-[0px] text-md text-white"
          />{" "}
          <span className="cursor-default select-none whitespace-nowrap text-white">
            di {total}
          </span>
        </div>
        {/* {pages.map((page, idx) => (
          <PaginationItem key={page === "..." ? page + idx : page}>
            {page === "..." ? (
              <PaginationEllipsis />
            ) : (
              <Button
                className={`w-10 h-10`}
                variant={page === current ? "default" : "outline"}
                onClick={() => {
                  if (typeof page === "number") onPage(page);
                }}
              >
                {page}
              </Button>
            )}
          </PaginationItem>
        ))} */}
        <PaginationItem>
          <Button
            className={
              "h-10 w-10 px-2 text-white hover:bg-blux-400 focus-visible:bg-blux-400 active:bg-blue-700"
            }
            variant={"none"}
            disabled={total <= 1}
            onClick={() => {
              if (current + 1 <= total) {
                const p = current + 1;
                onPage(p);
                setPage(p);
              } else {
                onPage(1);
                setPage(1);
              }
            }}
          >
            <FaChevronRight />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
function generatePagination(
  currentPage: number,
  totalPages: number,
  threshold: number = 2
): (number | string)[] {
  const pagination: (number | string)[] = [];

  // Add the current page
  pagination.push(currentPage);

  // Add pages before the current page
  for (
    let i = currentPage - 1;
    i >= Math.max(1, currentPage - threshold);
    i--
  ) {
    pagination.unshift(i);
    if (i === 1) break;
  }

  // Add ellipsis if there are pages omitted before the current page
  if (typeof pagination[0] === "number" && pagination[0] > 1) {
    pagination.unshift("...");
  }

  // Add pages after the current page
  for (
    let i = currentPage + 1;
    i <= Math.min(totalPages, currentPage + threshold);
    i++
  ) {
    pagination.push(i);
    if (i === totalPages) break;
  }
  // Add ellipsis if there are pages omitted after the current page
  const cp =
    typeof pagination[pagination.length - 1] === "number"
      ? (pagination[pagination.length - 1] as number)
      : undefined;
  if (cp && cp < totalPages) {
    pagination.push("...");
  }
  return pagination;
}
