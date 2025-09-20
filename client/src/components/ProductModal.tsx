import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@shared/products";
import { useToast } from "@/hooks/use-toast";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const { toast } = useToast();

  if (!product) return null;

  const handleContactInquiry = () => {
    toast({
      title: "Inquiry Sent",
      description: `Thank you for your interest in ${product.name}. We'll contact you soon with more information.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {product.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative h-80 bg-gray-50 rounded-lg overflow-hidden">
            <img
              src={product.image || '/placeholder-product.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {product.category}
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Available
              </Badge>
            </div>
            
            <div className="text-3xl font-bold text-gray-900">
              ₹{product.price}
            </div>
            
            <div className="text-gray-600 leading-relaxed">
              {product.description || "High-quality medical product designed for professional healthcare use. Meets all safety standards and regulations."}
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Product Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {product.features ? (
                  product.features.split('\n').filter((feature: string) => feature.trim()).map((feature: string, index: number) => (
                    <li key={index}>• {feature.trim()}</li>
                  ))
                ) : (
                  <>
                    <li>• Medical grade quality</li>
                    <li>• CE certified and FDA approved</li>
                    <li>• Sterile packaging</li>
                    <li>• Professional healthcare use</li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="flex flex-col gap-2 mt-4">
              <Button 
                onClick={handleContactInquiry}
                className="bg-[#28a745] hover:bg-[#218838] text-white"
              >
                Contact for Inquiry
              </Button>
              <Button variant="outline" onClick={onClose}>
                Continue Browsing
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};