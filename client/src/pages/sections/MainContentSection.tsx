import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import newIcon from "@assets/Screenshot 2025-09-09 113850_1757398259673.png";
import awardIcon from "@assets/Screenshot 2025-09-09 113913_1757398357508.png";
import customersIcon from "@assets/Screenshot 2025-09-09 113932_1757398391922.png";
import reviewsIcon from "@assets/Screenshot 2025-09-09 114014_1757398416007.png";

export const MainContentSection = (): JSX.Element => {
  const statsData = [
    {
      icon: newIcon,
      number: "14K+",
      description: "Orders Completed",
      bgColor: "bg-[#bfe5c7]",
    },
    {
      icon: awardIcon,
      number: "250+",
      description: "Won Awards",
      bgColor: "bg-[#faedc9]",
    },
    {
      icon: customersIcon,
      number: "8K+",
      description: "Happy Customers",
      bgColor: "bg-[#c5ef99]",
    },
    {
      icon: reviewsIcon,
      number: "12K+",
      description: "Positive Reviews",
      bgColor: "bg-[#f8ecfe]",
    },
  ];

  return (
    <section className="w-full px-4 sm:px-8 lg:px-20 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-[1280px] mx-auto">
      {statsData.map((stat, index) => (
        <Card
          key={index}
          className={`w-full max-w-[305px] h-[181px] ${stat.bgColor} rounded-[14px] border-0 mx-auto`}
        >
          <CardContent className="p-0">
            <div className="flex flex-col items-start gap-[11px] pt-[30px] pl-6">
              <div className="flex items-center gap-3.5">
                <img className="w-10 h-10" alt="Group" src={stat.icon} />
                <div className="[font-family:'Nunito',Helvetica] font-extrabold text-[#020a13] text-[32px] tracking-[0] leading-[normal]">
                  {stat.number}
                </div>
              </div>
              <div className="w-[125px] [font-family:'Nunito',Helvetica] font-bold text-[#020a13] text-2xl tracking-[0] leading-[normal]">
                {stat.description}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      </div>
    </section>
  );
};
