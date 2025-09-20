import { ChevronDownIcon, SearchIcon, MenuIcon, XIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearch } from "@/contexts/SearchContext";
import { fetchAllCategories, Product } from "@shared/products";

export const NavbarSection = (): JSX.Element => {
  const { searchQuery, selectedCategory, setSearchQuery, setSelectedCategory, performSearch, allProducts } = useSearch();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [categories, setCategories] = useState<string[]>(['All Categories']);
  const [productSuggestions, setProductSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadCategories = async () => {
      const dbCategories = await fetchAllCategories();
      setCategories(dbCategories);
    };
    loadCategories();
  }, []);

  // Sync local search query with global search query
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Generate product suggestions based on input
  const generateSuggestions = (query: string) => {
    if (!query.trim() || query.length < 2) {
      setProductSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filteredProducts = allProducts
      .filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm))
      )
      .slice(0, 6); // Limit to 6 product suggestions

    setProductSuggestions(filteredProducts);
    setShowSuggestions(filteredProducts.length > 0);
    setSelectedSuggestionIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    generateSuggestions(value);
  };

  const handleSearch = () => {
    setSearchQuery(localSearchQuery);
    setShowSuggestions(false);
  };

  const selectSuggestion = (product: Product) => {
    setLocalSearchQuery(product.name);
    setSearchQuery(product.name);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && productSuggestions[selectedSuggestionIndex]) {
        selectSuggestion(productSuggestions[selectedSuggestionIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < productSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > -1 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => setShowSuggestions(false), 150);
  };

  return (
    <header className="flex flex-col items-start w-full">
      <div className="flex items-center justify-between px-4 sm:px-8 lg:px-20 py-6 w-full bg-white">
        <Link href="/" className="cursor-pointer">
          <img
            className="w-[120px] sm:w-[156px] h-[35px] sm:h-[46px]"
            alt="Logo"
            src="/figmaAssets/logo.svg"
          />
        </Link>

        {/* Desktop Search Bar */}
        {!isMobile && (
          <div className="flex-1 max-w-4xl h-[60px] relative mx-8 lg:mx-11">
            <div className="relative w-full h-[60px] rounded-lg flex items-center bg-[#007bff08] border border-solid border-[#cdcdcd]">
              <div className="flex items-center gap-4 px-4 flex-1">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-auto border-none bg-transparent gap-2.5 text-[15px] font-medium text-x-666666">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category, index) => (
                      <SelectItem key={index} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <img
                  className="w-6 h-6"
                  alt="Line xl"
                  src="/figmaAssets/line-xl-1.svg"
                />
                
                <Input
                  value={localSearchQuery}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  onBlur={handleInputBlur}
                  onFocus={() => {
                    if (localSearchQuery.length >= 2) {
                      generateSuggestions(localSearchQuery);
                    }
                  }}
                  placeholder="Search medicine, medical products"
                  className="flex-1 border-none bg-transparent text-sm text-x-666666 focus:outline-none focus:ring-0 px-0"
                  autoComplete="off"
                />
              </div>
              
              <Button 
                className="w-[60px] h-[60px] rounded-lg p-0 flex-shrink-0 text-white border-0"
                style={{ backgroundColor: '#28a745' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#218838'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#28a745'}
                onClick={handleSearch}
              >
                <SearchIcon className="w-6 h-6 text-white" />
              </Button>
            </div>

            {/* Desktop Product Suggestions Dropdown */}
            {showSuggestions && productSuggestions.length > 0 && (
              <div className="absolute top-full left-52 w-80 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {productSuggestions.map((product: Product, index: number) => (
                  <div
                    key={product.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                      index === selectedSuggestionIndex
                        ? 'bg-[#28a745] text-white'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => selectSuggestion(product)}
                    onMouseEnter={() => setSelectedSuggestionIndex(index)}
                    onMouseLeave={() => setSelectedSuggestionIndex(-1)}
                  >
                    <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={product.image || '/figmaAssets/placeholder.png'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${
                        index === selectedSuggestionIndex ? 'text-white' : 'text-gray-900'
                      }`}>
                        {product.name}
                      </div>
                      <div className={`text-xs truncate ${
                        index === selectedSuggestionIndex ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {product.category}
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${
                      index === selectedSuggestionIndex ? 'text-white' : 'text-[#28a745]'
                    }`}>
                      {product.price}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-4">

          {/* Mobile Hamburger Menu */}
          {isMobile && (
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="lg" className="p-4">
                  <MenuIcon className="w-9 h-9" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="py-6">
                  
                  {/* Mobile Categories */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                    {categories.map((category, index) => (
                      <button
                        key={index}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category 
                            ? 'bg-[#28a745] text-white' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setSelectedCategory(category);
                          setSearchQuery('');
                          setLocalSearchQuery('');
                          setIsMenuOpen(false);
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      {/* Mobile Search Bar (below header) */}
      {isMobile && (
        <div className="w-full px-4 pb-4 bg-white border-b border-gray-200">
          <div className="relative w-full h-[50px] rounded-lg flex items-center bg-[#007bff08] border border-solid border-[#cdcdcd]">
            <div className="flex items-center gap-2 px-3 flex-1">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-auto border-none bg-transparent gap-2 text-sm font-medium text-x-666666">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category, index) => (
                    <SelectItem key={index} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="w-px h-4 bg-gray-300" />
              
              <Input
                value={localSearchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                onBlur={handleInputBlur}
                onFocus={() => {
                  if (localSearchQuery.length >= 2) {
                    generateSuggestions(localSearchQuery);
                  }
                }}
                placeholder="Search medicine, medical products"
                className="flex-1 border-none bg-transparent text-sm text-x-666666 focus:outline-none focus:ring-0 px-0"
                autoComplete="off"
                autoFocus={false}
              />
            </div>
            
            <Button 
              className="w-[50px] h-[50px] rounded-lg p-0 flex-shrink-0 text-white border-0"
              style={{ backgroundColor: '#28a745' }}
              onClick={handleSearch}
            >
              <SearchIcon className="w-5 h-5 text-white" />
            </Button>
          </div>

          {/* Mobile Product Suggestions Dropdown */}
          {showSuggestions && productSuggestions.length > 0 && (
            <div className="absolute left-4 right-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {productSuggestions.map((product: Product, index: number) => (
                <div
                  key={product.id}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                    index === selectedSuggestionIndex
                      ? 'bg-[#28a745] text-white'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => selectSuggestion(product)}
                >
                  <div className="w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={product.image || '/figmaAssets/placeholder.png'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${
                      index === selectedSuggestionIndex ? 'text-white' : 'text-gray-900'
                    }`}>
                      {product.name}
                    </div>
                    <div className={`text-xs truncate ${
                      index === selectedSuggestionIndex ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      {product.category}
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${
                    index === selectedSuggestionIndex ? 'text-white' : 'text-[#28a745]'
                  }`}>
                    {product.price}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Navigation */}
      <div className="w-full">
        <div className="flex h-14 items-center justify-start px-2 sm:px-4 lg:px-8 py-3.5 w-full bg-white border-t border-solid border-[#e1e6eb] overflow-x-auto sm:overflow-hidden scrollbar-hide">
          <div className="flex gap-1 sm:gap-2 lg:gap-2 whitespace-nowrap">
            <button
              type="button"
              className={`[font-family:'Nunito',Helvetica] font-semibold text-sm lg:text-base tracking-[0] leading-[normal] cursor-pointer transition-colors px-2 py-1 whitespace-nowrap rounded ${
                selectedCategory === 'All Categories' 
                  ? 'bg-[#28a745] text-white' 
                  : 'text-x-333333 hover:text-[#28a745] hover:bg-gray-50'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedCategory('All Categories');
                setSearchQuery('');
                setLocalSearchQuery('');
              }}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
            >
              All Categories
            </button>
            {categories.slice(1).map((item: string, index: number) => (
              <button
                key={index}
                type="button"
                className={`[font-family:'Nunito',Helvetica] font-semibold text-sm lg:text-base tracking-[0] leading-[normal] cursor-pointer transition-colors px-2 py-1 whitespace-nowrap rounded ${
                  selectedCategory === item 
                    ? 'bg-[#28a745] text-white' 
                    : 'text-x-333333 hover:text-[#28a745] hover:bg-gray-50'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedCategory(item);
                  setSearchQuery('');
                  setLocalSearchQuery('');
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
