import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UploadForm } from "@/components/upload/upload-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, Zap } from "lucide-react"

export default async function UploadPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Upload de Facture</h1>
        <p className="text-muted-foreground">
          Uploadez vos factures PDF ou images pour extraction automatique des données
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5 text-blue-600" />
              Formats supportés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>PDF, JPG, PNG, JPEG jusqu'à 10MB</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-green-600" />
              Extraction précise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Données structurées automatiquement extraites</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-yellow-600" />
              Traitement rapide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Résultats en quelques secondes</CardDescription>
          </CardContent>
        </Card>
      </div>

      <UploadForm user={user} />
    </div>
  )
}
