import type { Metadata } from "next";
import LegalPage, {
  LegalSection,
  Section,
} from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site althea-systems.com : éditeur, hébergeur, directeur de publication, propriété intellectuelle et contact.",
  alternates: { canonical: "/mentions-legales" },
};

const SECTIONS: LegalSection[] = [
  { id: "editeur", title: "Éditeur du site" },
  { id: "publication", title: "Directeur de publication" },
  { id: "hebergeur", title: "Hébergeur" },
  { id: "propriete", title: "Propriété intellectuelle" },
  { id: "responsabilite", title: "Responsabilité" },
  { id: "liens", title: "Liens hypertextes" },
  { id: "credits", title: "Crédits" },
  { id: "cookies", title: "Cookies" },
  { id: "contact", title: "Contact" },
];

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      eyebrow="Informations légales"
      title="Mentions légales"
      subtitle="Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l'économie numérique, les utilisateurs du site althea-systems.com sont informés de l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi."
      updatedAt="10 avril 2026"
      sections={SECTIONS}
    >
      <Section id="editeur" title="1. Éditeur du site">
        <p>
          Le site <strong>althea-systems.com</strong> est édité par la société{" "}
          <strong>Althea Systems SAS</strong>, société par actions simplifiée
          au capital de 150 000 euros, dont le siège social est situé :
        </p>
        <ul>
          <li>42 rue de la Santé, 69003 Lyon, France</li>
          <li>RCS Lyon 528 451 982</li>
          <li>SIRET : 528 451 982 00027</li>
          <li>N° TVA intracommunautaire : FR 72 528 451 982</li>
          <li>
            Courriel :{" "}
            <a href="mailto:contact@althea-systems.com">
              contact@althea-systems.com
            </a>
          </li>
          <li>Téléphone : +33 (0)4 72 00 00 00</li>
        </ul>
      </Section>

      <Section id="publication" title="2. Directeur de publication">
        <p>
          Le directeur de la publication du site est le représentant légal
          d&apos;Althea Systems SAS, joignable à l&apos;adresse{" "}
          <a href="mailto:direction@althea-systems.com">
            direction@althea-systems.com
          </a>
          .
        </p>
        <p>
          Pour toute demande relative à un contenu publié sur le site
          (signalement, droit de réponse, correction), merci de contacter
          directement la direction de la publication.
        </p>
      </Section>

      <Section id="hebergeur" title="3. Hébergeur">
        <p>Le site althea-systems.com est hébergé par :</p>
        <ul>
          <li>
            <strong>Vercel Inc.</strong>
          </li>
          <li>340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</li>
          <li>
            Site web :{" "}
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              vercel.com
            </a>
          </li>
        </ul>
        <p>
          Les données personnelles des utilisateurs sont hébergées en Union
          européenne, conformément aux exigences du Règlement Général sur la
          Protection des Données (RGPD).
        </p>
      </Section>

      <Section id="propriete" title="4. Propriété intellectuelle">
        <p>
          L&apos;ensemble du site althea-systems.com, y compris sa structure,
          ses textes, ses images, ses photographies, ses illustrations, ses
          logos, ses vidéos, ses bases de données et son code source, relève
          de la législation française et internationale sur le droit
          d&apos;auteur et la propriété intellectuelle.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication,
          transmission, dénaturation, totale ou partielle du site ou de son
          contenu, par quelque procédé que ce soit, et sur quelque support que
          ce soit est interdite sans l&apos;autorisation écrite préalable
          d&apos;Althea Systems. Toute exploitation non autorisée du site ou de
          l&apos;un quelconque de ses éléments sera considérée comme
          constitutive d&apos;une contrefaçon et poursuivie conformément aux
          dispositions des articles L.335-2 et suivants du Code de la propriété
          intellectuelle.
        </p>
        <p>
          Les marques <strong>Althea Systems</strong> et leurs logos sont des
          marques déposées. Toute reproduction non autorisée de ces marques,
          logos et signes distinctifs est prohibée.
        </p>
      </Section>

      <Section id="responsabilite" title="5. Responsabilité">
        <p>
          Les informations publiées sur althea-systems.com sont fournies à
          titre indicatif. Althea Systems s&apos;efforce d&apos;assurer
          l&apos;exactitude et la mise à jour des informations diffusées, dont
          elle se réserve le droit de corriger, à tout moment et sans préavis,
          le contenu.
        </p>
        <p>
          Althea Systems ne saurait être tenue pour responsable des erreurs ou
          omissions, ni des résultats qui pourraient être obtenus par
          l&apos;usage de ces informations. L&apos;utilisateur est seul
          responsable de l&apos;utilisation qu&apos;il fait des informations
          fournies et des conséquences qui peuvent en découler.
        </p>
        <p>
          Althea Systems ne pourra être tenue responsable des dommages directs
          ou indirects résultant de l&apos;accès ou de l&apos;utilisation du
          site, notamment en cas d&apos;interruption de service, de virus
          informatique ou de défaillance du réseau.
        </p>
      </Section>

      <Section id="liens" title="6. Liens hypertextes">
        <p>
          Le site althea-systems.com peut contenir des liens hypertextes
          pointant vers d&apos;autres sites internet. Althea Systems n&apos;a
          aucun contrôle sur le contenu de ces sites et décline toute
          responsabilité quant à leur contenu, leur disponibilité ou leur
          utilisation.
        </p>
        <p>
          La création de liens hypertextes vers le site althea-systems.com est
          soumise à l&apos;accord préalable du directeur de la publication.
          Toute demande peut être adressée à l&apos;adresse{" "}
          <a href="mailto:contact@althea-systems.com">
            contact@althea-systems.com
          </a>
          .
        </p>
      </Section>

      <Section id="credits" title="7. Crédits">
        <p>
          Conception, design et développement : équipe interne Althea Systems.
        </p>
        <ul>
          <li>
            Polices : distribuées sous licences open-source (SIL Open Font
            License).
          </li>
          <li>
            Icônes : <a href="https://lucide.dev">Lucide</a>, distribuées sous
            licence ISC.
          </li>
          <li>
            Photographies : banques d&apos;images sous licence commerciale et
            productions internes.
          </li>
        </ul>
      </Section>

      <Section id="cookies" title="8. Cookies">
        <p>
          Le site althea-systems.com utilise des cookies strictement
          nécessaires à son fonctionnement (authentification, panier, sécurité)
          ainsi que des cookies de mesure d&apos;audience anonymisée. Aucun
          cookie publicitaire ni de traçage tiers n&apos;est déposé sans le
          consentement explicite de l&apos;utilisateur.
        </p>
        <p>
          Pour en savoir plus sur la gestion des cookies et exercer vos droits,
          consultez notre{" "}
          <a href="/legal/privacy">politique de confidentialité</a>.
        </p>
      </Section>

      <Section id="contact" title="9. Contact">
        <p>
          Pour toute question relative aux présentes mentions légales ou au
          fonctionnement du site, vous pouvez contacter Althea Systems :
        </p>
        <ul>
          <li>
            Par courriel :{" "}
            <a href="mailto:contact@althea-systems.com">
              contact@althea-systems.com
            </a>
          </li>
          <li>Par téléphone : +33 (0)4 72 00 00 00</li>
          <li>
            Par courrier : Althea Systems SAS, 42 rue de la Santé, 69003 Lyon,
            France
          </li>
        </ul>
      </Section>
    </LegalPage>
  );
}
