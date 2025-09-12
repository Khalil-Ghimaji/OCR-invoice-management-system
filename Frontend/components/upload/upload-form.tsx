"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { uploadInvoiceAction } from "@/lib/actions/upload"
import { OCRResultDisplay } from "./ocr-result-display"
import type { UserWithAbonnement } from "@/lib/types"
import { Upload, FileText, AlertCircle, CheckCircle, Coins } from "lucide-react"

interface UploadFormProps {
  user: UserWithAbonnement
}

export function UploadForm({ user }: UploadFormProps) {
  const [state, formAction, pending] = useActionState(uploadInvoiceAction, null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const tokensRemaining = user.abonnement?.tokensRestants || 0

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
      }
    }
  }

  const validateFile = (file: File) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      alert("Format de fichier non supporté. Utilisez PDF, JPG, PNG ou JPEG.")
      return false
    }

    if (file.size > maxSize) {
      alert("Le fichier est trop volumineux. Taille maximum : 10MB.")
      return false
    }

    return true
  }

  const handleSubmit = async (formData: FormData) => {
    if (selectedFile) {
      formData.append("file", selectedFile)
    }
    formAction(formData)
  }

  // If OCR was successful, show results
  if (state?.success && state?.ocrResult) {
    return (
      <div className="space-y-6">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Facture traitée avec succès ! Les données ont été extraites et sauvegardées.
          </AlertDescription>
        </Alert>

        <OCRResultDisplay ocrResult={state.ocrResult} invoiceId={state.invoiceId} />

        <div className="flex gap-4">
          <Button
            onClick={() => {
              setSelectedFile(null)
              setDragActive(false)
              if (fileInputRef.current) {
                fileInputRef.current.value = ""
              }
              // Reset state by reloading
              window.location.reload()
            }}
          >
            Traiter une autre facture
          </Button>
          <Button variant="outline" asChild>
            <a href={`/invoices/${state.invoiceId}`}>Voir la facture</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Token Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Tokens disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{tokensRemaining}</p>
              <p className="text-sm text-muted-foreground">Abonnement {user.abonnement?.type || "BASIC"}</p>
            </div>
            <Badge variant={tokensRemaining > 0 ? "default" : "destructive"}>
              {tokensRemaining > 0 ? "Actif" : "Épuisé"}
            </Badge>
          </div>
          {tokensRemaining === 0 && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vous n'avez plus de tokens. Contactez l'administrateur pour renouveler votre abonnement.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de Facture</CardTitle>
          <CardDescription>Glissez-déposez votre facture ou cliquez pour sélectionner un fichier</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {/* Drag & Drop Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={pending || tokensRemaining === 0}
              />

              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>

                {selectedFile ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">{selectedFile.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Glissez votre facture ici ou cliquez pour sélectionner</p>
                    <p className="text-sm text-muted-foreground">PDF, JPG, PNG jusqu'à 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Messages */}
            {state?.errors && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{Object.values(state.errors).flat().join(", ")}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={!selectedFile || pending || tokensRemaining === 0}>
              {pending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Traitement en cours...
                </div>
              ) : (
                `Traiter la facture (1 token)`
              )}
            </Button>

            {/* Progress Bar */}
            {pending && (
              <div className="space-y-2">
                <Progress value={undefined} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">Extraction des données en cours...</p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
