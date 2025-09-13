import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useSearch } from "@/contexts/SearchContext";
import { ProductModal } from "./ProductModal";
import { Product } from "@shared/products";

export const SearchResults: React.FC = () => {
  const { searchResults, isSearchActive, searchQuery, selectedCategory, clearSearch } = useSearch();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  if (!isSearchActive) return null;

  return (
    <div className="w-full bg-white py-8 border-t border-gray-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Search Results
            </h2>
            <p className="text-gray-600">
              {searchResults.length} products found
              {searchQuery && ` for "${searchQuery}"`}
              {selectedCategory !== "All Categories" && ` in ${selectedCategory}`}
            </p>
          </div>
          <Button
            onClick={clearSearch}
            variant="outline"
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear Search
          </Button>
        </div>

        {searchResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              No products found matching your search criteria
            </div>
            <Button onClick={clearSearch} variant="outline">
              Browse All Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {searchResults.map((product) => (
              <Card
                key={product.id}
                className="w-full bg-white rounded-xl shadow-[0px_4px_26px_#0000001a] overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleProductClick(product)}
              >
                <CardContent className="p-0">
                  <div className="relative h-[264px] overflow-hidden">
                    <img
                      className={`absolute object-cover ${product.imageClasses || 'w-full h-full'}`}
                      alt={product.name}
                      src={product.image || '/figmaAssets/placeholder.png'}
                    />
                  </div>

                  <div className="flex flex-col items-start gap-1 px-4 py-3">
                    <div className="text-xs text-gray-500 mb-1">
                      {product.category}
                    </div>
                    <h3 className="w-full font-bold text-gray-900 text-lg leading-tight">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="w-full flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-lg">
                        ₹{product.price}
                      </span>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        Available
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      </div>
    </div>
  );
};