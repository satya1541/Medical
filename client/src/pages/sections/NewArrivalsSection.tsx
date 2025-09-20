import { ArrowRightIcon } from "lucide-react";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ProductModal } from "@/components/ProductModal";
import { Product } from "@shared/products";
import { useSearch } from "@/contexts/SearchContext";

export const NewArrivalsSection = (): JSX.Element => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const { allProducts } = useSearch();

  // Get new arrival products from database (most recent 4 or all)
  const products = Array.isArray(allProducts) 
    ? showAllProducts 
      ? allProducts.slice().reverse() // All products, newest first
      : allProducts.slice(-4).reverse() // Last 4 products, newest first
    : [];

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleImageError = (productId: number) => {
    setFailedImages(prev => new Set(prev).add(productId));
  };

  return (
    <section className="flex flex-col items-center gap-4 w-full">
      <div className="flex w-full max-w-[1280px] items-center justify-between">
        <h2 className="ml-4 sm:ml-0 [font-family:'Nunito',Helvetica] font-bold text-style text-[32px] tracking-[0] leading-[normal]">
          Our Products
        </h2>

        <div 
          className="inline-flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity mr-4 sm:mr-0"
          onClick={() => setShowAllProducts(!showAllProducts)}
        >
          <span className="[font-family:'Nunito',Helvetica] font-bold text-[#28a745] text-base tracking-[0] leading-[normal]">
            {showAllProducts ? 'Show Less' : 'View All'}
          </span>
          <ArrowRightIcon className="w-6 h-6 text-[#28a745]" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-[1280px] px-4 md:px-0">
        {products.map((product) => (
          <Card
            key={product.id}
            className="w-full md:max-w-[305px] bg-white rounded-xl shadow-[0px_4px_26px_#0000001a] md:mx-auto cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleProductClick(product)}
          >
            <CardContent className="p-0">
              <div className="relative h-[264px] overflow-hidden rounded-t-xl">
                <img
                  className={`absolute object-cover ${product.imageClasses || 'w-full h-full'}`}
                  alt={product.name}
                  src={failedImages.has(product.id) || !product.image ? '/figmaAssets/placeholder.png' : product.image}
                  onError={() => handleImageError(product.id)}
                />
              </div>

              <div className="flex flex-col items-start gap-1 px-2 py-3 border-t border-[#e7e7e7]">
                <h3 className="w-full [font-family:'Nunito',Helvetica] font-bold text-style text-xl tracking-[0] leading-[normal]">
                  {product.name}
                </h3>
                <div className="inline-flex items-start gap-2">
                  <span className="[font-family:'Nunito',Helvetica] font-bold text-x-333333 text-base tracking-[0] leading-[normal]">
                    ₹{product.price}
                  </span>
                </div>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
      
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </section>
  );
};
