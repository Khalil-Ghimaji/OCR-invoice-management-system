"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { useEffect, useState } from "react"

export function AdminCharts() {
  const [data, setData] = useState<{
    userGrowth: Array<{ month: string; users: number; invoices: number }>
    subscriptionTypes: Array<{ type: string; count: number }>
  } | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/admin/charts")
        const chartData = await response.json()
        setData(chartData)
      } catch (error) {
        console.error("Error fetching admin chart data:", error)
      }
    }

    fetchData()
  }, [])

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chargement des graphiques...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Croissance Utilisateurs</CardTitle>
        <CardDescription>Évolution des inscriptions et factures traitées</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} name="Utilisateurs" />
              <Line type="monotone" dataKey="invoices" stroke="#82ca9d" strokeWidth={2} name="Factures" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
