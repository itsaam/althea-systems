/**
 * JSON-LD Structured Data components for SEO.
 * Provides rich snippets to search engines for products and organization.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://althea.vjuya.me";

const OG_IMAGE =
  "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/og/home.png";

const SOCIAL_URLS = [
  "https://facebook.com/altheasystems",
  "https://instagram.com/altheasystems",
  "https://linkedin.com/company/althea-systems",
  "https://twitter.com/altheasystems",
];

interface ProductJsonLdProps {
  name: string;
  description: string;
  image: string[];
  sku?: string;
  price: number;
  currency?: string;
  availability: "InStock" | "OutOfStock" | "PreOrder";
  url: string;
  category?: string;
  brand?: string;
}

export function ProductJsonLd({
  name,
  description,
  image,
  sku,
  price,
  currency = "EUR",
  availability,
  url,
  category,
  brand = "Althea Systems",
}: ProductJsonLdProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    ...(sku && { sku, mpn: sku }),
    ...(category && { category }),
    brand: {
      "@type": "Brand",
      name: brand,
    },
    offers: {
      "@type": "Offer",
      price: price.toFixed(2),
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      url,
      priceValidUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      )
        .toISOString()
        .split("T")[0],
      seller: {
        "@type": "Organization",
        name: "Althea Systems",
        url: BASE_URL,
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "FR",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "EUR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "FR",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
        },
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

/**
 * Organization / LocalBusiness / Store schema — le combo le plus fort
 * pour le Knowledge Panel Google sur les requêtes brand ("Althea Systems").
 *
 * @type Store hérite de LocalBusiness qui hérite de Organization, donc
 * Google lit les 3 types à la fois. sameAs couvre les profils sociaux.
 */
export function OrganizationJsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "Store"],
    "@id": `${BASE_URL}#organization`,
    name: "Althea Systems",
    alternateName: ["Althea", "Althea Systems France"],
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: OG_IMAGE,
      width: 1200,
      height: 630,
    },
    image: OG_IMAGE,
    description:
      "Althea Systems sélectionne, certifie et livre le matériel médical de pointe qui équipe les professionnels de santé depuis 2011. ISO 13485, marquage CE, livraison 48h.",
    slogan: "L'équipement médical, repensé.",
    foundingDate: "2011",
    address: {
      "@type": "PostalAddress",
      addressCountry: "FR",
      addressLocality: "Paris",
      addressRegion: "Île-de-France",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      areaServed: "FR",
      availableLanguage: ["French", "English"],
      url: `${BASE_URL}/contact`,
      email: "contact@althea-systems.com",
      telephone: "+33-1-23-45-67-89",
    },
    email: "contact@althea-systems.com",
    telephone: "+33-1-23-45-67-89",
    priceRange: "€€€",
    currenciesAccepted: "EUR",
    paymentAccepted: "Credit Card, SEPA, Bank Transfer",
    areaServed: {
      "@type": "Country",
      name: "France",
    },
    knowsAbout: [
      "Équipement médical",
      "Dispositifs médicaux",
      "Imagerie médicale",
      "Mobilier clinique",
      "Stérilisation médicale",
      "Matériel d'urgence",
    ],
    sameAs: SOCIAL_URLS,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

/**
 * WebSite schema — permet à Google d'afficher une searchbox directement
 * dans les SERP pour les requêtes brand "Althea Systems".
 */
export function WebSiteJsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}#website`,
    name: "Althea Systems",
    alternateName: "Althea",
    url: BASE_URL,
    description:
      "Équipement médical certifié pour les professionnels de santé — Althea Systems depuis 2011.",
    publisher: {
      "@id": `${BASE_URL}#organization`,
    },
    inLanguage: ["fr-FR", "en-US", "ar"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/categories?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

/**
 * CollectionPage schema — pour les pages catégories. Aide Google à
 * comprendre qu'une page liste plusieurs produits d'une même famille.
 */
interface CollectionPageJsonLdProps {
  name: string;
  description: string;
  url: string;
  numberOfItems: number;
}

export function CollectionPageJsonLd({
  name,
  description,
  url,
  numberOfItems,
}: CollectionPageJsonLdProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    isPartOf: {
      "@id": `${BASE_URL}#website`,
    },
    about: {
      "@id": `${BASE_URL}#organization`,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
