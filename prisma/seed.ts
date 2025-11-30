import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seed...");

  // Création de l'admin
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@althea.com" },
    update: {},
    create: {
      email: "admin@althea.com",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "Althea",
      role: "ADMIN",
    },
  });
  console.log("👤 Admin créé:", admin.email);

  // Création des catégories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "robes" },
      update: {},
      create: {
        name: "Robes",
        slug: "robes",
        description: "Collection de robes élégantes",
        image: "/images/categories/robes.jpg",
      },
    }),
    prisma.category.upsert({
      where: { slug: "accessoires" },
      update: {},
      create: {
        name: "Accessoires",
        slug: "accessoires",
        description: "Accessoires de mode",
        image: "/images/categories/accessoires.jpg",
      },
    }),
    prisma.category.upsert({
      where: { slug: "chaussures" },
      update: {},
      create: {
        name: "Chaussures",
        slug: "chaussures",
        description: "Chaussures tendance",
        image: "/images/categories/chaussures.jpg",
      },
    }),
  ]);
  console.log("📁 Catégories créées:", categories.length);

  // Création des produits
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: "robe-althea-classique" },
      update: {},
      create: {
        name: "Robe Althea Classique",
        slug: "robe-althea-classique",
        description: "Une robe élégante pour toutes les occasions",
        price: 149.99,
        comparePrice: 199.99,
        stock: 25,
        images: ["/images/products/robe-1.jpg"],
        featured: true,
        active: true,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.upsert({
      where: { slug: "robe-soiree-noire" },
      update: {},
      create: {
        name: "Robe Soirée Noire",
        slug: "robe-soiree-noire",
        description: "Robe de soirée noire sophistiquée",
        price: 229.99,
        stock: 15,
        images: ["/images/products/robe-2.jpg"],
        featured: true,
        active: true,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.upsert({
      where: { slug: "sac-cuir-elegant" },
      update: {},
      create: {
        name: "Sac Cuir Élégant",
        slug: "sac-cuir-elegant",
        description: "Sac en cuir véritable",
        price: 89.99,
        stock: 30,
        images: ["/images/products/sac-1.jpg"],
        featured: false,
        active: true,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.upsert({
      where: { slug: "escarpins-rouges" },
      update: {},
      create: {
        name: "Escarpins Rouges",
        slug: "escarpins-rouges",
        description: "Escarpins rouges élégants",
        price: 119.99,
        stock: 20,
        images: ["/images/products/chaussures-1.jpg"],
        featured: true,
        active: true,
        categoryId: categories[2].id,
      },
    }),
  ]);
  console.log("🛍️ Produits créés:", products.length);

  // Création des slides du carousel
  const slides = await Promise.all([
    prisma.carouselSlide.upsert({
      where: { id: "slide-1" },
      update: {},
      create: {
        id: "slide-1",
        title: "Nouvelle Collection",
        subtitle: "Découvrez nos dernières créations",
        image: "/images/carousel/slide-1.jpg",
        link: "/categories/robes",
        order: 1,
        active: true,
      },
    }),
    prisma.carouselSlide.upsert({
      where: { id: "slide-2" },
      update: {},
      create: {
        id: "slide-2",
        title: "Soldes d'Hiver",
        subtitle: "Jusqu'à -50% sur une sélection",
        image: "/images/carousel/slide-2.jpg",
        link: "/categories",
        order: 2,
        active: true,
      },
    }),
  ]);
  console.log("🎠 Slides carousel créés:", slides.length);

  console.log("✅ Seed terminé avec succès!");
}

main()
  .catch((e) => {
    console.error("❌ Échec du seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
