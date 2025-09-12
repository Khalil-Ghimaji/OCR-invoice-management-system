"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2, Plus } from "lucide-react"
import { createSubscriptionPlan } from "@/lib/actions/admin"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function CreatePlanForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [features, setFeatures] = useState([""])
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const featuresArray = features.filter((f) => f.trim() !== "")
      const result = await createSubscriptionPlan(formData, featuresArray)

      if (result.success) {
        toast.success("Plan créé avec succès!")
        router.refresh()
        // Reset form
        setFeatures([""])
      } else {
        toast.error(result.error || "Erreur lors de la création")
      }
    } catch (error) {
      toast.error("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const addFeature = () => {
    setFeatures([...features, ""])
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un Nouveau Plan</CardTitle>
        <CardDescription>Ajoutez un nouveau plan d'abonnement à votre service OCR</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du Plan</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Prix (DT)</Label>
              <Input id="price" name="price" type="number" step="0.01" min="0" required />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tokens">Nombre de Tokens</Label>
              <Input id="tokens" name="tokens" type="number" min="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Durée (jours)</Label>
              <Input id="duration" name="duration" type="number" min="1" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" />
          </div>

          <div className="space-y-4">
            <Label>Fonctionnalités</Label>
            {features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  placeholder="Décrivez une fonctionnalité..."
                />
                {features.length > 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeFeature(index)}>
                    Supprimer
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addFeature}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une fonctionnalité
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="isActive" name="isActive" defaultChecked />
            <Label htmlFor="isActive">Plan actif</Label>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer le Plan
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
