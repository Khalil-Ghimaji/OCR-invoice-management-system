import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { Users, FileText, CreditCard, Activity, TrendingUp, AlertTriangle } from "lucide-react"
import { AdminCharts } from "./admin-charts"
import { RecentActivity } from "./recent-activity"

export async function AdminDashboard() {
  const [totalUsers, totalInvoices, totalRevenue, activeSubscriptions, recentUsers, recentInvoices] = await Promise.all(
    [
      prisma.user.count(),
      prisma.facture.count(),
      prisma.facture.aggregate({
        _sum: { totalTTC: true },
      }),
      prisma.abonnement.count({
        where: {
          dateFin: { gte: new Date() },
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { abonnement: true },
      }),
      prisma.facture.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: true, supplier: true },
      }),
    ],
  )

  const stats = [
    {
      title: "Utilisateurs Total",
      value: totalUsers.toString(),
      icon: Users,
      description: "Comptes créés",
      trend: "+12% ce mois",
    },
    {
      title: "Factures Traitées",
      value: totalInvoices.toString(),
      icon: FileText,
      description: "Documents OCR",
      trend: "+8% ce mois",
    },
    {
      title: "Chiffre d'Affaires",
      value: `${(totalRevenue._sum.totalTTC || 0).toLocaleString("fr-FR")} DT`,
      icon: TrendingUp,
      description: "Total facturé",
      trend: "+15% ce mois",
    },
    {
      title: "Abonnements Actifs",
      value: activeSubscriptions.toString(),
      icon: CreditCard,
      description: "Comptes payants",
      trend: "+5% ce mois",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <AdminCharts />
        <RecentActivity recentUsers={recentUsers} recentInvoices={recentInvoices} />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actions Rapides
          </CardTitle>
          <CardDescription>Accès rapide aux fonctions d'administration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <a
              href="/admin/users"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold">Gestion Utilisateurs</h3>
                <p className="text-sm text-muted-foreground">Gérer les comptes et abonnements</p>
              </div>
            </a>

            <a
              href="/admin/invoices"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <FileText className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold">Gestion Factures</h3>
                <p className="text-sm text-muted-foreground">Consulter toutes les factures</p>
              </div>
            </a>

            <a
              href="/admin/audit"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <h3 className="font-semibold">Logs d'Audit</h3>
                <p className="text-sm text-muted-foreground">Surveiller l'activité système</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
