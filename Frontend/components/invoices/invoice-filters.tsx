"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search, Filter, X } from "lucide-react"

interface InvoiceFiltersProps {
  userId: number
}

export function InvoiceFilters({ userId }: InvoiceFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    supplier: searchParams.get("supplier") || "",
    dateFrom: searchParams.get("dateFrom") || "",
    dateTo: searchParams.get("dateTo") || "",
    minAmount: searchParams.get("minAmount") || "",
    maxAmount: searchParams.get("maxAmount") || "",
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: searchParams.get("sortOrder") || "desc",
  })

  const [suppliers, setSuppliers] = useState<Array<{ id: number; name: string }>>([])

  useEffect(() => {
    // Fetch suppliers for filter dropdown
    fetch(`/api/suppliers?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => setSuppliers(data))
      .catch(console.error)
  }, [userId])

  const applyFilters = () => {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })

    router.push(`/invoices?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      supplier: "",
      dateFrom: "",
      dateTo: "",
      minAmount: "",
      maxAmount: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    })
    router.push("/invoices")
  }

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== "sortBy" && key !== "sortOrder" && value,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtres et recherche
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Recherche</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Numéro, fournisseur..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Supplier */}
          <div className="space-y-2">
            <Label htmlFor="supplier">Fournisseur</Label>
            <Select value={filters.supplier} onValueChange={(value) => setFilters({ ...filters, supplier: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les fournisseurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les fournisseurs</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          <div className="space-y-2">
            <Label htmlFor="dateFrom">Date de début</Label>
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <Label htmlFor="dateTo">Date de fin</Label>
            <Input
              id="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </div>

          {/* Min Amount */}
          <div className="space-y-2">
            <Label htmlFor="minAmount">Montant min</Label>
            <Input
              id="minAmount"
              type="number"
              placeholder="0"
              value={filters.minAmount}
              onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
            />
          </div>

          {/* Max Amount */}
          <div className="space-y-2">
            <Label htmlFor="maxAmount">Montant max</Label>
            <Input
              id="maxAmount"
              type="number"
              placeholder="10000"
              value={filters.maxAmount}
              onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
            />
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label htmlFor="sortBy">Trier par</Label>
            <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date de création</SelectItem>
                <SelectItem value="dateEmission">Date d'émission</SelectItem>
                <SelectItem value="totalTTC">Montant TTC</SelectItem>
                <SelectItem value="numero">Numéro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Ordre</Label>
            <Select value={filters.sortOrder} onValueChange={(value) => setFilters({ ...filters, sortOrder: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Décroissant</SelectItem>
                <SelectItem value="asc">Croissant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={applyFilters}>Appliquer les filtres</Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Effacer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
