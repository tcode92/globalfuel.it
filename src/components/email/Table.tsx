import { useMailStore } from "@/store/mailStore";
import { models } from "@types";
import { EyeIcon, SendIcon } from "lucide-react";
import { NoResultRow } from "../layout/NoResult";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import SearchFilter from "./SearchFilter";
import { Spinner } from "../ui/spinner";

export default function EmailTable({}: {}) {
  const { mails, loading } = useMailStore();

  return (
    <>
      <SearchFilter />
      <div className="w-full mt-4">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="whitespace-nowrap px-2">
                Destinatario
              </TableHead>
              <TableHead className="px-2">Mittente</TableHead>
              <TableHead className="px-2">Oggetto</TableHead>
              <TableHead className="whitespace-nowrap px-2">Stato</TableHead>
              <TableHead className="px-2">Aperta</TableHead>
              <TableHead className="px-2"></TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mails.length === 0 && (
              <NoResultRow span={7} className="py-10">
                {loading ? (
                  <div className="w-full flex justify-center">
                    <Spinner />
                  </div>
                ) : (
                  "Nessun email trovata"
                )}
              </NoResultRow>
            )}
            {mails.map((item) => (
              <Row item={item} key={item.id} />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

const Row = ({ item }: { item: models.mail.Mail }) => {
  return (
    <>
      <TableRow>
        <TableCell className="whitespace-nowrap">{item.to_address}</TableCell>
        <TableCell className="whitespace-nowrap">{item.from_address}</TableCell>
        <TableCell className="whitespace-nowrap">{item.subject}</TableCell>

        {/* State */}
        <TableCell>
          <StateBadge state={item.status} />
        </TableCell>
        {/* Open */}
        <TableCell className="w-0">
          {item.opened > 0 ? (
            <Badge className="uppercase whitespace-nowrap bg-green-500">
              {item.opened}
            </Badge>
          ) : (
            <Badge className="uppercase whitespace-nowrap bg-red-500">No</Badge>
          )}
        </TableCell>
        <TableCell className="w-0">
          <Button variant={"none"} size={"icon"} className="text-blux">
            <EyeIcon />
          </Button>
        </TableCell>
        <TableCell className="text-right justify-end w-12">
          <Button variant={"none"} size={"icon"} className="text-green-700">
            <SendIcon />
          </Button>
        </TableCell>
      </TableRow>
    </>
  );
};
type State = models.mail.Mail["status"];
const stateColor: { [key in State]: string } = {
  failed: "bg-red-500",
  sent: "bg-green-500",
  pending: "bg-yellow-500",
};
const stateText: { [key in State]: string } = {
  failed: "Fallito",
  pending: "In attesa",
  sent: "Inviata",
};
function StateBadge({ state }: { state: models.mail.Mail["status"] }) {
  return (
    <Badge
      variant="outline"
      className={`uppercase whitespace-nowrap ${stateColor[state]} text-white h-6`}
    >
      {stateText[state]}
    </Badge>
  );
}
