import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default function OrderHistory() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Commande</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Total</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>#12345</TableCell>
          <TableCell>28/11/2025</TableCell>
          <TableCell>
            <Badge>Livrée</Badge>
          </TableCell>
          <TableCell>150,00 €</TableCell>
          <TableCell>
            <Button variant="outline" size="sm" asChild>
              <Link href="/orders/12345">Voir</Link>
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
