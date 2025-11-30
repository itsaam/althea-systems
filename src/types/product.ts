export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categoryId: string;
  stock: number;
  sku?: string;
  featured: boolean;
  status: "active" | "draft" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithCategory extends Product {
  category: {
    id: string;
    name: string;
    slug: string;
  };
}
