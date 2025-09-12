import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Zap, Shield, BarChart3 } from "lucide-react"

export default async function HomePage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">OCR Invoice Service</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transformez vos factures PDF et images en données structurées avec notre service de reconnaissance
            automatique
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Commencer gratuitement
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>OCR Précis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Extraction automatique des données de factures avec une précision élevée
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-yellow-600 mb-2" />
              <CardTitle>Traitement Rapide</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Traitement en quelques secondes de vos documents PDF et images</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Sécurisé</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Vos données sont protégées avec un chiffrement de niveau entreprise</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Tableaux de bord et analyses détaillées de vos factures</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Prêt à automatiser vos factures ?</h2>
          <p className="text-gray-600 mb-6">
            Rejoignez des centaines d'entreprises qui font confiance à notre service OCR
          </p>
          <Link href="/register">
            <Button size="lg">Créer un compte gratuit</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
