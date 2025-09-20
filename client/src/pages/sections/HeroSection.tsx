import { ShoppingBagIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import doctorImage from "@assets/smiling-young-male-doctor-wearing-medical-robe-stethoscope-showing-pack-medical-capsules-pointing-it-isolated-purple-wall_prev_ui_1757316626803.png";
import doctorImageMobile from "@assets/smiling-young-male-doctor-wearing-medical-robe-stethoscope-showing-pack-medical-capsules-pointing-it-isolated-purple-wall_prev_ui (1)_1757584683633.png";

export const HeroSection = (): JSX.Element => {
  const scrollToNewProducts = () => {
    const element = document.getElementById('new-arrivals');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full h-[490px] bg-[#28a745] overflow-hidden">
      <div className="flex flex-col items-start gap-6 absolute top-12 left-4 sm:left-8 md:left-16 lg:left-20 max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[605px]">
        <div className="flex flex-col items-start gap-2">
          <h1 className="w-full mt-[-1.00px] [font-family:'Nunito',Helvetica] font-extrabold text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0] leading-[normal]">
            Reliable Medicines, Delivered with Care & Trust
          </h1>

          <p className="w-full [font-family:'Poppins',Helvetica] font-normal text-[#cce5ff] text-sm sm:text-base tracking-[0] leading-[normal]">
            Partner with us for affordable, authentic, and timely medical supplies. As your trusted distributor, we ensure quality healthcare solutions are always within reach.
          </p>
        </div>

        <Button 
          onClick={scrollToNewProducts}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white rounded-lg hover:bg-gray-50 h-auto"
        >
          <span className="[font-family:'Nunito',Helvetica] font-semibold text-x-2-8a-745 text-base tracking-[0] leading-[normal]">
            Start Shopping
          </span>
          <ShoppingBagIcon className="w-6 h-6 text-x-2-8a-745" />
        </Button>
      </div>

      {/* Doctor Image */}
      <div className="absolute -bottom-80 left-1/2 transform -translate-x-1/2 h-[280px] w-auto flex items-end justify-center sm:top-0 sm:right-0 sm:left-auto sm:bottom-auto sm:transform-none sm:translate-x-0 sm:h-full sm:w-1/2 sm:items-center sm:justify-center">
        {/* Mobile Image */}
        <img 
          src={doctorImageMobile} 
          alt="Doctor holding medical capsules" 
          className="h-[750px] w-[600px] object-contain block sm:hidden"
        />
        {/* Desktop Image */}
        <img 
          src={doctorImage} 
          alt="Doctor holding medical capsules" 
          className="h-[750px] w-[600px] object-contain hidden sm:block sm:h-[650px] sm:w-auto"
        />
      </div>

    </section>
  );
};
