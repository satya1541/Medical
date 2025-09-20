import { CalendarIcon, RefreshCw } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { NewsArticle } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export const LatestNewsSection = (): JSX.Element => {
  const { toast } = useToast();
  
  const { data: newsArticles, isLoading } = useQuery<NewsArticle[]>({
    queryKey: ['/api/news'],
    queryFn: () => fetch('/api/news?limit=4').then(res => res.json()),
  });

  // Generate dynamic placeholder based on article content
  const getDynamicPlaceholder = (title: string, sourceName: string): string => {
    const titleLower = title.toLowerCase();
    const sourceNameLower = sourceName.toLowerCase();
    
    // Medical topic-based placeholders
    if (titleLower.includes('diabetes') || titleLower.includes('blood sugar')) {
      return "/figmaAssets/pngegg--4--1.png"; // Blood glucose monitor
    }
    if (titleLower.includes('heart') || titleLower.includes('cardio') || titleLower.includes('blood pressure')) {
      return "/figmaAssets/pngegg--9--1.png"; // Blood pressure monitor
    }
    if (titleLower.includes('mental health') || titleLower.includes('depression') || titleLower.includes('anxiety')) {
      return "/figmaAssets/doctor-4-1.svg"; // Doctor consultation
    }
    if (titleLower.includes('vaccine') || titleLower.includes('injection') || titleLower.includes('immunotherapy')) {
      return "/figmaAssets/pngegg--10--1.png"; // Insulin pen/injection
    }
    if (titleLower.includes('pain') || titleLower.includes('medication') || titleLower.includes('treatment')) {
      return "/figmaAssets/pngegg--1--1-1.png"; // Medication/pills
    }
    if (titleLower.includes('skin') || titleLower.includes('gel') || titleLower.includes('cream')) {
      return "/figmaAssets/pngegg--5--1.png"; // Antiseptic cream
    }
    if (titleLower.includes('temperature') || titleLower.includes('fever') || titleLower.includes('thermometer')) {
      return "/figmaAssets/pngegg--3--1.png"; // Digital thermometer
    }
    if (titleLower.includes('mask') || titleLower.includes('protection') || titleLower.includes('safety')) {
      return "/figmaAssets/pngegg--7--1.png"; // Face mask
    }
    
    // Source-based placeholders
    if (sourceNameLower.includes('bbc') || sourceNameLower.includes('science')) {
      return "/figmaAssets/doctor-1.svg"; // Medical professional
    }
    
    // Default medical placeholder
    return "/figmaAssets/rectangle-12.svg";
  };

  // Conservative image quality enhancement - only upgrade known working patterns
  const enhanceImageQuality = (imageUrl: string): string => {
    if (!imageUrl) return imageUrl;
    
    try {
      const url = new URL(imageUrl);
      
      // BBC images - don't enhance, their system doesn't support size variations
      if (url.hostname.includes('ichef.bbci.co.uk')) {
        // BBC image URLs are generated dynamically and size variations often don't exist
        // Return original URL to avoid 1-byte responses
        return imageUrl;
      }
      
      // Reuters images - upgrade to larger size (these typically work)
      if (url.hostname.includes('reuters.com') || url.hostname.includes('reutersmedia.net')) {
        return imageUrl.replace(/[?&]w=\d+/gi, '?w=800').replace(/[?&]h=\d+/gi, '&h=600');
      }
      
      // CNN images - conservative quality upgrade
      if (url.hostname.includes('cnn.com') || url.hostname.includes('turner.com')) {
        return imageUrl.replace(/\/c_fill,w_\d+,h_\d+/gi, '/c_fill,w_800,h_450');
      }
      
      // Guardian images - moderate quality upgrade
      if (url.hostname.includes('guim.co.uk') || url.hostname.includes('theguardian.com')) {
        return imageUrl.replace(/width=\d+/gi, 'width=800').replace(/quality=\d+/gi, 'quality=85');
      }
      
      // Associated Press images - conservative upgrade
      if (url.hostname.includes('apnews.com') || url.hostname.includes('ap.org')) {
        return imageUrl.replace(/\/\d{2,4}x\d{2,4}\//gi, '/800x450/');
      }
      
      // For other sources, be very conservative with generic enhancements
      const searchParams = url.searchParams;
      if (searchParams.has('w') && parseInt(searchParams.get('w') || '0') < 400) {
        searchParams.set('w', '600'); // Modest increase only
      }
      if (searchParams.has('width') && parseInt(searchParams.get('width') || '0') < 400) {
        searchParams.set('width', '600'); // Modest increase only
      }
      
      return url.toString();
    } catch (error) {
      // If URL parsing fails, return original
      return imageUrl;
    }
  };

  const refreshNewsMutation = useMutation({
    mutationFn: () => 
      fetch('/api/news/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).then(res => res.json()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      toast({
        title: "News Updated!",
        description: `Successfully fetched ${data.count} new articles.`,
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to fetch latest news. Please try again later.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (isLoading) {
    return (
      <section className="flex flex-col items-center gap-8 pt-10 pb-[60px] px-4 sm:px-8 lg:px-20 xl:px-[100px] w-full bg-gray-50">
        <h2 className="text-center [font-family:'Nunito',Helvetica] font-bold text-black text-[32px] lg:text-[40px] tracking-[0] leading-[normal]">
          Our Latest News & Blogs
        </h2>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading latest news...</div>
        </div>
      </section>
    );
  }

  const articles = newsArticles || [];
  const featuredArticle = articles[0];
  const sideArticles = articles.slice(1, 4);

  // Show placeholder content if no articles are available
  if (articles.length === 0) {
    return (
      <section className="flex flex-col items-center gap-8 pt-10 pb-[60px] px-4 sm:px-8 lg:px-20 xl:px-[100px] w-full bg-gray-50">
        <h2 className="text-center [font-family:'Nunito',Helvetica] font-bold text-black text-[32px] lg:text-[40px] tracking-[0] leading-[normal]">
          Our Latest News & Blogs
        </h2>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500 text-center">
            <p>No news articles available at the moment.</p>
            <p className="text-sm">Check back later for the latest health news!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center gap-8 pt-10 pb-[60px] px-4 sm:px-8 lg:px-20 xl:px-[100px] w-full bg-gray-50">
      <div className="flex flex-col items-center gap-4 w-full">
        <h2 className="text-center [font-family:'Nunito',Helvetica] font-bold text-black text-[32px] lg:text-[40px] tracking-[0] leading-[normal]">
          Our Latest News & Blogs
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-8 w-full max-w-[1200px]">
        {/* Featured Article */}
        <Card className="w-full lg:w-[460px] bg-white rounded-[12px] border border-gray-200 overflow-hidden shadow-sm">
          <CardContent className="p-0">
            <img
              className="w-full h-[300px] object-cover"
              alt="Featured article"
              src={featuredArticle?.imageUrl ? enhanceImageQuality(featuredArticle.imageUrl) : getDynamicPlaceholder(featuredArticle?.title || '', featuredArticle?.sourceName || '')}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                // First try the original URL if enhancement failed
                if (featuredArticle?.imageUrl && target.src !== featuredArticle.imageUrl) {
                  target.src = featuredArticle.imageUrl;
                } else {
                  // If original also fails, use placeholder
                  target.src = getDynamicPlaceholder(featuredArticle?.title || '', featuredArticle?.sourceName || '');
                }
              }}
            />

            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Badge className="px-3 py-1 bg-green-100 text-green-600 hover:bg-green-100 rounded-md [font-family:'Poppins',Helvetica] font-normal text-sm">
                  {featuredArticle?.sourceName || "Health News"}
                </Badge>

                <div className="flex items-center gap-2 text-gray-500">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="[font-family:'Poppins',Helvetica] font-normal text-sm">
                    {featuredArticle?.publishedAt ? formatDate(featuredArticle.publishedAt) : 'Recent'}
                  </span>
                </div>
              </div>

              <h3 className="[font-family:'Nunito',Helvetica] font-semibold text-black text-xl mb-3 leading-tight">
                {truncateText(featuredArticle?.title || 'Latest Health News', 80)}
              </h3>

              <p className="[font-family:'Poppins',Helvetica] font-normal text-gray-600 text-sm mb-4 leading-relaxed">
                {truncateText(featuredArticle?.description || 'Stay updated with the latest medical news and health insights.', 150)}
              </p>

              <Button 
                className="px-4 py-2 bg-[#28a745] hover:bg-[#218838] text-white rounded-md text-sm font-medium"
                onClick={() => window.open(featuredArticle?.sourceUrl, '_blank')}
              >
                Read More
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Side Articles */}
        <div className="flex flex-col gap-6 w-full lg:flex-1">
          {sideArticles.map((article, index) => (
            <Card
              key={article.id || index}
              className="flex items-center gap-4 p-4 bg-white rounded-[12px] border border-gray-200 shadow-sm"
            >
              <img
                className="w-[120px] h-[90px] object-cover rounded-lg flex-shrink-0"
                alt="Article thumbnail"
                src={article?.imageUrl ? enhanceImageQuality(article.imageUrl) : getDynamicPlaceholder(article?.title || '', article?.sourceName || '')}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  // First try the original URL if enhancement failed
                  if (article?.imageUrl && target.src !== article.imageUrl) {
                    target.src = article.imageUrl;
                  } else {
                    // If original also fails, use placeholder
                    target.src = getDynamicPlaceholder(article?.title || '', article?.sourceName || '');
                  }
                }}
              />

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="px-2 py-1 bg-green-100 text-green-600 hover:bg-green-100 rounded text-xs [font-family:'Poppins',Helvetica] font-normal">
                    {article?.sourceName || "Health News"}
                  </Badge>

                  <div className="flex items-center gap-1 text-gray-500">
                    <CalendarIcon className="w-3 h-3" />
                    <span className="[font-family:'Poppins',Helvetica] font-normal text-xs">
                      {article?.publishedAt ? formatDate(article.publishedAt) : 'Recent'}
                    </span>
                  </div>
                </div>

                <h4 className="[font-family:'Nunito',Helvetica] font-semibold text-black text-base mb-2 leading-tight">
                  {truncateText(article?.title || 'Health News Update', 60)}
                </h4>

                <p className="[font-family:'Poppins',Helvetica] font-normal text-gray-600 text-sm mb-3 leading-relaxed">
                  {truncateText(article?.description || 'Latest updates from the medical community.', 80)}
                </p>

                <Button 
                  className="px-3 py-1.5 bg-[#28a745] hover:bg-[#218838] text-white rounded text-xs font-medium"
                  onClick={() => window.open(article?.sourceUrl, '_blank')}
                >
                  Read More
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
