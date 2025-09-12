"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface Company {
  id: number
  name: string
  type: "CLIENT" | "SUPPLIER" | "BOTH"
}

export function AnalyticsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([])
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [companyType, setCompanyType] = useState<string>("all")

  // Load companies on mount
  useEffect(() => {
    fetchCompanies()
    loadFiltersFromURL()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/companies")
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
    }
  }

  const loadFiltersFromURL = () => {
    const companiesParam = searchParams.get("companies")
    if (companiesParam) {
      setSelectedCompanies(companiesParam.split(",").map(Number))
    }

    const startDateParam = searchParams.get("startDate")
    if (startDateParam) {
      setStartDate(new Date(startDateParam))
    }

    const endDateParam = searchParams.get("endDate")
    if (endDateParam) {
      setEndDate(new Date(endDateParam))
    }

    setMinAmount(searchParams.get("minAmount") || "")
    setMaxAmount(searchParams.get("maxAmount") || "")
    setCompanyType(searchParams.get("companyType") || "all")
  }

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (selectedCompanies.length > 0) {
      params.set("companies", selectedCompanies.join(","))
    }

    if (startDate) {
      params.set("startDate", startDate.toISOString())
    }

    if (endDate) {
      params.set("endDate", endDate.toISOString())
    }

    if (minAmount) {
      params.set("minAmount", minAmount)
    }

    if (maxAmount) {
      params.set("maxAmount", maxAmount)
    }

    if (companyType !== "all") {
      params.set("companyType", companyType)
    }

    router.push(`/analytics?${params.toString()}`)
  }

  const clearFilters = () => {
    setSelectedCompanies([])
    setStartDate(undefined)
    setEndDate(undefined)
    setMinAmount("")
    setMaxAmount("")
    setCompanyType("all")
    router.push("/analytics")
  }

  const toggleCompany = (companyId: number) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyId) ? prev.filter((id) => id !== companyId) : [...prev, companyId],
    )
  }

  const filteredCompanies = companies.filter(
    (company) => companyType === "all" || company.type === companyType || company.type === "BOTH",
  )

  return (
    <div className="space-y-6">
      {/* Company Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Companies</Label>
        <div className="flex gap-2 mb-3">
          <Select value={companyType} onValueChange={setCompanyType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="CLIENT">Clients Only</SelectItem>
              <SelectItem value="SUPPLIER">Suppliers Only</SelectItem>
              <SelectItem value="BOTH">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="flex items-center space-x-2">
              <Checkbox
                id={`company-${company.id}`}
                checked={selectedCompanies.includes(company.id)}
                onCheckedChange={() => toggleCompany(company.id)}
              />
              <Label htmlFor={`company-${company.id}`} className="text-sm cursor-pointer flex-1">
                {company.name}
                <Badge variant="outline" className="ml-2 text-xs">
                  {company.type}
                </Badge>
              </Label>
            </div>
          ))}
        </div>

        {selectedCompanies.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedCompanies.map((companyId) => {
              const company = companies.find((c) => c.id === companyId)
              return company ? (
                <Badge key={companyId} variant="secondary" className="text-xs">
                  {company.name}
                  <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => toggleCompany(companyId)} />
                </Badge>
              ) : null
            })}
          </div>
        )}
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Select start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Select end date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Amount Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minAmount">Minimum Amount</Label>
          <Input
            id="minAmount"
            type="number"
            placeholder="0.00"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxAmount">Maximum Amount</Label>
          <Input
            id="maxAmount"
            type="number"
            placeholder="10000.00"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={applyFilters} className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Apply Filters
        </Button>
        <Button variant="outline" onClick={clearFilters}>
          Clear All
        </Button>
      </div>
    </div>
  )
}
