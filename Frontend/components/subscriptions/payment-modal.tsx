"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Smartphone, Loader2, CheckCircle, XCircle } from "lucide-react"
import { processPayment } from "@/lib/actions/payments"
import { toast } from "sonner"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  plan: {
    id: number
    name: string
    price: number
    tokens: number
    duration: number
  }
  onSuccess: () => void
}

export default function PaymentModal({ isOpen, onClose, plan, onSuccess }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"mastercard" | "clictopay">("mastercard")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolder: "",
    phoneNumber: "",
    clictoPayPin: "",
  })

  const handlePayment = async () => {
    setIsProcessing(true)
    setPaymentStatus("processing")

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const result = await processPayment({
        planId: plan.id,
        paymentMethod,
        amount: plan.price,
        paymentData:
          paymentMethod === "mastercard"
            ? {
                cardNumber: formData.cardNumber,
                expiryDate: formData.expiryDate,
                cvv: formData.cvv,
                cardHolder: formData.cardHolder,
              }
            : {
                phoneNumber: formData.phoneNumber,
                pin: formData.clictoPayPin,
              },
      })

      if (result.success) {
        setPaymentStatus("success")
        toast.success("Paiement effectué avec succès!")
        setTimeout(() => {
          onSuccess()
          onClose()
          setPaymentStatus("idle")
        }, 2000)
      } else {
        setPaymentStatus("error")
        toast.error(result.error || "Erreur lors du paiement")
      }
    } catch (error) {
      setPaymentStatus("error")
      toast.error("Une erreur est survenue")
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setFormData({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardHolder: "",
      phoneNumber: "",
      clictoPayPin: "",
    })
    setPaymentStatus("idle")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (paymentStatus === "processing") {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h3 className="text-lg font-semibold">Traitement du paiement...</h3>
            <p className="text-sm text-muted-foreground text-center">
              Veuillez patienter pendant que nous traitons votre paiement.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (paymentStatus === "success") {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h3 className="text-lg font-semibold">Paiement réussi!</h3>
            <p className="text-sm text-muted-foreground text-center">
              Votre abonnement au plan {plan.name} a été activé avec succès.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (paymentStatus === "error") {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <XCircle className="h-12 w-12 text-red-500" />
            <h3 className="text-lg font-semibold">Paiement échoué</h3>
            <p className="text-sm text-muted-foreground text-center">
              Une erreur est survenue lors du traitement de votre paiement.
            </p>
            <Button onClick={() => setPaymentStatus("idle")} variant="outline">
              Réessayer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Finaliser votre abonnement</DialogTitle>
          <DialogDescription>
            Plan {plan.name} - {plan.price}DT pour {plan.duration} jours ({plan.tokens.toLocaleString()} tokens)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Méthode de paiement</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as "mastercard" | "clictopay")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mastercard" id="mastercard" />
                <Label htmlFor="mastercard" className="flex items-center gap-2 cursor-pointer">
                  <CreditCard className="h-4 w-4" />
                  Mastercard
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="clictopay" id="clictopay" />
                <Label htmlFor="clictopay" className="flex items-center gap-2 cursor-pointer">
                  <Smartphone className="h-4 w-4" />
                  ClictoPay
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Payment Forms */}
          {paymentMethod === "mastercard" ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Informations de carte
                </CardTitle>
                <CardDescription>Entrez vos informations de carte Mastercard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="cardHolder">Nom du titulaire</Label>
                    <Input
                      id="cardHolder"
                      placeholder="John Doe"
                      value={formData.cardHolder}
                      onChange={(e) => setFormData((prev) => ({ ...prev, cardHolder: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="cardNumber">Numéro de carte</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData((prev) => ({ ...prev, cardNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Date d'expiration</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={(e) => setFormData((prev) => ({ ...prev, cvv: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  ClictoPay
                </CardTitle>
                <CardDescription>Payez avec votre compte ClictoPay</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+216 XX XXX XXX"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="clictoPayPin">Code PIN ClictoPay</Label>
                  <Input
                    id="clictoPayPin"
                    type="password"
                    placeholder="****"
                    value={formData.clictoPayPin}
                    onChange={(e) => setFormData((prev) => ({ ...prev, clictoPayPin: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
              Annuler
            </Button>
            <Button onClick={handlePayment} disabled={isProcessing} className="flex-1">
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Payer {plan.price}DT
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
