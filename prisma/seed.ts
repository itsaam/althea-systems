import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seed - Althea Systems (Matériel Médical B2B)...");

  // ============================================
  // 1. UTILISATEURS
  // ============================================
  console.log("\n👥 Création des utilisateurs...");

  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@althea.com" },
    update: {},
    create: {
      email: "admin@althea.com",
      password: adminPassword,
      name: "Admin Althea",
      firstName: "Admin",
      lastName: "Althea",
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
      twoFactorEnabled: true,
    },
  });
  console.log("   ✓ Admin:", admin.email, "(2FA activé)");

  const userPassword = await bcrypt.hash("User123!", 10);
  const user1 = await prisma.user.upsert({
    where: { email: "dr.martin@clinique-sante.fr" },
    update: {},
    create: {
      email: "dr.martin@clinique-sante.fr",
      password: userPassword,
      name: "Dr. Martin Dubois",
      firstName: "Martin",
      lastName: "Dubois",
      role: "USER",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });
  console.log("   ✓ User B2B 1:", user1.email, "(Clinique Santé Plus)");

  const user2 = await prisma.user.upsert({
    where: { email: "achat@hopital-nord.fr" },
    update: {},
    create: {
      email: "achat@hopital-nord.fr",
      password: userPassword,
      name: "Sophie Laurent",
      firstName: "Sophie",
      lastName: "Laurent",
      role: "USER",
      status: "PENDING",
      emailVerified: null,
    },
  });
  console.log("   ✓ User B2B 2:", user2.email, "(Hôpital du Nord - PENDING)");

 // ============================================
  // 2. ADRESSES
  // ============================================
  console.log("\n📍 Création des adresses...");

  // On a enlevé "const address1 =" car on n'utilise pas la variable après
  await prisma.address.create({
    data: {
      userId: user1.id,
      firstName: "Martin",
      lastName: "Dubois",
      street: "15 rue de la Santé",
      city: "Paris",
      postalCode: "75014",
      country: "FR",
      phone: "+33 1 45 67 89 01",
      isDefault: true,
    },
  });
  console.log("   ✓ Adresse principale pour", user1.email);

  // On a enlevé "const address2 =" ici aussi
  await prisma.address.create({
    data: {
      userId: user1.id,
      firstName: "Martin",
      lastName: "Dubois",
      street: "8 avenue Victor Hugo",
      city: "Boulogne-Billancourt",
      postalCode: "92100",
      country: "FR",
      phone: "+33 1 46 05 12 34",
      isDefault: false,
    },
  });
  console.log("   ✓ Adresse secondaire pour", user1.email);
  
  // ============================================
  // 3. CATÉGORIES
  // ============================================
  console.log("\n📁 Création des catégories...");

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "diagnostic" },
      update: {},
      create: {
        name: "Diagnostic",
        slug: "diagnostic",
        description: "Instruments de diagnostic médical : stéthoscopes, tensiomètres, thermomètres, otoscopes",
        image: "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/categories/diagnostic.jpg",
      },
    }),
    prisma.category.upsert({
      where: { slug: "consommables" },
      update: {},
      create: {
        name: "Consommables",
        slug: "consommables",
        description: "Gants, masques, compresses, seringues et matériel à usage unique",
        image: "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/categories/consommables.jpg",
      },
    }),
    prisma.category.upsert({
      where: { slug: "mobilier-medical" },
      update: {},
      create: {
        name: "Mobilier médical",
        slug: "mobilier-medical",
        description: "Tables d'examen, fauteuils médicaux, lits médicalisés et mobilier professionnel",
        image: "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/categories/mobilier.jpg",
      },
    }),
    prisma.category.upsert({
      where: { slug: "instruments-chirurgicaux" },
      update: {},
      create: {
        name: "Instruments chirurgicaux",
        slug: "instruments-chirurgicaux",
        description: "Pinces, ciseaux, scalpels, kits chirurgicaux et instruments de précision",
        image: "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/categories/chirurgie.jpg",
      },
    }),
    prisma.category.upsert({
      where: { slug: "protection-individuelle" },
      update: {},
      create: {
        name: "Protection individuelle",
        slug: "protection-individuelle",
        description: "Blouses, sur-chaussures, charlottes, lunettes de protection et EPI médicaux",
        image: "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/categories/epi.jpg",
      },
    }),
    prisma.category.upsert({
      where: { slug: "desinfection" },
      update: {},
      create: {
        name: "Désinfection",
        slug: "desinfection",
        description: "Solutions hydroalcooliques, désinfectants de surfaces et produits d'hygiène",
        image: "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/categories/desinfection.jpg",
      },
    }),
    prisma.category.upsert({
      where: { slug: "premiers-secours" },
      update: {},
      create: {
        name: "Premiers secours",
        slug: "premiers-secours",
        description: "Trousses de secours, défibrillateurs, matériel d'urgence et oxygénothérapie",
        image: "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/categories/urgence.jpg",
      },
    }),
    prisma.category.upsert({
      where: { slug: "materiel-laboratoire" },
      update: {},
      create: {
        name: "Matériel de laboratoire",
        slug: "materiel-laboratoire",
        description: "Pipettes, éprouvettes, microscopes et équipement de laboratoire médical",
        image: "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/categories/laboratoire.jpg",
      },
    }),
  ]);
  console.log(`   ✓ ${categories.length} catégories créées`);

  // ============================================
  // 4. PRODUITS
  // ============================================
  console.log("\n🏥 Création des produits...");

  const products = await Promise.all([
    // DIAGNOSTIC - Produit 1
    prisma.product.upsert({
      where: { slug: "stethoscope-3m-littmann-classic-iii-noir" },
      update: {},
      create: {
        name: "Stéthoscope 3M Littmann Classic III - Noir",
        slug: "stethoscope-3m-littmann-classic-iii-noir",
        sku: "STH-3M-CL3-NOIR",
        description: `<p>Le <strong>Stéthoscope 3M Littmann Classic III</strong> est l'instrument de diagnostic de référence pour les professionnels de santé du monde entier.</p>

<h2>Caractéristiques principales</h2>
<ul>
  <li>Membrane double face haute sensibilité 4.3 cm</li>
  <li>Excellent isolement acoustique pour une auscultation précise</li>
  <li>Tube résistant au froid et à l'usure</li>
  <li>Pavillon en acier inoxydable robuste</li>
  <li>Garantie fabricant 5 ans</li>
</ul>

<h2>Applications</h2>
<p>Idéal pour l'auscultation cardiaque, pulmonaire et abdominale chez l'adulte et l'enfant. Recommandé pour médecins généralistes, cardiologues, pneumologues et étudiants en médecine.</p>

<h2>Avantages</h2>
<p>Performance acoustique supérieure, confort optimal lors de longues journées, durabilité exceptionnelle. Le Classic III offre le meilleur rapport qualité-prix de la gamme Littmann.</p>`,
        technicalSpecs: `Membrane : Double face 4.3 cm
Longueur tube : 69 cm
Poids : 150 g
Matériaux : Acier inoxydable, caoutchouc
Couleur : Noir
Certification : CE, FDA
Garantie : 5 ans
Origine : USA`,
        price: 89.90,
        tva: "TVA_20",
        stock: 45,
        images: [
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/stethoscope-3m-littmann-classic-iii-noir.jpg",
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/stethoscope-3m-littmann-classic-iii-detail-membrane.jpg",
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/stethoscope-3m-littmann-classic-iii-ensemble.jpg",
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/stethoscope-3m-littmann-classic-iii-zoom.jpg",
        ],
        featured: true,
        status: "PUBLISHED",
        categoryId: categories[0].id,
      },
    }),

    // DIAGNOSTIC - Produit 2
    prisma.product.upsert({
      where: { slug: "tensiometre-electronique-omron-m6-comfort" },
      update: {},
      create: {
        name: "Tensiomètre électronique Omron M6 Comfort",
        slug: "tensiometre-electronique-omron-m6-comfort",
        sku: "TEN-OMR-M6C",
        description: `<p>Le <strong>tensiomètre Omron M6 Comfort</strong> offre une mesure précise et fiable de la pression artérielle avec détection des battements irréguliers.</p>

<h2>Technologie Intellisense</h2>
<p>Gonflage personnalisé du brassard pour un confort optimal et une mesure rapide sans sur-gonflage.</p>

<h2>Fonctionnalités</h2>
<ul>
  <li>Détection des mouvements et des battements irréguliers</li>
  <li>Brassard préformé Intelli Wrap (22-42 cm)</li>
  <li>Mémoire 2 utilisateurs (60 mesures chacun)</li>
  <li>Indicateur de position du brassard</li>
  <li>Écran LCD large et lisible</li>
</ul>`,
        technicalSpecs: `Type : Brassard automatique
Plage de mesure : 0-299 mmHg
Précision : ±3 mmHg
Brassard : 22-42 cm
Alimentation : 4 piles AA
Mémoire : 2x60 mesures
Certification : CE médical classe IIa
Garantie : 3 ans`,
        price: 65.00,
        tva: "TVA_5_5",
        stock: 30,
        images: [
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/tensiometre-omron-m6-comfort.jpg",
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/tensiometre-omron-m6-brassard.jpg",
        ],
        featured: true,
        status: "PUBLISHED",
        categoryId: categories[0].id,
      },
    }),

    // CONSOMMABLES - Produit 3
    prisma.product.upsert({
      where: { slug: "gants-nitrile-non-poudres-taille-m-boite-100" },
      update: {},
      create: {
        name: "Gants nitrile non poudrés - Taille M - Boîte de 100",
        slug: "gants-nitrile-non-poudres-taille-m-boite-100",
        sku: "GLV-NIT-NP-M-100",
        description: `<p>Gants d'examen en <strong>nitrile non poudrés</strong>, ambidextres, offrant une excellente résistance et sensibilité tactile.</p>

<h2>Avantages du nitrile</h2>
<ul>
  <li>Alternative idéale pour les allergies au latex</li>
  <li>Résistance supérieure aux perforations et produits chimiques</li>
  <li>Excellente sensibilité tactile</li>
  <li>Non poudrés pour éviter les irritations</li>
</ul>

<h2>Conformité</h2>
<p>Conformes aux normes EN 455 (gants médicaux) et EN 374 (protection chimique).</p>`,
        technicalSpecs: `Matière : Nitrile
Type : Non poudré, ambidextre
Taille : M (7-8)
Épaisseur : 0.12 mm
Longueur : 240 mm
Conditionnement : 100 gants/boîte
Normes : EN 455, EN 374
Couleur : Bleu`,
        price: 8.50,
        tva: "TVA_20",
        stock: 500,
        images: [
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/gants-nitrile-bleu-boite.jpg",
        ],
        featured: false,
        status: "PUBLISHED",
        categoryId: categories[1].id,
      },
    }),

    // DIAGNOSTIC - Produit 4
    prisma.product.upsert({
      where: { slug: "thermometre-infrarouge-sans-contact-berrcom" },
      update: {},
      create: {
        name: "Thermomètre infrarouge sans contact Berrcom",
        slug: "thermometre-infrarouge-sans-contact-berrcom",
        sku: "THM-BER-IR-NC",
        description: `<p><strong>Thermomètre médical infrarouge</strong> sans contact, permettant une mesure rapide (1 seconde) et hygiénique de la température corporelle.</p>

<h2>Mesure sans contact</h2>
<p>Distance de mesure : 3-5 cm. Idéal pour limiter les contaminations croisées et mesurer la température de patients non coopérants (enfants, personnes âgées).</p>

<h2>Fonctions</h2>
<ul>
  <li>Mode front et mode objet/ambiance</li>
  <li>Alarme fièvre avec indicateur coloré</li>
  <li>Mémoire 32 mesures</li>
  <li>Arrêt automatique</li>
  <li>Écran LCD rétroéclairé</li>
</ul>`,
        technicalSpecs: `Type : Infrarouge sans contact
Plage : 32.0°C - 42.9°C (mode corps)
Précision : ±0.2°C (35-42°C)
Distance : 3-5 cm
Temps de mesure : 1 seconde
Mémoire : 32 mesures
Alimentation : 2 piles AAA
Certification : CE médical
Garantie : 2 ans`,
        price: 25.90,
        tva: "TVA_5_5",
        stock: 120,
        images: [
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/thermometre-infrarouge-berrcom.jpg",
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/thermometre-infrarouge-utilisation.jpg",
        ],
        featured: false,
        status: "PUBLISHED",
        categoryId: categories[0].id,
      },
    }),

    // CONSOMMABLES - Produit 5
    prisma.product.upsert({
      where: { slug: "masques-chirurgicaux-type-iir-boite-50" },
      update: {},
      create: {
        name: "Masques chirurgicaux Type IIR - Boîte de 50",
        slug: "masques-chirurgicaux-type-iir-boite-50",
        sku: "MSK-CHI-IIR-50",
        description: `<p><strong>Masques chirurgicaux Type IIR</strong> à usage unique, 3 plis, avec élastiques auriculaires et barrette nasale.</p>

<h2>Norme Type IIR</h2>
<p>La norme la plus exigeante pour les masques chirurgicaux (EN 14683) :</p>
<ul>
  <li>Efficacité de filtration bactérienne (BFE) ≥ 98%</li>
  <li>Résistant aux éclaboussures (120 mmHg)</li>
  <li>Respirabilité optimale</li>
</ul>

<h2>Utilisation</h2>
<p>Protection du personnel soignant et des patients lors de soins, examens, interventions chirurgicales. Durée d'utilisation : 4 heures maximum.</p>`,
        technicalSpecs: `Type : IIR (EN 14683)
Structure : 3 plis
BFE : ≥ 98%
Résistance splash : 120 mmHg
Respirabilité : < 60 Pa/cm²
Fixation : Élastiques auriculaires
Barrette nasale : Oui
Conditionnement : 50 masques/boîte
Couleur : Bleu`,
        price: 4.20,
        comparePrice: 6.50,
        tva: "TVA_5_5",
        stock: 1000,
        images: [
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/masques-chirurgicaux-type-iir-boite.jpg",
        ],
        featured: false,
        status: "PUBLISHED",
        categoryId: categories[1].id,
      },
    }),

    // MOBILIER - Produit 6
    prisma.product.upsert({
      where: { slug: "table-examen-electrique-2-plans" },
      update: {},
      create: {
        name: "Table d'examen électrique 2 plans",
        slug: "table-examen-electrique-2-plans",
        sku: "TBL-EXM-2P-ELEC",
        description: `<p><strong>Table d'examen médicale électrique</strong> 2 plans avec réglage en hauteur motorisé et dossier inclinable.</p>

<h2>Confort et ergonomie</h2>
<ul>
  <li>Réglage hauteur électrique : 55-90 cm</li>
  <li>Dossier inclinable manuellement 0-80°</li>
  <li>Sellerie en skaï médical facile à désinfecter</li>
  <li>Pédale au pied pour commande hauteur</li>
  <li>Charge maximale : 200 kg</li>
</ul>

<h2>Spécifications techniques</h2>
<p>Structure tubulaire acier époxy blanc. Mousse haute densité 5 cm. Dimensions : L 190 x l 60 cm. Poids : 65 kg.</p>

<h2>Sécurité</h2>
<p>Conforme normes CE médicales. Système anti-écrasement. Garantie 3 ans pièces et main d'œuvre.</p>`,
        technicalSpecs: `Type : Électrique 2 plans
Hauteur : 55-90 cm (motorisée)
Dossier : 0-80° (manuel)
Dimensions : L 190 x l 60 cm
Charge max : 200 kg
Sellerie : Skaï médical
Mousse : Haute densité 5 cm
Structure : Acier époxy blanc
Commande : Pédale au pied
Certification : CE médical
Garantie : 3 ans`,
        price: 1250.00,
        tva: "TVA_20",
        stock: 5,
        images: [
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/table-examen-electrique-2plans.jpg",
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/table-examen-dossier-incline.jpg",
        ],
        featured: false,
        status: "PUBLISHED",
        categoryId: categories[2].id,
      },
    }),

    // DIAGNOSTIC - Produit 7
    prisma.product.upsert({
      where: { slug: "otoscope-led-welch-allyn" },
      update: {},
      create: {
        name: "Otoscope à LED Welch Allyn",
        slug: "otoscope-led-welch-allyn",
        sku: "OTO-WA-LED",
        description: `<p><strong>Otoscope diagnostique Welch Allyn</strong> avec éclairage LED haute performance pour l'examen du conduit auditif et du tympan.</p>

<h2>Technologie LED</h2>
<ul>
  <li>Lumière blanche froide pour rendu des couleurs optimal</li>
  <li>Durée de vie 10 000 heures (vs 20h lampe halogène)</li>
  <li>Pas de remplacement d'ampoule</li>
  <li>Économie de batteries</li>
</ul>

<h2>Optique professionnelle</h2>
<p>Tête optique SureColor LED garantissant une excellente clarté visuelle. Lentille grossissante 2.5x. Livré avec 4 spéculums réutilisables (2.5, 3, 4, 5 mm).</p>`,
        technicalSpecs: `Marque : Welch Allyn
Type : Diagnostique LED
Éclairage : LED SureColor
Durée de vie LED : 10 000 heures
Grossissement : 2.5x
Spéculums inclus : 4 (2.5, 3, 4, 5 mm)
Alimentation : 2 piles AA
Poignée : Polymère texturé
Garantie : 2 ans`,
        price: 145.00,
        tva: "TVA_20",
        stock: 15,
        images: [
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/otoscope-welch-allyn-led.jpg",
        ],
        featured: false,
        status: "PUBLISHED",
        categoryId: categories[0].id,
      },
    }),

    // DÉSINFECTION - Produit 8
    prisma.product.upsert({
      where: { slug: "solution-hydroalcoolique-5l-anios" },
      update: {},
      create: {
        name: "Solution hydroalcoolique 5L Anios",
        slug: "solution-hydroalcoolique-5l-anios",
        sku: "SHA-ANI-5L",
        description: `<p><strong>Solution hydroalcoolique Anios</strong> pour la désinfection des mains par friction. Bidon de 5 litres avec pompe doseuse.</p>

<h2>Efficacité</h2>
<ul>
  <li>Normes EN 1500, EN 12791, EN 14476</li>
  <li>Bactéricide, fongicide, virucide</li>
  <li>Action en 30 secondes</li>
  <li>Efficace sur virus enveloppés (coronavirus, grippe...)</li>
</ul>

<h2>Formulation</h2>
<p>Éthanol 75%. Enrichie en glycérine pour protéger la peau. Sans parfum, sans colorant. Excellente tolérance dermatologique testée sous contrôle médical.</p>

<h2>Utilisation</h2>
<p>Verser 3 ml dans les mains sèches et frictionner pendant 30 secondes. Ne nécessite pas de rinçage. Idéal pour équiper distributeurs muraux en cabinet ou établissement de santé.</p>`,
        technicalSpecs: `Volume : 5 litres
Principe actif : Éthanol 75%
Normes : EN 1500, EN 12791, EN 14476
Action : Bactéricide, fongicide, virucide
Temps d'action : 30 secondes
Accessoire : Pompe doseuse incluse
Type : Sans rinçage
Parfum : Sans
Tolérance : Testée dermatologiquement`,
        price: 32.00,
        tva: "TVA_20",
        stock: 80,
        images: [
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/solution-hydroalcoolique-anios-5l.jpg",
        ],
        featured: false,
        status: "PUBLISHED",
        categoryId: categories[5].id,
      },
    }),

    // PREMIERS SECOURS - Produit 9
    prisma.product.upsert({
      where: { slug: "defibrillateur-automatique-philips-hs1" },
      update: {},
      create: {
        name: "Défibrillateur automatique Philips HeartStart HS1",
        slug: "defibrillateur-automatique-philips-hs1",
        sku: "DEF-PHI-HS1",
        description: `<p>Le <strong>défibrillateur Philips HeartStart HS1</strong> est conçu pour être utilisé par toute personne, même sans formation médicale, grâce à ses instructions vocales claires.</p>

<h2>Simplicité d'utilisation</h2>
<ul>
  <li>Instructions vocales étape par étape en français</li>
  <li>Pictogrammes lumineux pour guider l'utilisateur</li>
  <li>Analyse automatique du rythme cardiaque</li>
  <li>Choc électrique délivré uniquement si nécessaire</li>
</ul>

<h2>Fiabilité</h2>
<p>Technologie SMART Biphasic brevetée adaptant l'énergie du choc au patient. Auto-tests quotidiens, hebdomadaires et mensuels. Voyant de disponibilité visible de loin.</p>

<h2>Contenu</h2>
<p>Défibrillateur HS1 + électrodes adultes SMART pré-connectées + batterie longue durée (4 ans en veille) + sacoche de transport + kit de rasage + ciseaux + gants + notice. Garantie 8 ans constructeur.</p>`,
        technicalSpecs: `Type : DAE (Défibrillateur Automatisé Externe)
Ondes : SMART Biphasic
Énergie : 150 J
Électrodes : Adulte SMART pré-connectées
Batterie : 4 ans en veille / 200 chocs
Instructions : Vocales FR + pictogrammes
Auto-tests : Quotidiens
Certification : CE médical classe IIb
IP : IP21
Garantie : 8 ans
Poids : 1.5 kg`,
        price: 1150.00,
        tva: "TVA_5_5",
        stock: 8,
        images: [
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/defibrillateur-philips-hs1.jpg",
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/defibrillateur-philips-hs1-ouvert.jpg",
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/defibrillateur-philips-hs1-sacoche.jpg",
        ],
        featured: true,
        status: "PUBLISHED",
        categoryId: categories[6].id,
      },
    }),

    // INSTRUMENTS CHIRURGICAUX - Produit 10
    prisma.product.upsert({
      where: { slug: "kit-instruments-chirurgicaux-basiques-12-pieces" },
      update: {},
      create: {
        name: "Kit instruments chirurgicaux basiques - 12 pièces",
        slug: "kit-instruments-chirurgicaux-basiques-12-pieces",
        sku: "KIT-CHI-BAS-12",
        description: `<p><strong>Kit de 12 instruments chirurgicaux</strong> en acier inoxydable de grade médical, pour petite chirurgie et soins ambulatoires.</p>

<h2>Composition du kit</h2>
<ul>
  <li>2 pinces hémostatiques Kocher 14 cm</li>
  <li>2 pinces hémostatiques Péan 14 cm</li>
  <li>2 pinces à dissection avec griffes 14 cm</li>
  <li>1 pince à dissection sans griffes 14 cm</li>
  <li>1 ciseaux Mayo droits 14 cm</li>
  <li>1 ciseaux Metzenbaum courbes 14 cm</li>
  <li>1 porte-aiguille Mayo-Hegar 15 cm</li>
  <li>2 écarteurs de Farabeuf</li>
</ul>

<h2>Qualité professionnelle</h2>
<p>Acier inoxydable chirurgical anti-corrosion. Stérilisable en autoclave jusqu'à 134°C. Poli miroir. Livré dans un plateau de stérilisation perforé.</p>`,
        technicalSpecs: `Nombre d'instruments : 12
Matériau : Acier inoxydable chirurgical
Finition : Poli miroir
Stérilisation : Autoclave 134°C
Emballage : Plateau perforé inox
Norme : CE médical
Utilisation : Petite chirurgie, sutures
Origine : Allemagne
Garantie : 2 ans`,
        price: 89.00,
        tva: "TVA_20",
        stock: 25,
        images: [
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/kit-instruments-chirurgicaux-12pieces.jpg",
        ],
        featured: false,
        status: "PUBLISHED",
        categoryId: categories[3].id,
      },
    }),

    // PROTECTION INDIVIDUELLE - Produit 11
    prisma.product.upsert({
      where: { slug: "blouse-protection-polypropylene-lot-10" },
      update: {},
      create: {
        name: "Blouses de protection polypropylène - Lot de 10",
        slug: "blouse-protection-polypropylene-lot-10",
        sku: "BLS-PPE-PP-10",
        description: `<p><strong>Blouses de protection à usage unique</strong> en polypropylène non tissé. Idéales pour la protection lors d'examens, soins, visites en secteur protégé.</p>

<h2>Caractéristiques</h2>
<ul>
  <li>Matière respirante et légère</li>
  <li>Fermeture par liens à la taille et au col</li>
  <li>Manches longues avec poignets élastiques</li>
  <li>Longueur : 120 cm</li>
  <li>Taille unique adulte</li>
</ul>`,
        technicalSpecs: `Matière : Polypropylène non tissé 40g/m²
Taille : Unique adulte
Longueur : 120 cm
Manches : Longues avec poignets élastiques
Fermeture : Liens col et taille
Conditionnement : Sachet de 10
Couleur : Bleu
Usage : Unique`,
        price: 12.50,
        tva: "TVA_20",
        stock: 200,
        images: [
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/blouses-protection-bleues.jpg",
        ],
        featured: false,
        status: "PUBLISHED",
        categoryId: categories[4].id,
      },
    }),

    // CONSOMMABLES - Produit 12
    prisma.product.upsert({
      where: { slug: "compresses-steriles-10x10-boite-50-sachets" },
      update: {},
      create: {
        name: "Compresses stériles 10x10 cm - Boîte de 50 sachets de 2",
        slug: "compresses-steriles-10x10-boite-50-sachets",
        sku: "CMP-STR-10X10-50X2",
        description: `<p><strong>Compresses de gaze</strong> hydrophile stériles 10x10 cm, 8 plis, tissage 17 fils. Conditionnées par 2 dans des sachets individuels stériles.</p>

<h2>Utilisation</h2>
<p>Nettoyage et protection des plaies, pansements, applications de solutions antiseptiques. Excellente capacité d'absorption.</p>`,
        technicalSpecs: `Dimensions : 10 x 10 cm
Plis : 8
Tissage : 17 fils
Stérilité : Stérile (rayons gamma)
Conditionnement : 2 par sachet
Boîte : 50 sachets (100 compresses)
Matière : Gaze hydrophile 100% coton
Norme : EN 14079`,
        price: 11.90,
        tva: "TVA_5_5",
        stock: 150,
        images: [
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/compresses-steriles-10x10.jpg",
        ],
        featured: false,
        status: "PUBLISHED",
        categoryId: categories[1].id,
      },
    }),

    // DIAGNOSTIC - Produit 13
    prisma.product.upsert({
      where: { slug: "oxymetre-pouls-doigt-beurer-po30" },
      update: {},
      create: {
        name: "Oxymètre de pouls au doigt Beurer PO 30",
        slug: "oxymetre-pouls-doigt-beurer-po30",
        sku: "OXY-BEU-PO30",
        description: `<p><strong>Oxymètre de pouls</strong> pour mesure non invasive de la saturation en oxygène (SpO2) et de la fréquence cardiaque.</p>

<h2>Fonctionnalités</h2>
<ul>
  <li>Mesure SpO2 et fréquence cardiaque</li>
  <li>Affichage graphique de l'onde de pouls</li>
  <li>4 orientations d'affichage possibles</li>
  <li>10 niveaux de luminosité</li>
  <li>Arrêt automatique</li>
</ul>`,
        technicalSpecs: `Mesures : SpO2 (35-100%) et pouls (30-250 bpm)
Précision SpO2 : ±2%
Précision pouls : ±2 bpm
Écran : OLED couleur
Alimentation : 2 piles AAA
Arrêt auto : 8 secondes
Certification : CE médical
Garantie : 3 ans`,
        price: 32.90,
        tva: "TVA_5_5",
        stock: 65,
        images: [
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/oxymetre-beurer-po30.jpg",
        ],
        featured: false,
        status: "PUBLISHED",
        categoryId: categories[0].id,
      },
    }),

    // CONSOMMABLES - Produit 14
    prisma.product.upsert({
      where: { slug: "seringues-3-pieces-5ml-luer-boite-100" },
      update: {},
      create: {
        name: "Seringues 3 pièces 5ml Luer - Boîte de 100",
        slug: "seringues-3-pieces-5ml-luer-boite-100",
        sku: "SER-3P-5ML-LU-100",
        description: `<p><strong>Seringues 3 pièces stériles</strong> à usage unique, 5 ml, avec embout Luer (compatible Luer-Lock et Luer simple).</p>

<h2>Caractéristiques</h2>
<ul>
  <li>Corps transparent gradué 0.2 ml</li>
  <li>Piston avec joint en caoutchouc latex</li>
  <li>Embout Luer excentré</li>
  <li>Stérilisées à l'oxyde d'éthylène</li>
  <li>Non pyrogène, non toxique</li>
</ul>`,
        technicalSpecs: `Volume : 5 ml
Type : 3 pièces
Embout : Luer excentré
Graduation : 0.2 ml
Stérilisation : Oxyde d'éthylène
Emballage : Individuel pelable
Boîte : 100 seringues
Norme : ISO 7886-1
Sans latex piston : Non`,
        price: 14.90,
        tva: "TVA_5_5",
        stock: 300,
        images: [
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/seringues-5ml-luer-boite.jpg",
        ],
        featured: false,
        status: "PUBLISHED",
        categoryId: categories[1].id,
      },
    }),

    // PREMIERS SECOURS - Produit 15
    prisma.product.upsert({
      where: { slug: "trousse-secours-entreprise-20-personnes" },
      update: {},
      create: {
        name: "Trousse de secours entreprise - 20 personnes",
        slug: "trousse-secours-entreprise-20-personnes",
        sku: "TRS-SEC-ENT-20P",
        description: `<p><strong>Trousse de premiers secours</strong> complète pour entreprise, conforme à la réglementation du travail. Mallette rigide pour 20 personnes.</p>

<h2>Contenu (conforme Code du Travail)</h2>
<ul>
  <li>Compresses stériles (40)</li>
  <li>Pansements adhésifs assortis (40)</li>
  <li>Bandes de gaze (10)</li>
  <li>Paire de ciseaux inox</li>
  <li>Pince à échardes</li>
  <li>Gants vinyle (10 paires)</li>
  <li>Solution antiseptique (250ml)</li>
  <li>Couverture de survie</li>
  <li>Coussin hémostatique</li>
  <li>Livret de premiers secours</li>
</ul>`,
        technicalSpecs: `Capacité : 20 personnes
Type : Mallette rigide murale
Dimensions : 32 x 22 x 12 cm
Contenu : Conforme Code du Travail
Fixation : Murale (support inclus)
Fermeture : À clé (2 clés fournies)
Livret : Guide premiers secours
Garantie : 1 an`,
        price: 78.00,
        tva: "TVA_20",
        stock: 35,
        images: [
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/trousse-secours-entreprise-20p.jpg",
        ],
        featured: false,
        status: "PUBLISHED",
        categoryId: categories[6].id,
      },
    }),

    // LABORATOIRE - Produit 16
    prisma.product.upsert({
      where: { slug: "tubes-prelvement-sanguin-edta-k3-5ml-boite-100" },
      update: {},
      create: {
        name: "Tubes prélèvement sanguin EDTA K3 5ml - Boîte de 100",
        slug: "tubes-prelvement-sanguin-edta-k3-5ml-boite-100",
        sku: "TUB-SANG-EDTA-5ML-100",
        description: `<p><strong>Tubes sous vide</strong> pour prélèvement sanguin avec anticoagulant EDTA K3, pour analyses hématologiques.</p>

<h2>Utilisation</h2>
<p>NFS (Numération Formule Sanguine), hémogramme, typage HLA, tests de compatibilité transfusionnelle.</p>

<h2>Spécifications</h2>
<ul>
  <li>Bouchon violet avec anticoagulant EDTA K3</li>
  <li>Volume de prélèvement : 5 ml</li>
  <li>Sous vide calibré</li>
  <li>Stériles, pyrogène-free</li>
</ul>`,
        technicalSpecs: `Type : Tube sous vide
Anticoagulant : EDTA K3
Volume : 5 ml
Bouchon : Violet
Application : Hématologie (NFS)
Stérilité : Stérile, pyrogène-free
Matériau : PET
Boîte : 100 tubes
Norme : ISO 6710`,
        price: 22.00,
        tva: "TVA_5_5",
        stock: 180,
        images: [
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/tubes-edta-5ml-bouchon-violet.jpg",
        ],
        featured: false,
        status: "PUBLISHED",
        categoryId: categories[7].id,
      },
    }),

    // PROTECTION INDIVIDUELLE - Produit 17
    prisma.product.upsert({
      where: { slug: "charlottes-medicales-usage-unique-boite-100" },
      update: {},
      create: {
        name: "Charlottes médicales usage unique - Boîte de 100",
        slug: "charlottes-medicales-usage-unique-boite-100",
        sku: "CHR-MED-UU-100",
        description: `<p><strong>Charlottes jetables</strong> en polypropylène non tissé avec élastique. Protection hygiénique des cheveux.</p>

<h2>Utilisation</h2>
<p>Bloc opératoire, salles blanches, industrie pharmaceutique, agroalimentaire, visites en zones protégées.</p>`,
        technicalSpecs: `Matière : Polypropylène non tissé
Grammage : 12 g/m²
Diamètre : 53 cm (taille unique)
Fixation : Élastique
Conditionnement : 100 pièces/boîte
Couleur : Blanc
Usage : Unique`,
        price: 6.90,
        tva: "TVA_20",
        stock: 250,
        images: [
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/charlottes-blanches-boite.jpg",
        ],
        featured: false,
        status: "PUBLISHED",
        categoryId: categories[4].id,
      },
    }),

    // DÉSINFECTION - Produit 18
    prisma.product.upsert({
      where: { slug: "lingettes-desinfectantes-surfaces-medicat-boite-120" },
      update: {},
      create: {
        name: "Lingettes désinfectantes surfaces Medicat - Boîte de 120",
        slug: "lingettes-desinfectantes-surfaces-medicat-boite-120",
        sku: "LGT-DSF-MED-120",
        description: `<p><strong>Lingettes imprégnées</strong> pour la désinfection rapide des surfaces et dispositifs médicaux.</p>

<h2>Efficacité</h2>
<ul>
  <li>Bactéricide (EN 13727)</li>
  <li>Fongicide (EN 13624)</li>
  <li>Virucide (EN 14476)</li>
  <li>Temps d'action : 1 minute</li>
</ul>

<h2>Usage</h2>
<p>Plans de travail, tables d'examen, surfaces de mobilier médical, dispositifs médicaux non invasifs.</p>`,
        technicalSpecs: `Format : 20 x 20 cm
Normes : EN 13727, EN 13624, EN 14476
Principe actif : Ammonium quaternaire
Temps d'action : 1 minute
Boîte : 120 lingettes
Type : Imprégnées
Parfum : Sans
Compatibilité : Inox, plastiques, surfaces`,
        price: 9.50,
        tva: "TVA_20",
        stock: 140,
        images: [
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/lingettes-desinfectantes-medicat.jpg",
        ],
        featured: false,
        status: "PUBLISHED",
        categoryId: categories[5].id,
      },
    }),

    // MOBILIER - Produit 19
    prisma.product.upsert({
      where: { slug: "paravent-medical-3-panneaux-sur-roulettes" },
      update: {},
      create: {
        name: "Paravent médical 3 panneaux sur roulettes",
        slug: "paravent-medical-3-panneaux-sur-roulettes",
        sku: "PAR-MED-3P-ROUL",
        description: `<p><strong>Paravent médical mobile</strong> 3 panneaux pour créer des espaces d'intimité dans les services de soins, cabinets médicaux, salles d'examen.</p>

<h2>Caractéristiques</h2>
<ul>
  <li>3 panneaux articulés</li>
  <li>Dimensions par panneau : H 180 x l 60 cm</li>
  <li>4 roulettes pivotantes dont 2 avec frein</li>
  <li>Revêtement vinyle médical lavable</li>
  <li>Structure acier époxy blanc</li>
</ul>`,
        technicalSpecs: `Panneaux : 3 articulés
Dimensions panneau : H 180 x l 60 cm
Revêtement : Vinyle médical
Structure : Acier époxy blanc
Roulettes : 4 pivotantes (2 avec frein)
Poids : 18 kg
Couleur : Blanc/bleu
Entretien : Lavable désinfectable`,
        price: 185.00,
        tva: "TVA_20",
        stock: 12,
        images: [
          "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/products/paravent-medical-3-panneaux.jpg",
        ],
        featured: false,
        status: "PUBLISHED",
        categoryId: categories[2].id,
      },
    }),

    // DIAGNOSTIC - Produit 20 (DRAFT)
    prisma.product.upsert({
      where: { slug: "electrocardiographe-portable-3-pistes" },
      update: {},
      create: {
        name: "Électrocardiographe portable 3 pistes",
        slug: "electrocardiographe-portable-3-pistes",
        sku: "ECG-PORT-3P",
        description: `<p><strong>ECG portable</strong> 3 pistes avec écran LCD couleur et interprétation automatique. (Produit en cours de référencement)</p>`,
        technicalSpecs: `Pistes : 3
Écran : LCD couleur 7"
Dérivations : 12
Batterie : Li-ion rechargeable
Impression : Thermique intégrée
Mémoire : 1000 ECG
Certification : CE médical`,
        price: 890.00,
        tva: "TVA_5_5",
        stock: 0,
        images: [],
        featured: false,
        status: "DRAFT",
        categoryId: categories[0].id,
      },
    }),
  ]);
  console.log(`   ✓ ${products.length} produits créés`);

  // ============================================
  // 5. SLIDES CAROUSEL
  // ============================================
  console.log("\n🎠 Création des slides carousel...");

  const slides = await Promise.all([
    prisma.carouselSlide.upsert({
      where: { id: "slide-diagnostic-2026" },
      update: {},
      create: {
        id: "slide-diagnostic-2026",
        title: "Nouvelle gamme diagnostic 2026",
        subtitle: "Stéthoscopes et tensiomètres professionnels",
        image: "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/carousel/diagnostic-2026.jpg",
        link: "/categories/diagnostic",
        order: 1,
        active: true,
      },
    }),
    prisma.carouselSlide.upsert({
      where: { id: "slide-promo-protection" },
      update: {},
      create: {
        id: "slide-promo-protection",
        title: "Offre spéciale protection",
        subtitle: "Jusqu'à -35% sur les masques et gants",
        image: "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/carousel/promo-protection.jpg",
        link: "/categories/consommables",
        order: 2,
        active: true,
      },
    }),
    prisma.carouselSlide.upsert({
      where: { id: "slide-urgence-2026" },
      update: {},
      create: {
        id: "slide-urgence-2026",
        title: "Équipez vos services d'urgence",
        subtitle: "Défibrillateurs et matériel de réanimation",
        image: "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/carousel/equipement-urgence.jpg",
        link: "/categories/premiers-secours",
        order: 3,
        active: true,
      },
    }),
  ]);
  console.log(`   ✓ ${slides.length} slides carousel créés`);

  // ============================================
  // RÉCAPITULATIF
  // ============================================
  console.log("\n" + "=".repeat(60));
  console.log("✅ SEED TERMINÉ AVEC SUCCÈS!");
  console.log("=".repeat(60));
  console.log("\n📊 Récapitulatif des données créées:");
  console.log(`   • ${categories.length} catégories`);
  console.log(`   • ${products.length} produits (${products.filter(p => p.status === "PUBLISHED").length} publiés, ${products.filter(p => p.status === "DRAFT").length} brouillons)`);
  console.log(`   • 3 utilisateurs (1 admin, 2 users B2B)`);
  console.log(`   • 2 adresses`);
  console.log(`   • ${slides.length} slides carousel`);
  console.log("\n🔐 Identifiants de connexion:");
  console.log("\n   ADMIN:");
  console.log("   Email    : admin@althea.com");
  console.log("   Password : Admin123!");
  console.log("   2FA      : Activé");
  console.log("\n   USER B2B (Actif):");
  console.log("   Email    : dr.martin@clinique-sante.fr");
  console.log("   Password : User123!");
  console.log("   Entreprise : Clinique Santé Plus");
  console.log("\n   USER B2B (En attente):");
  console.log("   Email    : achat@hopital-nord.fr");
  console.log("   Password : User123!");
  console.log("   Entreprise : Hôpital du Nord");
  console.log("\n" + "=".repeat(60) + "\n");
}

main()
  .catch((e) => {
    console.error("\n❌ ÉCHEC DU SEED:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
