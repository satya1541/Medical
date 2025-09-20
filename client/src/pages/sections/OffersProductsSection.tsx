import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Offer } from "@shared/schema";

export const OffersProductsSection = (): JSX.Element => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch('/api/offers');
        const offersData = await response.json();
        setOffers(offersData);
      } catch (error) {
        console.error('Failed to fetch offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  if (loading) {
    return (
      <section className="flex items-center justify-center gap-5 w-full px-4 sm:px-8 lg:px-20 py-8">
        <div className="text-center">Loading offers...</div>
      </section>
    );
  }

  if (offers.length === 0) {
    return (
      <section className="flex items-center justify-center gap-5 w-full px-4 sm:px-8 lg:px-20 py-8">
        <div className="text-center text-gray-500">No offers available at the moment.</div>
      </section>
    );
  }

  // Separate featured (large) offers from regular offers
  const featuredOffers = offers.filter(offer => offer.isLarge);
  const regularOffers = offers.filter(offer => !offer.isLarge);
  
  // Use the first featured offer for the large card, fallback to first offer
  const featuredOffer = featuredOffers.length > 0 ? featuredOffers[0] : offers[0];
  const smallOffers = featuredOffers.length > 0 ? regularOffers : offers.slice(1);

  return (
    <section className="flex flex-col lg:flex-row items-start gap-5 w-full px-4 sm:px-8 lg:px-20 py-8">
      {/* Large Featured Product Card */}
      <Card className="relative w-full lg:w-[723px] h-[400px] lg:h-[500px] bg-[url(/figmaAssets/rectangle-15.svg)] bg-cover bg-center border-0 overflow-hidden">
        <CardContent className="p-0 h-full relative">
          <div className="flex items-center h-full">
            <div className="flex-1 p-6 lg:p-8 z-10">
              <div className="space-y-4">
                <Badge className="inline-flex items-center justify-center px-4 py-2 bg-[#28a745] rounded-lg border-0 hover:bg-[#28a745]">
                  <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-lg">
                    {featuredOffer.discount}
                  </span>
                </Badge>

                <div className="space-y-3">
                  <h2 className="[font-family:'Nunito',Helvetica] font-bold text-black text-2xl lg:text-3xl leading-tight max-w-[180px] lg:max-w-[300px]">
                    {featuredOffer.title}
                  </h2>

                  <p className="[font-family:'Nunito',Helvetica] font-semibold text-black text-base lg:text-lg leading-relaxed max-w-[180px] lg:max-w-[320px]">
                    {featuredOffer.subtitle}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="[font-family:'Poppins',Helvetica] font-medium text-gray-500 text-base line-through block">
                    {featuredOffer.originalPrice}
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="[font-family:'Nunito',Helvetica] font-extrabold text-black text-2xl lg:text-3xl">
                      {featuredOffer.currentPrice}
                    </span>
                    <span className="[font-family:'Poppins',Helvetica] font-normal text-black text-sm">
                      Including Tax
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute right-2 lg:right-8 top-1/2 transform -translate-y-1/2">
              <img
                className="w-[120px] lg:w-[250px] h-[160px] lg:h-[350px] object-contain"
                alt={featuredOffer.imageAlt || featuredOffer.title}
                src={featuredOffer.image || '/figmaAssets/placeholder.png'}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smaller Product Cards */}
      <div className="flex flex-col gap-5 w-full lg:w-auto">
        {smallOffers.map((product) => (
          <Card
            key={product.id}
            className="relative w-full lg:w-[537px] h-[200px] lg:h-[240px] bg-[url(/figmaAssets/rectangle-15.svg)] bg-cover bg-center border-0 overflow-hidden"
          >
            <CardContent className="p-0 h-full relative">
              <div className="flex items-center h-full p-4 lg:p-6">
                <div className="flex-1 space-y-3 pr-4">
                  <Badge className="inline-flex items-center justify-center px-3 py-1 bg-[#28a745] rounded-lg border-0 hover:bg-[#28a745]">
                    <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-sm lg:text-base">
                      {product.discount}
                    </span>
                  </Badge>

                  <h3 className="[font-family:'Nunito',Helvetica] font-semibold text-black text-sm lg:text-base leading-tight max-w-[200px]">
                    {product.title}
                  </h3>

                  <div className="space-y-1">
                    <span className="[font-family:'Poppins',Helvetica] font-medium text-gray-500 text-sm line-through block">
                      {product.originalPrice}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="[font-family:'Nunito',Helvetica] font-extrabold text-black text-lg lg:text-xl">
                        {product.currentPrice}
                      </span>
                      <span className="[font-family:'Poppins',Helvetica] font-normal text-black text-xs">
                        Including Tax
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <img
                    className="w-[100px] lg:w-[140px] h-[100px] lg:h-[140px] object-contain rounded-lg"
                    alt={product.imageAlt || product.title}
                    src={product.image || '/figmaAssets/placeholder.png'}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};