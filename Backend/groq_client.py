import json
import base64
from groq import Groq
from typing import Dict, Any, Optional, List
from pathlib import Path
from pdf2image import convert_from_path
from io import BytesIO
from PIL import Image


class InvoiceOCR:
    def __init__(self, api_key: Optional[str] = None, seed: int = 42, max_width: int = 1200):
        """
        Initialise le client Groq pour l'OCR de factures multi-pages.

        Args:
            api_key: Clé API Groq (optionnel si configurée en variable d'environnement GROQ_API_KEY)
            seed: Seed pour reproductibilité
            max_width: Largeur maximale des images pour réduire la taille des payloads
        """
        self.client = Groq(api_key=api_key) if api_key else Groq()
        self.model = "meta-llama/llama-4-scout-17b-16e-instruct"
        self.seed = seed
        self.max_width = max_width

    def _encode_image(self, image: Image.Image) -> str:
        """Encode une image PIL en base64 après redimensionnement si nécessaire."""
        if image.width > self.max_width:
            ratio = self.max_width / image.width
            new_height = int(image.height * ratio)
            image = image.resize((self.max_width, new_height), Image.LANCZOS)

        buffered = BytesIO()
        image.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode("utf-8")

    def _images_from_file(self, file_path: str) -> List[Image.Image]:
        """Retourne une liste d'images PIL à partir d'un fichier image ou PDF."""
        ext = Path(file_path).suffix.lower()
        if ext in [".pdf"]:
            return convert_from_path(file_path)
        else:
            return [Image.open(file_path)]

    def _make_completion_json(self, messages: list) -> str:
        """Effectue la requête au modèle Llama-4 Vision avec sortie JSON."""
        completion = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.0,
            max_completion_tokens=2048,
            top_p=1.0,
            stream=False,
            response_format={"type": "json_object"},
            seed=self.seed
        )
        return completion.choices[0].message.content

    def _extract_from_images(self, images: List[Image.Image], prompt: str) -> Dict[str, Any]:
        """
        Envoie toutes les images dans un seul message pour conserver le contexte multi-pages.
        """
        content = [{"type": "text", "text": prompt}]
        for img in images:
            b64_img = self._encode_image(img)
            content.append({"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64_img}"}})

        messages = [{"role": "user", "content": content}]
        response = self._make_completion_json(messages)

        try:
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            json_text = response[json_start:json_end]
            return json.loads(json_text)
        except json.JSONDecodeError:
            return {"erreur": "Parsing JSON échoué", "texte_brut": response}

    # --------- PUBLIC METHODS --------- #

    def extract_invoice_simple(self, file_path: str) -> Dict[str, Any]:
        if not Path(file_path).exists():
            raise FileNotFoundError(f"Le fichier {file_path} n'existe pas")

        prompt = """Tu es un expert en OCR de factures. Extrait les informations essentielles de cette facture.

        INSTRUCTIONS:
        - Lis attentivement le document.
        - Si une information est absente ou illisible, mets "Non spécifié".
        - Respecte la devise telle qu'affichée (ex: TND, EUR, USD).
        - Les dates doivent être ramenées au format ISO 8601 "YYYY-MM-DDT00:00:00.000Z" si elles sont présentes (sinon "Non spécifié").

        RÉPONSE REQUISE: JSON STRICT avec cette structure EXACTE:
        {
          "fournisseur": "[Nom/raison sociale du vendeur]",
          "acheteur": "[Nom/raison sociale de l'acheteur]",
          "numero_facture": "[Numéro de facture]",
          "date_emission": "[YYYY-MM-DDT00:00:00.000Z ou 'Non spécifié']",
          "date_echeance": "[YYYY-MM-DDT00:00:00.000Z ou 'Non spécifié']",
          "devise": "[Devise, ex: TND/EUR/USD ou 'Non spécifié']",
          "total_ttc": "[Montant total TTC tel qu'affiché ou 'Non spécifié']"
        }

        Fournis UNIQUEMENT le JSON, sans texte additionnel.
        """
        images = self._images_from_file(file_path)
        return self._extract_from_images(images, prompt)

    def extract_invoice(self, file_path: str) -> Dict[str, Any]:
        if not Path(file_path).exists():
            raise FileNotFoundError(f"Le fichier {file_path} n'existe pas")

        prompt = """Tu es un expert en OCR de factures (invoices) multi-langues.

        TÂCHE:
        - Extraire TOUT le texte structuré d'une facture: en-têtes, infos vendeur/acheteur, items, taxes, totaux, moyens de paiement.

        RÈGLES:
        - Pour les champs non visibles/illisibles, utiliser "Non spécifié".
        - Préserver l'orthographe et les montants tels qu'affichés.
        - Les nombres peuvent contenir virgule ou point selon le document (ne pas convertir).
        - Les dates doivent être ramenées au format ISO 8601 "YYYY-MM-DDT00:00:00.000Z" si identifiables, sinon "Non spécifié".
        - Respecter la devise telle qu'affichée (ex: TND/EUR/USD).
        - Conserver l'ordre visuel des lignes d'articles.
        - garde les montants sans leurs devise.

        RÉPONSE REQUISE: JSON STRICT avec cette structure EXACTE:
        {
          "document": {
            "type": "invoice",
            "langue": "[Langue dominante détectée]",
            "source": "[Nom du fichier si visible sur l'image sinon 'Non spécifié']"
          },
          "fournisseur": {
            "nom": "[Nom/raison sociale]",
            "adresse": "[Adresse complète ou 'Non spécifié']",
            "identifiants_fiscaux": "[Matricule TVA/SIRET/etc. ou 'Non spécifié']",
            "email": "[Email ou 'Non spécifié']",
            "telephone": "[Téléphone ou 'Non spécifié']",
            "site_web": "[URL ou 'Non spécifié']",
            "iban": "[IBAN ou 'Non spécifié']",
            "bic_swift": "[BIC/SWIFT ou 'Non spécifié']"
          },
          "acheteur": {
            "nom": "[Nom/raison sociale]",
            "adresse": "[Adresse complète ou 'Non spécifié']",
            "identifiants_fiscaux": "[TVA/SIRET/etc. ou 'Non spécifié']",
            "email": "[Email ou 'Non spécifié']",
            "telephone": "[Téléphone ou 'Non spécifié']"
          },
          "facture": {
            "numero": "[Numéro de facture]",
            "date_emission": "[YYYY-MM-DDT00:00:00.000Z ou 'Non spécifié']",
            "date_echeance": "[YYYY-MM-DDT00:00:00.000Z ou 'Non spécifié']",
            "commande_ref": "[Bon de commande ou 'Non spécifié']",
            "conditions_paiement": "[Conditions de paiement ou 'Non spécifié']",
            "devise": "[Devise, ex: TND/EUR/USD ou 'Non spécifié']"
          },
          "lignes": [
            {
              "description": "[Texte de ligne]",
              "code_article": "[Code/SKU ou 'Non spécifié']",
              "quantite": "[Quantité telle qu'affichée ou 'Non spécifié']",
              "unite": "[Unité (ex: pcs, h, kg) ou 'Non spécifié']",
              "prix_unitaire_ht": "[PU HT tel qu'affiché ou 'Non spécifié']",
              "taux_tva": "[% TVA tel qu'affiché ou 'Non spécifié']",
              "montant_ht": "[Montant HT ligne ou 'Non spécifié']",
              "montant_ttc": "[Montant TTC ligne ou 'Non spécifié']"
            }
          ],
          "totaux": {
            "sous_total_ht": "[Sous-total HT ou 'Non spécifié']",
            "total_tva": "[Total TVA ou 'Non spécifié']",
            "remise": "[Montant remise globale ou 'Non spécifié']",
            "frais": "[Frais de service/port ou 'Non spécifié']",
            "total_ttc": "[Total TTC ou 'Non spécifié']",
            "deja_regle": "[Acompte/déjà payé ou 'Non spécifié']",
            "reste_a_payer": "[Solde dû ou 'Non spécifié']"
          },
          "paiement": {
            "moyens_acceptes": "[Liste ou 'Non spécifié']",
            "instructions": "[Instructions de paiement ou 'Non spécifié']",
            "reference_paiement": "[Référence de virement/ID paiement ou 'Non spécifié']"
          },
          "notes": "[Notes/mentions légales/autres]",
          "texte_brut_complet": "[Transcription exacte de TOUT le texte visible]"
        }

        Fournis UNIQUEMENT le JSON, sans texte additionnel.
        """
        images = self._images_from_file(file_path)
        return self._extract_from_images(images, prompt)
