import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, searchProducts, fetchAllProducts } from '@shared/products';

interface SearchContextType {
  searchQuery: string;
  selectedCategory: string;
  searchResults: Product[];
  isSearchActive: boolean;
  allProducts: Product[];
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  performSearch: () => void;
  clearSearch: () => void;
  refreshProducts: () => Promise<void>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const products = await fetchAllProducts();
      setAllProducts(products);
    };
    loadProducts();
  }, []);

  const performSearch = () => {
    if (searchQuery.trim() || selectedCategory !== 'All Categories') {
      const results = searchProducts(allProducts, searchQuery, selectedCategory);
      setSearchResults(results);
      setIsSearchActive(true);
    } else {
      clearSearch();
    }
  };

  // Auto-trigger search when category or search query changes
  useEffect(() => {
    if (allProducts.length === 0) return; // Wait for products to load
    
    if (searchQuery.trim() || selectedCategory !== 'All Categories') {
      const results = searchProducts(allProducts, searchQuery, selectedCategory);
      setSearchResults(results);
      setIsSearchActive(true);
    } else {
      // If "All Categories" is selected and no search query, return to home page
      clearSearch();
    }
  }, [selectedCategory, allProducts, searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSearchResults([]);
    setIsSearchActive(false);
  };

  const refreshProducts = async () => {
    const products = await fetchAllProducts();
    setAllProducts(products);
  };

  return (
    <SearchContext.Provider value={{
      searchQuery,
      selectedCategory,
      searchResults,
      isSearchActive,
      allProducts,
      setSearchQuery,
      setSelectedCategory,
      performSearch,
      clearSearch,
      refreshProducts
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};