export interface Product {
  id: number;
  name: string;
  price: string;
  image: string | null;
  imageClasses?: string;
  category: string | null;
  description?: string | null;
  features?: string | null;
  isActive?: boolean | null;
  createdAt?: Date | null;
}

// Function to fetch products from the database
export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();
    return products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

// Function to fetch categories from the database
export async function fetchAllCategories(): Promise<string[]> {
  try {
    const response = await fetch('/api/categories');
    const categories = await response.json();
    return ['All Categories', ...categories.map((cat: any) => cat.name)];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [
      "All Categories",
      "Pain Relief",
      "Cold and Flu", 
      "Diabetes Care",
      "Digestive Health",
      "First Aid",
      "Skin Care",
      "Child and Baby Care",
      "Heart Health",
      "Eye and Ear Care",
      "Respiratory Health",
      "Medical Equipment",
      "Mobility",
      "Diagnostics"
    ];
  }
}

export const categories = [
  "All Categories",
  "Pain Relief",
  "Cold and Flu", 
  "Diabetes Care",
  "Digestive Health",
  "First Aid",
  "Skin Care",
  "Child and Baby Care",
  "Heart Health",
  "Eye and Ear Care",
  "Respiratory Health",
  "Medical Equipment",
  "Mobility",
  "Diagnostics"
];

export function searchProducts(products: Product[], query: string, category?: string): Product[] {
  let filtered = products;
  
  if (category && category !== "All Categories") {
    filtered = filtered.filter(product => product.category === category);
  }
  
  if (query.trim()) {
    const searchTerm = query.toLowerCase();
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      (product.category && product.category.toLowerCase().includes(searchTerm)) ||
      (product.description && product.description.toLowerCase().includes(searchTerm))
    );
  }
  
  return filtered;
}