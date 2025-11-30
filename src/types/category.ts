export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryWithProducts extends Category {
  products: {
    id: string;
    name: string;
    price: number;
  }[];
  _count: {
    products: number;
  };
}
