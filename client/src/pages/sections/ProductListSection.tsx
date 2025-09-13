import { ArrowRightIcon } from "lucide-react";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ProductModal } from "@/components/ProductModal";
import { Product } from "@shared/products";
import { useSearch } from "@/contexts/SearchContext";

export const ProductListSection = (): JSX.Element => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { allProducts } = useSearch();

  // Get all products from database
  const products = Array.isArray(allProducts) ? allProducts.slice(0, 8) : []; // Show first 8 products

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <section className="flex flex-col items-center gap-4 w-full px-4 sm:px-8 lg:px-20">
      <div className="flex w-full max-w-[1280px] items-center justify-between">
        <h2 className="[font-family:'Nunito',Helvetica] font-bold text-style text-[32px] tracking-[0] leading-[normal]">
          Medical Products
        </h2>

        <div className="inline-flex items-center gap-2 cursor-pointer">
          <span className="[font-family:'Nunito',Helvetica] font-bold text-[#28a745] text-base tracking-[0] leading-[normal]">
            View All
          </span>
          <ArrowRightIcon className="w-6 h-6 text-[#28a745]" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-[1280px]">
        {products.map((product) => (
          <Card
            key={product.id}
            className="w-full max-w-[305px] bg-white rounded-xl shadow-[0px_4px_26px_#0000001a] overflow-hidden mx-auto cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleProductClick(product)}
          >
            <CardContent className="p-0">
              <div className="flex items-center justify-center p-[13px] h-[264px]">
                <img
                  className={`${product.imageClasses || 'w-full h-full'} object-cover`}
                  alt={product.name}
                  src={product.image || '/figmaAssets/placeholder.png'}
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
