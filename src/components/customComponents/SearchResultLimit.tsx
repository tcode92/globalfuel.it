import { CiViewList } from "react-icons/ci";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
export function SearchResultLimit({
  limit,
  onLimitChange,
}: {
  limit: string | null;
  onLimitChange: (limit: number) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 text-white text-xl hover:bg-blux-400 focus-visible:bg-blux-400 active:bg-blue-700 rounded-md px-2">
        {limit ?? 15} <CiViewList />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {[15, 20, 50, 100].map((defaultLimit) => (
          <DropdownMenuItem
            key={defaultLimit}
            onClick={() => {
              if ((limit ?? 15) == defaultLimit) return;
              onLimitChange(defaultLimit);
            }}
          >
            {defaultLimit}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
