import type { Metadata } from "next";
import LegalPage, {
  LegalSection,
  Section,
} from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Althea Systems",
  description:
    "Politique de confidentialité et protection des données personnelles conformément au RGPD.",
  alternates: { canonical: "/legal/privacy" },
};

const SECTIONS: LegalSection[] = [
  { id: "introduction", title: "Introduction" },
  { id: "responsable", title: "Responsable du traitement" },
  { id: "donnees", title: "Données collectées" },
  { id: "finalites", title: "Finalités du traitement" },
  { id: "cookies", title: "Cookies" },
  { id: "partage", title: "Partage des données" },
  { id: "securite", title: "Sécurité" },
  { id: "droits", title: "Vos droits (RGPD)" },
  { id: "transferts", title: "Transferts internationaux" },
  { id: "reclamation", title: "Réclamation" },
  { id: "modifications", title: "Modifications" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Protection des données"
      title="Politique de confidentialité"
      subtitle="Althea Systems s'engage à protéger la vie privée de ses utilisateurs. Ce document explique comment nous collectons, utilisons et protégeons vos données personnelles conformément au RGPD et à la loi Informatique et Libertés."
      updatedAt="21 avril 2026"
      sections={SECTIONS}
    >
      <Section id="introduction" title="1. Introduction">
        <p>
          Althea Systems (« nous », « notre », « nos ») s&apos;engage à protéger
          la vie privée de ses utilisateurs. Cette politique de confidentialité
          explique comment nous collectons, utilisons, stockons et protégeons
          vos données personnelles conformément au Règlement général sur la
          protection des données (RGPD) et à la loi Informatique et Libertés.
        </p>
      </Section>

      <Section id="responsable" title="2. Responsable du traitement">
        <ul>
          <li>
            <strong>Raison sociale :</strong> Althea Systems SAS
          </li>
          <li>
            <strong>Siège social :</strong> 42 rue de la Santé, 69003 Lyon,
            France
          </li>
          <li>
            <strong>Contact DPO :</strong>{" "}
            <a href="mailto:dpo@vjuya.me">dpo@vjuya.me</a>
          </li>
        </ul>
      </Section>

      <Section id="donnees" title="3. Données collectées">
        <p>Nous collectons les catégories de données suivantes :</p>

        <h3>3.1 Données d&apos;identification</h3>
        <ul>
          <li>Nom et prénom</li>
          <li>Adresse email</li>
          <li>Numéro de téléphone</li>
          <li>Adresse postale (livraison et facturation)</li>
        </ul>

        <h3>3.2 Données de connexion</h3>
        <ul>
          <li>Mot de passe (chiffré via bcrypt, jamais stocké en clair)</li>
          <li>
            Données d&apos;authentification à deux facteurs (2FA) si active
          </li>
          <li>Sessions et jetons d&apos;authentification</li>
        </ul>

        <h3>3.3 Données de commande</h3>
        <ul>
          <li>Historique des commandes</li>
          <li>Informations de paiement (traitées par Stripe, non stockées)</li>
          <li>Factures</li>
        </ul>

        <h3>3.4 Données techniques</h3>
        <ul>
          <li>
            Cookies de fonctionnement et de consentement (voir section 5)
          </li>
          <li>Logs anonymisés (sans email ni adresse IP en clair)</li>
        </ul>
      </Section>

      <Section id="finalites" title="4. Finalités du traitement">
        <table>
          <thead>
            <tr>
              <th>Finalité</th>
              <th>Base légale</th>
              <th>Durée de conservation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Gestion des comptes utilisateurs</td>
              <td>Exécution du contrat</td>
              <td>Durée du compte + 3 ans</td>
            </tr>
            <tr>
              <td>Traitement des commandes</td>
              <td>Exécution du contrat</td>
              <td>10 ans (obligation comptable)</td>
            </tr>
            <tr>
              <td>Sécurité et authentification</td>
              <td>Intérêt légitime</td>
              <td>Durée de la session</td>
            </tr>
            <tr>
              <td>Communication marketing</td>
              <td>Consentement</td>
              <td>Jusqu&apos;au retrait du consentement</td>
            </tr>
            <tr>
              <td>Obligations légales</td>
              <td>Obligation légale</td>
              <td>Durée prévue par la loi</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section id="cookies" title="5. Cookies">
        <p>
          Nous utilisons des cookies strictement nécessaires au fonctionnement
          du site. Avant de déposer tout cookie non essentiel, nous recueillons
          votre consentement explicite via notre bandeau cookies.
        </p>
        <h3>Types de cookies utilisés</h3>
        <ul>
          <li>
            <strong>Cookies essentiels :</strong> session d&apos;authentification,
            panier, préférences de consentement
          </li>
          <li>
            <strong>Cookies analytiques :</strong> uniquement avec votre
            consentement, pour améliorer nos services
          </li>
        </ul>
        <p>
          Vous pouvez modifier vos préférences de cookies à tout moment via le
          bandeau de consentement ou les paramètres de votre navigateur.
        </p>
      </Section>

      <Section id="partage" title="6. Partage des données">
        <p>
          Vos données personnelles ne sont jamais vendues. Elles peuvent être
          partagées avec :
        </p>
        <ul>
          <li>
            <strong>Stripe :</strong> traitement sécurisé des paiements
          </li>
          <li>
            <strong>Transporteurs :</strong> livraison de vos commandes (nom,
            adresse)
          </li>
          <li>
            <strong>Hébergeur :</strong> infrastructure cloud pour
            l&apos;hébergement du site
          </li>
          <li>
            <strong>Resend :</strong> envoi des emails transactionnels
          </li>
        </ul>
        <p>
          Tous nos sous-traitants sont soumis au RGPD ou offrent des garanties
          adéquates de protection des données.
        </p>
      </Section>

      <Section id="securite" title="7. Sécurité des données">
        <p>Nous mettons en place les mesures suivantes :</p>
        <ul>
          <li>Chiffrement des mots de passe avec bcrypt (saltRounds 12)</li>
          <li>Authentification à deux facteurs (TOTP) disponible</li>
          <li>Communications chiffrées (HTTPS / TLS)</li>
          <li>Protection contre XSS, CSRF et injections SQL</li>
          <li>Rate limiting sur les endpoints sensibles</li>
          <li>
            Logs anonymisés (aucune donnée personnelle en clair dans les logs)
          </li>
          <li>Headers de sécurité (Helmet, CSP)</li>
        </ul>
      </Section>

      <Section id="droits" title="8. Vos droits (RGPD)">
        <p>
          Conformément au RGPD et à la loi Informatique et Libertés, vous
          disposez des droits suivants :
        </p>
        <ul>
          <li>
            <strong>Droit d&apos;accès :</strong> obtenir une copie de vos
            données personnelles
          </li>
          <li>
            <strong>Droit de rectification :</strong> corriger vos données via
            votre espace compte
          </li>
          <li>
            <strong>Droit à l&apos;effacement :</strong> demander la suppression
            de votre compte et de toutes vos données (droit à l&apos;oubli)
          </li>
          <li>
            <strong>Droit à la portabilité :</strong> exporter vos données
            personnelles au format JSON
          </li>
          <li>
            <strong>Droit d&apos;opposition :</strong> vous opposer au
            traitement de vos données
          </li>
          <li>
            <strong>Droit à la limitation :</strong> restreindre le traitement
            de vos données
          </li>
        </ul>
        <p>
          Pour exercer vos droits, contactez notre DPO à{" "}
          <a href="mailto:dpo@vjuya.me">dpo@vjuya.me</a> ou utilisez les
          fonctionnalités disponibles dans votre espace compte :
        </p>
        <ul>
          <li>
            Export de données : <code>GET /api/profile/export</code>
          </li>
          <li>
            Suppression de compte : <code>DELETE /api/profile/delete</code>
          </li>
        </ul>
      </Section>

      <Section id="transferts" title="9. Transferts internationaux">
        <p>
          Vos données sont principalement hébergées au sein de l&apos;Union
          européenne. En cas de transfert hors UE (services cloud), nous nous
          assurons que des garanties adéquates sont en place (clauses
          contractuelles types, décisions d&apos;adéquation).
        </p>
      </Section>

      <Section id="reclamation" title="10. Réclamation">
        <p>
          Si vous estimez que le traitement de vos données n&apos;est pas
          conforme, vous pouvez introduire une réclamation auprès de la CNIL :
        </p>
        <ul>
          <li>
            <strong>CNIL :</strong> Commission Nationale de l&apos;Informatique
            et des Libertés
          </li>
          <li>
            <strong>Site :</strong>{" "}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.cnil.fr
            </a>
          </li>
          <li>
            <strong>Adresse :</strong> 3 Place de Fontenoy, TSA 80715, 75334
            Paris Cedex 07
          </li>
        </ul>
      </Section>

      <Section id="modifications" title="11. Modifications">
        <p>
          Cette politique de confidentialité peut être modifiée à tout moment.
          Les modifications prennent effet dès leur publication sur cette page.
          Nous vous informerons de tout changement substantiel par email ou
          notification sur le site.
        </p>
      </Section>
    </LegalPage>
  );
}
