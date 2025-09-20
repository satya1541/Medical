import React from "react";
import { FooterSection } from "./sections/FooterSection";
import { HeroSection } from "./sections/HeroSection";
import { LatestNewsSection } from "./sections/LatestNewsSection";
import { MainContentSection } from "./sections/MainContentSection";
import { NavbarSection } from "./sections/NavbarSection";
import { NewArrivalsSection } from "./sections/NewArrivalsSection";
import { OffersProductsSection } from "./sections/OffersProductsSection";
import { PromotionalBannerSection } from "./sections/PromotionalBannerSection";
import { SpecialOffersSection } from "./sections/SpecialOffersSection";
import { SearchResults } from "@/components/SearchResults";
import { useSearch } from "@/contexts/SearchContext";

export const OripioMedico = (): JSX.Element => {
  const { isSearchActive } = useSearch();

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white w-full">
      <div className="bg-white w-full max-w-[1440px] mx-auto relative">
        <NavbarSection />
      </div>
      <SearchResults />
      {!isSearchActive && (
        <>
          <div id="hero">
            <HeroSection />
          </div>
          <div className="bg-white w-full max-w-[1440px] mx-auto relative">
            <div id="special-offers">
              <SpecialOffersSection />
            </div>
            <div id="new-arrivals">
              <NewArrivalsSection />
            </div>
            <div id="offers">
              <OffersProductsSection />
            </div>
            <div id="main-content">
              <MainContentSection />
            </div>
            <div id="promotional-banner">
              <PromotionalBannerSection />
            </div>
            <div id="latest-news">
              <LatestNewsSection />
            </div>
          </div>
        </>
      )}
      <FooterSection />
    </div>
  );
};
