import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getAnalyticsTableData } from "@/lib/actions/analytics"
import { format } from "date-fns"

interface AnalyticsTableProps {
  searchParams: {
    companies?: string
    startDate?: string
    endDate?: string
    minAmount?: string
    maxAmount?: string
    companyType?: string
  }
}

export async function AnalyticsTable({ searchParams }: AnalyticsTableProps) {
  const tableData = await getAnalyticsTableData(searchParams)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Invoice Data</CardTitle>
        <CardDescription>Filtered invoice details based on your selected criteria</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.numero}</TableCell>
                <TableCell>
                  {invoice.dateEmission ? format(new Date(invoice.dateEmission), "dd/MM/yyyy") : "N/A"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {invoice.supplier?.name || "N/A"}
                    {invoice.supplier && (
                      <Badge variant="outline" className="text-xs">
                        {invoice.supplier.type}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {invoice.buyer?.name || "N/A"}
                    {invoice.buyer && (
                      <Badge variant="outline" className="text-xs">
                        {invoice.buyer.type}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{invoice.totalTTC?.toLocaleString() || "N/A"}</TableCell>
                <TableCell>
                  <Badge variant={invoice.resteAPayer && invoice.resteAPayer > 0 ? "destructive" : "default"}>
                    {invoice.resteAPayer && invoice.resteAPayer > 0 ? "Pending" : "Paid"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {tableData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No invoices found matching the selected criteria.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
