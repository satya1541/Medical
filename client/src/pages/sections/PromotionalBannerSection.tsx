import { ShoppingBagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { SiteContent } from "@shared/schema";
import medicalCapsulesBgImage from "@assets/erasebg-transformed_1757749540959.png";

export const PromotionalBannerSection = (): JSX.Element => {
  const scrollToNewProducts = () => {
    const element = document.getElementById('new-arrivals');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  // Fetch banner content from API
  const { data: siteContent, isLoading } = useQuery<SiteContent[]>({
    queryKey: ['/api/content']
  });

  // Extract banner content from site content with type information
  const bannerContent: { [key: string]: string } = {};
  const contentTypes: { [key: string]: string } = {};
  siteContent?.filter(item => item.section === 'promotional_banner')
              .forEach(item => {
                bannerContent[item.key] = item.value;
                contentTypes[item.key] = item.type || 'text';
              });

  // Default content while loading
  const content = {
    title: bannerContent.title || "Unlock 50% Off",
    subtitle: bannerContent.subtitle || "on Essential Medicines",
    discount_text: bannerContent.discount_text || "50% OFF",
    description: bannerContent.description || "Get premium medical supplies at unbeatable prices",
    cta_button: bannerContent.cta_button || "Shop Now",
    icon: bannerContent.icon || "🏥",
    iconType: contentTypes.icon || 'text'
  };

  return (
    <section className="w-full bg-[#f6f9ff] py-12" data-testid="section-promotional-banner">
      <div className="container mx-auto px-4 sm:px-8 lg:px-20 max-w-[1440px]">
        <Card className="relative w-full bg-[#28a745] border-0 overflow-hidden shadow-lg min-h-[300px] lg:min-h-[400px]">
          <CardContent className="p-0 h-full">
            <div className="flex flex-col lg:flex-row items-center h-full">
              {/* Text Content */}
              <div className="flex-1 p-6 lg:p-16 flex items-center">
                <div className="space-y-6 max-w-2xl">
                  {/* Discount Text */}
                  <div 
                    className="text-white text-xl font-bold"
                    data-testid="text-discount"
                  >
                    {content.discount_text}
                  </div>

                  {/* Main Title */}
                  <h2 
                    className="[font-family:'Nunito',Helvetica] font-bold text-white text-4xl lg:text-6xl leading-tight"
                    data-testid="text-banner-title"
                  >
                    {content.title}
                  </h2>

                  {/* Subtitle */}
                  <h3 
                    className="[font-family:'Nunito',Helvetica] font-semibold text-white/90 text-2xl lg:text-3xl"
                    data-testid="text-banner-subtitle"
                  >
                    {content.subtitle}
                  </h3>

                  {/* Description */}
                  <p 
                    className="[font-family:'Poppins',Helvetica] text-white/80 text-lg lg:text-xl leading-relaxed max-w-xl"
                    data-testid="text-banner-description"
                  >
                    {content.description}
                  </p>

                  {/* CTA Button */}
                  <Button 
                    onClick={scrollToNewProducts}
                    className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white rounded-lg hover:bg-gray-50 h-auto mt-8"
                    data-testid="button-banner-cta"
                  >
                    <span className="[font-family:'Nunito',Helvetica] font-semibold text-[#28a745] text-base tracking-[0] leading-[normal]">
                      {content.cta_button}
                    </span>
                    <ShoppingBagIcon className="w-6 h-6 text-[#28a745]" />
                  </Button>
                </div>
              </div>

              {/* Visual Element */}
              <div className="flex-shrink-0 lg:w-2/5 flex items-center justify-center p-2 lg:p-4 h-[350px] lg:h-[450px]">
                <img 
                  src={content.iconType === 'image' && content.icon && content.icon !== '🏥' ? content.icon : medicalCapsulesBgImage} 
                  alt="Promotional banner image" 
                  className="w-full h-full object-contain"
                  data-testid="img-banner-background"
                />
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <div className="text-white text-lg">Loading...</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
