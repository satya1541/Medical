import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Contact } from "@shared/schema";

export const FooterSection = (): JSX.Element => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Fetch contacts from the database for footer
  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
    queryFn: async () => {
      const response = await fetch("/api/contacts");
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return response.json();
    },
  });

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubscribing(true);
    
    try {
      const response = await fetch("/api/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          toast({
            title: "Already Subscribed",
            description: "This email is already subscribed to our newsletter.",
            variant: "destructive",
          });
        } else {
          throw new Error(errorData.error || "Failed to subscribe");
        }
        return;
      }

      toast({
        title: "Successfully Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast({
        title: "Subscription Failed",
        description: "There was an error subscribing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const quickLinks = ["Home", "About", "Services", "Careers", "Contact"];

  const specialties = [
    "Anesthesiology",
    "Psychiatry",
    "General surgery",
    "Family medicine",
    "Pediatrics",
  ];

  const services = [
    "Medical",
    "Operation",
    "Laboratory",
    "ICU",
    "Patient Ward",
  ];

  // Use the second contact (Emergency Hotline) for footer, or create dynamic mapping
  const footerContact =
    contacts.find((contact) => contact.name.includes("Emergency")) ||
    contacts[1] ||
    contacts[0];

  const contactInfo = footerContact
    ? [
        ...(footerContact.address
          ? [
              {
                icon: MapPinIcon,
                text: footerContact.address,
              },
            ]
          : []),
        {
          icon: PhoneIcon,
          text: footerContact.contactNumber,
        },
        {
          icon: MailIcon,
          text: footerContact.email,
        },
      ]
    : [
        {
          icon: MapPinIcon,
          text: "Loading...",
        },
        {
          icon: PhoneIcon,
          text: "Loading...",
        },
        {
          icon: MailIcon,
          text: "Loading...",
        },
      ];

  return (
    <footer className="flex flex-col items-center gap-12 lg:gap-20 pt-12 lg:pt-20 pb-10 bg-[#28a745] w-full">
      <div className="flex flex-col items-center gap-8 w-full px-4 sm:px-8 lg:px-16 xl:px-[100px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 w-full">
          <div className="flex flex-col items-start gap-5">
            <h3 className="[font-family:'General_Sans-Semibold',Helvetica] font-normal text-white text-xl tracking-[0] leading-[normal]">
              Contact
            </h3>
            <div className="flex flex-col items-start gap-3.5">
              {contactInfo.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200 group"
                  onClick={() => {
                    if (item.icon === PhoneIcon) {
                      window.open(`tel:${item.text}`, "_self");
                    } else if (item.icon === MailIcon) {
                      window.open(`mailto:${item.text}`, "_self");
                    } else if (item.icon === MapPinIcon) {
                      // Enhanced Google Maps URL for better location accuracy
                      const mapsUrl = `https://maps.app.goo.gl/${encodeURIComponent(item.text)}`;
                      window.open(mapsUrl, "_blank");
                    }
                  }}
                  title={
                    item.icon === PhoneIcon
                      ? "Call us"
                      : item.icon === MailIcon
                        ? "Send email"
                        : item.icon === MapPinIcon
                          ? "View on Google Maps"
                          : ""
                  }
                >
                  <item.icon className="w-5 h-5 text-[#e0eef9] group-hover:text-white transition-colors" />
                  <span className="[font-family:'General_Sans-Medium',Helvetica] font-medium text-[#e0eef9] text-base tracking-[0] leading-[normal] group-hover:text-white transition-colors">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start gap-5">
            <h3 className="[font-family:'General_Sans-Semibold',Helvetica] font-normal text-white text-xl tracking-[0] leading-[normal]">
              Quick Links
            </h3>
            <div className="flex flex-col items-start gap-3.5">
              {quickLinks.map((link, index) => (
                <a
                  key={index}
                  href="#"
                  className="[font-family:'General_Sans-Medium',Helvetica] font-medium text-[#e0eef9] text-base tracking-[0] leading-[normal] hover:text-white transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    // Add navigation logic based on link
                    if (link === "Home") {
                      document
                        .getElementById("hero")
                        ?.scrollIntoView({ behavior: "smooth" });
                    } else if (link === "Services") {
                      document
                        .getElementById("featured-products")
                        ?.scrollIntoView({ behavior: "smooth" });
                    } else if (link === "About") {
                      document
                        .getElementById("main-content")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start gap-5">
            <h3 className="[font-family:'General_Sans-Semibold',Helvetica] font-normal text-white text-xl tracking-[0] leading-[normal]">
              Specialties
            </h3>
            <div className="flex flex-col items-start gap-3.5">
              {specialties.map((specialty, index) => (
                <a
                  key={index}
                  href="#"
                  className="[font-family:'General_Sans-Medium',Helvetica] font-medium text-[#e0eef9] text-base tracking-[0] leading-[normal] hover:text-white transition-colors cursor-pointer"
                >
                  {specialty}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start gap-5">
            <h3 className="[font-family:'General_Sans-Semibold',Helvetica] font-normal text-white text-xl tracking-[0] leading-[normal]">
              Services
            </h3>
            <div className="flex flex-col items-start gap-3.5">
              {services.map((service, index) => (
                <a
                  key={index}
                  href="#"
                  className="[font-family:'General_Sans-Medium',Helvetica] font-medium text-[#e0eef9] text-base tracking-[0] leading-[normal] hover:text-white transition-colors cursor-pointer"
                >
                  {service}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start gap-5">
            <h3 className="[font-family:'General_Sans-Semibold',Helvetica] font-normal text-white text-xl tracking-[0] leading-[normal]">
              Newsletter
            </h3>
            <div className="flex flex-col gap-3 w-full">
              <p className="[font-family:'General_Sans-Medium',Helvetica] font-medium text-[#e0eef9] text-sm tracking-[0] leading-[normal]">
                Subscribe to get updates on new products and health tips
              </p>
              <form
                onSubmit={handleNewsletterSignup}
                className="flex flex-col gap-2 w-full"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white"
                />
                <Button
                  type="submit"
                  disabled={isSubscribing}
                  className="bg-white text-[#28a745] hover:bg-white/90 font-medium"
                >
                  {isSubscribing ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
            </div>
          </div>

          <div className="flex flex-col items-start gap-5">
            <h3 className="[font-family:'General_Sans-Semibold',Helvetica] font-normal text-white text-xl tracking-[0] leading-[normal]">
              Social Media
            </h3>
            <img
              className="flex-[0_0_auto] cursor-pointer hover:opacity-80 transition-opacity"
              alt="Social media icons"
              src="/figmaAssets/frame-94.svg"
              onClick={() => {
                toast({
                  title: "Follow Us",
                  description: "Connect with us on social media for updates!",
                });
              }}
            />
          </div>
        </div>

        <div className="flex flex-col items-start gap-5 w-full">
          <Separator className="w-full h-px bg-[#ffffff3b]" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 w-full">
            <span className="[font-family:'General_Sans-Regular',Helvetica] font-normal text-[#e0eef9] text-base tracking-[0] leading-[normal]">
              © 2023 HEALTHY. All rights reserved.
            </span>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <a
                href="#"
                className="[font-family:'General_Sans-Regular',Helvetica] font-normal text-[#e0eef9] text-base tracking-[0] leading-[normal] hover:text-white transition-colors cursor-pointer"
              >
                Terms and Conditions
              </a>
              <a
                href="#"
                className="[font-family:'General_Sans-Regular',Helvetica] font-normal text-[#e0eef9] text-base tracking-[0] leading-[normal] hover:text-white transition-colors cursor-pointer"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
