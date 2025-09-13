import { ArrowRightIcon } from "lucide-react";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const products = [
  {
    id: 1,
    name: "Oxygen Mask",
    price: "₹2.00",
    image: "/figmaAssets/image-4.png",
    imageClasses: "w-[266px] h-[212px] top-[30px] left-5 object-cover",
  },
  {
    id: 2,
    name: "Surgical Gloves",
    price: "₹1.99",
    image: "/figmaAssets/pngegg-1.png",
    imageClasses: "w-[209px] h-[213px] top-[25px] left-12 object-cover",
  },
  {
    id: 3,
    name: "Medical Mask",
    price: "₹0.89",
    image: "/figmaAssets/pngwing-4.png",
    imageClasses: "w-60 h-[220px] top-[22px] left-[33px]",
  },
  {
    id: 4,
    name: "Hand Sanitizer",
    price: "₹4.00",
    image: "/figmaAssets/pngwing-3.png",
    imageClasses: "w-60 h-60 top-3 left-5 object-cover",
  },
];

export const NewArrivalsWrapperSection = (): JSX.Element => {
  return (
    <section className="flex flex-col items-center gap-4 w-full">
      <div className="flex w-full max-w-[1280px] items-center justify-between">
        <h2 className="ml-4 sm:ml-0 [font-family:'Nunito',Helvetica] font-bold text-style text-[32px] tracking-[0] leading-[normal]">
          Popular Products
        </h2>

        <div className="inline-flex items-center gap-2 cursor-pointer">
          <span className="[font-family:'Nunito',Helvetica] font-bold text-[#28a745] text-base tracking-[0] leading-[normal]">
            View All
          </span>
          <ArrowRightIcon className="w-6 h-6 text-[#28a745]" />
        </div>
      </div>

      <div className="flex items-center justify-center gap-5 w-full">
        {products.map((product) => (
          <Card
            key={product.id}
            className="w-[305px] bg-white rounded-xl shadow-[0px_4px_26px_#0000001a] overflow-hidden"
          >
            <CardContent className="p-0">
              <div className="relative h-[264px] overflow-hidden">
                <img
                  className={`absolute ${product.imageClasses}`}
                  alt={product.name}
                  src={product.image}
                />
              </div>

              <div className="flex flex-col items-start gap-1 px-2 py-3 border-t border-[#e7e7e7]">
                <h3 className="w-[281px] [font-family:'Nunito',Helvetica] font-bold text-style text-xl tracking-[0] leading-[normal]">
                  {product.name}
                </h3>
                <div className="inline-flex items-start gap-2">
                  <span className="[font-family:'Nunito',Helvetica] font-bold text-x-333333 text-base tracking-[0] leading-[normal]">
                    {product.price}
                  </span>
                </div>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
