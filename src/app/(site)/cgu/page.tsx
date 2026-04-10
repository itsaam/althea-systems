import type { Metadata } from "next";
import LegalPage, {
  LegalSection,
  Section,
} from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description:
    "Conditions générales de vente Althea Systems : commandes, livraison, paiement, garanties, rétractation et service après-vente.",
  alternates: { canonical: "/cgu" },
};

const SECTIONS: LegalSection[] = [
  { id: "objet", title: "Objet" },
  { id: "produits", title: "Produits et prix" },
  { id: "commandes", title: "Commandes" },
  { id: "paiement", title: "Paiement" },
  { id: "livraison", title: "Livraison" },
  { id: "retractation", title: "Droit de rétractation" },
  { id: "garanties", title: "Garanties" },
  { id: "responsabilite", title: "Responsabilité" },
  { id: "donnees", title: "Données personnelles" },
  { id: "litiges", title: "Litiges et droit applicable" },
];

export default function CGUPage() {
  return (
    <LegalPage
      eyebrow="Informations légales"
      title="Conditions générales de vente"
      subtitle="Les présentes conditions régissent l'ensemble des ventes réalisées sur le site althea-systems.com entre Althea Systems et ses clients professionnels et particuliers."
      updatedAt="10 avril 2026"
      sections={SECTIONS}
    >
      <Section id="objet" title="1. Objet">
        <p>
          Les présentes conditions générales de vente (ci-après{" "}
          <strong>« CGV »</strong>) s&apos;appliquent, sans restriction ni
          réserve, à l&apos;ensemble des ventes conclues entre Althea Systems,
          société dont le siège est situé en France, et ses clients, qu&apos;ils
          soient professionnels de santé, structures de soins ou particuliers,
          sur le site althea-systems.com.
        </p>
        <p>
          Toute commande passée sur le site implique l&apos;acceptation
          préalable, sans réserve, des présentes CGV. Althea Systems se réserve
          le droit de modifier ses CGV à tout moment : les conditions
          applicables sont celles en vigueur à la date de validation de la
          commande.
        </p>
      </Section>

      <Section id="produits" title="2. Produits et prix">
        <p>
          Les produits proposés à la vente sont décrits avec le maximum de
          précision possible. Les photographies, visuels et textes descriptifs
          n&apos;ont qu&apos;une valeur indicative et n&apos;entrent pas dans
          le champ contractuel.
        </p>
        <p>
          Les prix sont indiqués en euros, hors taxes (HT) et toutes taxes
          comprises (TTC), hors frais de livraison. Althea Systems se réserve
          le droit de modifier ses prix à tout moment, étant entendu que le
          prix figurant au catalogue le jour de la commande sera seul
          applicable à l&apos;acheteur.
        </p>
        <p>
          Certains produits sont réservés aux professionnels de santé et
          nécessitent la vérification d&apos;une qualification (numéro RPPS,
          ADELI ou équivalent). Althea Systems se réserve le droit de refuser
          toute commande ne satisfaisant pas à ces exigences réglementaires.
        </p>
      </Section>

      <Section id="commandes" title="3. Commandes">
        <p>
          Toute commande passée sur le site constitue la formation d&apos;un
          contrat conclu à distance entre le client et Althea Systems.
        </p>
        <ul>
          <li>
            La commande est validée après confirmation du paiement et envoi
            d&apos;un email récapitulatif.
          </li>
          <li>
            Althea Systems se réserve le droit d&apos;annuler ou de refuser
            toute commande d&apos;un client avec lequel existerait un litige
            relatif au paiement d&apos;une commande antérieure.
          </li>
          <li>
            Les commandes sont conservées par Althea Systems pendant la durée
            légale et peuvent être consultées par le client dans son espace
            personnel.
          </li>
        </ul>
      </Section>

      <Section id="paiement" title="4. Paiement">
        <p>
          Le paiement des commandes s&apos;effectue intégralement à la
          commande, via notre prestataire sécurisé <strong>Stripe</strong>{" "}
          (certifié PCI-DSS niveau 1). Les moyens de paiement acceptés sont :
        </p>
        <ul>
          <li>Cartes bancaires Visa, Mastercard, American Express</li>
          <li>Virement bancaire (pour les commandes professionnelles)</li>
          <li>
            Paiement différé sur facture (selon conditions d&apos;encours
            validées par Althea Systems)
          </li>
        </ul>
        <p>
          Aucune donnée bancaire n&apos;est stockée sur les serveurs
          d&apos;Althea Systems. Tous les échanges s&apos;effectuent via une
          connexion chiffrée TLS 1.3.
        </p>
      </Section>

      <Section id="livraison" title="5. Livraison">
        <p>
          Les produits sont livrés à l&apos;adresse de livraison indiquée par
          le client lors de la commande. Les délais de livraison sont les
          suivants :
        </p>
        <ul>
          <li>
            <strong>France métropolitaine :</strong> 24 à 48 heures ouvrées
          </li>
          <li>
            <strong>Union européenne :</strong> 3 à 5 jours ouvrés
          </li>
          <li>
            <strong>Reste du monde :</strong> 7 à 10 jours ouvrés
          </li>
        </ul>
        <p>
          Les frais de livraison sont calculés automatiquement en fonction du
          poids et de la destination. La livraison est offerte pour toute
          commande supérieure à 100 € en France métropolitaine.
        </p>
        <p>
          En cas de retard, le client est invité à contacter le service
          clients à l&apos;adresse <a href="mailto:support@althea-systems.com">support@althea-systems.com</a>.
        </p>
      </Section>

      <Section id="retractation" title="6. Droit de rétractation">
        <p>
          Conformément aux articles L.221-18 et suivants du Code de la
          consommation, le client particulier dispose d&apos;un délai de{" "}
          <strong>14 jours francs</strong> à compter de la réception du produit
          pour exercer son droit de rétractation, sans avoir à justifier de
          motif ni à payer de pénalité.
        </p>
        <p>
          Ce droit ne s&apos;applique pas aux produits :
        </p>
        <ul>
          <li>
            Descellés par le client après la livraison et qui ne peuvent être
            renvoyés pour des raisons d&apos;hygiène ou de protection de la
            santé
          </li>
          <li>Fabriqués ou personnalisés selon les spécifications du client</li>
          <li>
            Commandés par un professionnel dans le cadre de son activité
            (hors délai légal de garantie)
          </li>
        </ul>
        <p>
          Pour exercer son droit de rétractation, le client doit contacter
          Althea Systems et renvoyer les produits, à ses frais, dans leur
          emballage d&apos;origine et en état de revente.
        </p>
      </Section>

      <Section id="garanties" title="7. Garanties">
        <p>
          Tous les produits bénéficient de plein droit et sans paiement
          complémentaire :
        </p>
        <ul>
          <li>
            De la <strong>garantie légale de conformité</strong>, pour les
            produits apparemment défectueux, abîmés ou endommagés ou ne
            correspondant pas à la commande (articles L.217-4 et suivants du
            Code de la consommation)
          </li>
          <li>
            De la <strong>garantie légale contre les vices cachés</strong>{" "}
            provenant d&apos;un défaut de matière, de conception ou de
            fabrication affectant les produits livrés et les rendant impropres
            à l&apos;utilisation (articles 1641 et suivants du Code civil)
          </li>
        </ul>
        <p>
          Certains équipements bénéficient en outre d&apos;une garantie
          constructeur, dont la durée et les modalités sont précisées sur la
          fiche produit.
        </p>
      </Section>

      <Section id="responsabilite" title="8. Responsabilité">
        <p>
          Althea Systems est distributeur d&apos;équipements médicaux et ne
          peut être tenue responsable des dommages résultant d&apos;une
          utilisation non conforme aux prescriptions du fabricant, aux normes
          en vigueur ou aux indications figurant dans les notices
          d&apos;utilisation.
        </p>
        <p>
          La responsabilité d&apos;Althea Systems ne peut en aucun cas excéder
          le montant de la commande concernée.
        </p>
      </Section>

      <Section id="donnees" title="9. Données personnelles">
        <p>
          Les données personnelles collectées dans le cadre de la vente à
          distance sont traitées conformément au Règlement Général sur la
          Protection des Données (RGPD) et à la loi Informatique et Libertés.
          Pour plus d&apos;informations, consultez notre{" "}
          <a href="/legal/privacy">politique de confidentialité</a>.
        </p>
      </Section>

      <Section id="litiges" title="10. Litiges et droit applicable">
        <p>
          Les présentes CGV sont soumises au droit français. En cas de litige,
          une solution amiable sera recherchée avant toute action judiciaire.
          À défaut, les tribunaux français seront seuls compétents.
        </p>
        <p>
          Conformément aux articles L.611-1 et suivants du Code de la
          consommation, le client consommateur peut recourir gratuitement au
          service de médiation{" "}
          <a
            href="https://www.mediateur-conso.fr"
            target="_blank"
            rel="noopener noreferrer"
          >
            MEDIATEUR-CONSO
          </a>{" "}
          en vue de la résolution amiable du litige qui l&apos;opposerait à
          Althea Systems.
        </p>
      </Section>
    </LegalPage>
  );
}
