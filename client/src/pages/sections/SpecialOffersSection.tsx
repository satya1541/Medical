import { UserIcon, PhoneIcon, MailIcon } from "lucide-react";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Contact } from "@shared/schema";

export const SpecialOffersSection = (): JSX.Element => {
  // Fetch contacts from the database
  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ['/api/contacts'],
    queryFn: async () => {
      const response = await fetch('/api/contacts');
      if (!response.ok) throw new Error('Failed to fetch contacts');
      return response.json();
    }
  });

  // Use the first contact (you can modify this logic to pick a specific contact)
  const contactInfo = contacts.length > 0 ? {
    name: contacts[0].name,
    phone: contacts[0].contactNumber,
    email: contacts[0].email
  } : {
    name: "Loading...",
    phone: "Loading...",
    email: "Loading..."
  };

  return (
    <section className="w-full px-4 sm:px-8 lg:px-20 py-8">
      <h3 className="text-black text-2xl font-bold [font-family:'Nunito',Helvetica] mb-6 text-center">
        Contact Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* Name Card */}
        <Card className="relative w-full h-auto rounded-xl overflow-hidden shadow-lg bg-gradient-to-r from-[#28a745] to-[#6fd600] border-0">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <UserIcon className="w-8 h-8 text-white" />
              <div>
                <div className="text-white/80 text-sm [font-family:'Poppins',Helvetica] mb-2">Name</div>
                <div className="text-white text-lg font-semibold [font-family:'Nunito',Helvetica]">
                  {contactInfo.name}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Number Card */}
        <Card className="relative w-full h-auto rounded-xl overflow-hidden shadow-lg bg-gradient-to-r from-[#28a745] to-[#6fd600] border-0 cursor-pointer hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <a href={`tel:${contactInfo.phone}`} className="block">
              <div className="flex flex-col items-center gap-4 text-center">
                <PhoneIcon className="w-8 h-8 text-white" />
                <div>
                  <div className="text-white/80 text-sm [font-family:'Poppins',Helvetica] mb-2">Contact Number</div>
                  <div className="text-white text-lg font-semibold [font-family:'Nunito',Helvetica]">
                    {contactInfo.phone}
                  </div>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        {/* Email Card */}
        <Card className="relative w-full h-auto rounded-xl overflow-hidden shadow-lg bg-gradient-to-r from-[#28a745] to-[#6fd600] border-0 cursor-pointer hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <a href={`mailto:${contactInfo.email}`} className="block">
              <div className="flex flex-col items-center gap-4 text-center">
                <MailIcon className="w-8 h-8 text-white" />
                <div>
                  <div className="text-white/80 text-sm [font-family:'Poppins',Helvetica] mb-2">Email</div>
                  <div className="text-white text-lg font-semibold [font-family:'Nunito',Helvetica]">
                    {contactInfo.email}
                  </div>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
