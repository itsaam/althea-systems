import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité - Althea Systems",
  description:
    "Politique de confidentialité et protection des données personnelles conformément au RGPD",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-8 prose max-w-4xl mx-auto">
      <h1>Politique de Confidentialité</h1>
      <p className="text-muted-foreground">
        Derniere mise a jour : 26 mars 2026
      </p>

      <section>
        <h2>1. Introduction</h2>
        <p>
          Althea Systems (&quot;nous&quot;, &quot;notre&quot;, &quot;nos&quot;)
          s&apos;engage a proteger la vie privee de ses utilisateurs. Cette
          politique de confidentialite explique comment nous collectons,
          utilisons, stockons et protegeons vos donnees personnelles
          conformement au Reglement General sur la Protection des Donnees (RGPD)
          et a la loi Informatique et Libertes.
        </p>
      </section>

      <section>
        <h2>2. Responsable du traitement</h2>
        <ul>
          <li>
            <strong>Raison sociale :</strong> Althea Systems
          </li>
          <li>
            <strong>Adresse :</strong> France
          </li>
          <li>
            <strong>Contact DPO :</strong> dpo@vjuya.me
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Donnees collectees</h2>
        <p>Nous collectons les categories de donnees suivantes :</p>
        <h3>3.1 Donnees d&apos;identification</h3>
        <ul>
          <li>Nom et prenom</li>
          <li>Adresse email</li>
          <li>Numero de telephone</li>
          <li>Adresse postale (livraison et facturation)</li>
        </ul>
        <h3>3.2 Donnees de connexion</h3>
        <ul>
          <li>Mot de passe (chiffre via bcrypt, jamais stocke en clair)</li>
          <li>
            Donnees d&apos;authentification a deux facteurs (2FA) si active
          </li>
          <li>Sessions et jetons d&apos;authentification</li>
        </ul>
        <h3>3.3 Donnees de commande</h3>
        <ul>
          <li>Historique des commandes</li>
          <li>Informations de paiement (traitees par Stripe, non stockees)</li>
          <li>Factures</li>
        </ul>
        <h3>3.4 Donnees techniques</h3>
        <ul>
          <li>
            Cookies de fonctionnement et de consentement (voir section cookies)
          </li>
          <li>Logs anonymises (sans email ni adresse IP en clair)</li>
        </ul>
      </section>

      <section>
        <h2>4. Finalites du traitement</h2>
        <table>
          <thead>
            <tr>
              <th>Finalite</th>
              <th>Base legale</th>
              <th>Duree de conservation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Gestion des comptes utilisateurs</td>
              <td>Execution du contrat</td>
              <td>Duree du compte + 3 ans</td>
            </tr>
            <tr>
              <td>Traitement des commandes</td>
              <td>Execution du contrat</td>
              <td>10 ans (obligation comptable)</td>
            </tr>
            <tr>
              <td>Securite et authentification</td>
              <td>Interet legitime</td>
              <td>Duree de la session</td>
            </tr>
            <tr>
              <td>Communication marketing</td>
              <td>Consentement</td>
              <td>Jusqu&apos;au retrait du consentement</td>
            </tr>
            <tr>
              <td>Obligations legales</td>
              <td>Obligation legale</td>
              <td>Duree prevue par la loi</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>5. Cookies</h2>
        <p>
          Nous utilisons des cookies strictement necessaires au fonctionnement
          du site. Avant de deposer tout cookie non essentiel, nous recueillons
          votre consentement explicite via notre bandeau cookies.
        </p>
        <h3>Types de cookies utilises</h3>
        <ul>
          <li>
            <strong>Cookies essentiels :</strong> session d&apos;authentification,
            panier, preferences de consentement
          </li>
          <li>
            <strong>Cookies analytiques :</strong> uniquement avec votre
            consentement, pour ameliorer nos services
          </li>
        </ul>
        <p>
          Vous pouvez modifier vos preferences de cookies a tout moment via le
          bandeau de consentement ou les parametres de votre navigateur.
        </p>
      </section>

      <section>
        <h2>6. Partage des donnees</h2>
        <p>
          Vos donnees personnelles ne sont jamais vendues. Elles peuvent etre
          partagees avec :
        </p>
        <ul>
          <li>
            <strong>Stripe :</strong> pour le traitement securise des paiements
          </li>
          <li>
            <strong>Transporteurs :</strong> pour la livraison de vos commandes
            (nom, adresse)
          </li>
          <li>
            <strong>Hebergeur :</strong> Vercel / infrastructure cloud pour
            l&apos;hebergement du site
          </li>
        </ul>
        <p>
          Tous nos sous-traitants sont soumis au RGPD ou offrent des garanties
          adequates de protection des donnees.
        </p>
      </section>

      <section>
        <h2>7. Securite des donnees</h2>
        <p>Nous mettons en place les mesures suivantes :</p>
        <ul>
          <li>Chiffrement des mots de passe avec bcrypt (saltRounds 12)</li>
          <li>Authentification a deux facteurs (TOTP) disponible</li>
          <li>Communications chiffrees (HTTPS/TLS)</li>
          <li>Protection contre XSS, CSRF et injections SQL</li>
          <li>Rate limiting sur les endpoints sensibles</li>
          <li>
            Logs anonymises (aucune donnee personnelle en clair dans les logs)
          </li>
          <li>Headers de securite (Helmet, CSP)</li>
        </ul>
      </section>

      <section>
        <h2>8. Vos droits (RGPD)</h2>
        <p>
          Conformement au RGPD et a la loi Informatique et Libertes, vous
          disposez des droits suivants :
        </p>
        <ul>
          <li>
            <strong>Droit d&apos;acces :</strong> obtenir une copie de vos
            donnees personnelles
          </li>
          <li>
            <strong>Droit de rectification :</strong> corriger vos donnees via
            votre espace compte
          </li>
          <li>
            <strong>Droit a l&apos;effacement :</strong> demander la
            suppression de votre compte et de toutes vos donnees (droit a
            l&apos;oubli)
          </li>
          <li>
            <strong>Droit a la portabilite :</strong> exporter vos donnees
            personnelles au format JSON
          </li>
          <li>
            <strong>Droit d&apos;opposition :</strong> vous opposer au
            traitement de vos donnees
          </li>
          <li>
            <strong>Droit a la limitation :</strong> restreindre le traitement
            de vos donnees
          </li>
        </ul>
        <p>
          Pour exercer vos droits, contactez notre DPO a{" "}
          <strong>dpo@vjuya.me</strong> ou utilisez les fonctionnalites
          disponibles dans votre espace compte :
        </p>
        <ul>
          <li>
            Export de donnees :{" "}
            <code>GET /api/profile/export</code>
          </li>
          <li>
            Suppression de compte :{" "}
            <code>DELETE /api/profile/delete</code>
          </li>
        </ul>
      </section>

      <section>
        <h2>9. Transferts internationaux</h2>
        <p>
          Vos donnees sont principalement hebergees au sein de l&apos;Union
          europeenne. En cas de transfert hors UE (services cloud), nous nous
          assurons que des garanties adequates sont en place (clauses
          contractuelles types, decisions d&apos;adequation).
        </p>
      </section>

      <section>
        <h2>10. Reclamation</h2>
        <p>
          Si vous estimez que le traitement de vos donnees n&apos;est pas
          conforme, vous pouvez introduire une reclamation aupres de la CNIL :
        </p>
        <ul>
          <li>
            <strong>CNIL :</strong> Commission Nationale de l&apos;Informatique
            et des Libertes
          </li>
          <li>
            <strong>Site :</strong> www.cnil.fr
          </li>
          <li>
            <strong>Adresse :</strong> 3 Place de Fontenoy, TSA 80715, 75334
            Paris Cedex 07
          </li>
        </ul>
      </section>

      <section>
        <h2>11. Modifications</h2>
        <p>
          Cette politique de confidentialite peut etre modifiee a tout moment.
          Les modifications prennent effet des leur publication sur cette page.
          Nous vous informerons de tout changement substantiel par email ou
          notification sur le site.
        </p>
      </section>
    </div>
  );
}
