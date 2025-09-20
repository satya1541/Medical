import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SuccessPopup, useSuccessPopup } from '@/components/ui/success-popup';
import { ConfirmationDialog, useConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { User, SiteContent, Product, Category, Contact, Offer } from '@shared/schema';
import { Loader2, Save, Eye, EyeOff, Info, Users, Package, FileText, Settings, Mail, Sparkles } from 'lucide-react';

interface AdminPageProps {}

export const AdminPage: React.FC<AdminPageProps> = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [siteContent, setSiteContent] = useState<SiteContent[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [currentTab, setCurrentTab] = useState('content');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const { toast } = useToast();
  const { popupState, showSuccess, closePopup } = useSuccessPopup();
  const { dialogState, showConfirmation, closeDialog, setLoading } = useConfirmationDialog();

  // Auto-center active tab when selected
  useEffect(() => {
    const activeTabRef = tabRefs.current[currentTab];
    if (activeTabRef) {
      activeTabRef.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [currentTab]);

  // Login function
  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.user) {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        toast({ title: 'Login successful', description: 'Welcome to admin panel' });
        loadAdminData();
      }
    } catch (error) {
      toast({ title: 'Login failed', description: 'Invalid credentials', variant: 'destructive' });
    }
  };

  // Load admin data with loading state
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [contentRes, productsRes, categoriesRes, contactsRes, offersRes] = await Promise.all([
        fetch('/api/content').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/contacts').then(r => r.json()),
        fetch('/api/offers').then(r => r.json())
      ]);
      
      setSiteContent(contentRes);
      setProducts(productsRes);
      setCategories(categoriesRes);
      setContacts(contactsRes);
      setOffers(offersRes);
      
      // Show subtle success feedback when data loads
      if (isLoggedIn) {
        showSuccess('Data Refreshed', 'All admin data has been updated successfully', 'update');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load admin data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Content management with enhanced feedback
  const updateContent = async (section: string, key: string, value: string, type: string = 'text') => {
    const loadingKey = `content-${section}-${key}`;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      await fetch('/api/content', {
        method: 'POST',
        body: JSON.stringify({ section, key, value, type }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      showSuccess('Content Updated', `${key} has been updated successfully`, 'save');
      loadAdminData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update content', variant: 'destructive' });
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  // Offer management
  const createOffer = async (offerData: any) => {
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        body: JSON.stringify(offerData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      toast({ title: 'Success', description: 'Offer created successfully' });
      loadAdminData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create offer', variant: 'destructive' });
    }
  };

  const deleteOffer = async (id: number) => {
    try {
      await fetch(`/api/offers/${id}`, { method: 'DELETE' });
      toast({ title: 'Success', description: 'Offer deleted successfully' });
      loadAdminData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete offer', variant: 'destructive' });
    }
  };

  // Enhanced product management
  const createProduct = async (productData: any) => {
    setLoadingStates(prev => ({ ...prev, 'create-product': true }));
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        body: JSON.stringify(productData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      showSuccess('Product Created', `${productData.name} has been added to your catalog`, 'create');
      loadAdminData();
    } catch (error) {
      console.error('Product creation error:', error);
      toast({ title: 'Error', description: 'Failed to create product', variant: 'destructive' });
    } finally {
      setLoadingStates(prev => ({ ...prev, 'create-product': false }));
    }
  };

  const deleteProduct = async (id: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    showConfirmation({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete Product',
      onConfirm: async () => {
        setLoading(true);
        try {
          await fetch(`/api/products/${id}`, { method: 'DELETE' });
          showSuccess('Product Deleted', `${product.name} has been removed from your catalog`, 'delete');
          loadAdminData();
          closeDialog();
        } catch (error) {
          toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
        } finally {
          setLoading(false);
        }
      }
    });
  };


  // Image upload with optimization
  const uploadImage = async (file: File) => {
    try {
      // Check file size before upload
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'Error', description: 'Image must be smaller than 10MB', variant: 'destructive' });
        return null;
      }

      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Upload error:', error); // Debug log
      toast({ title: 'Error', description: 'Failed to upload image', variant: 'destructive' });
      return null;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#7CB342'}}>
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#28a745] to-[#007bff] flex items-center justify-center mb-4">
              <img src="/figmaAssets/logo.svg" alt="Oripio Medico" className="w-10 h-10" />
            </div>
            <CardTitle className="[font-family:'Nunito',Helvetica] font-bold text-2xl text-[#333333]">Admin Portal</CardTitle>
            <CardDescription className="[font-family:'Poppins',Helvetica] text-[#666666]">Oripio Medico Management System</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-6">
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="[font-family:'Nunito',Helvetica] font-semibold text-[#333333]">Username</Label>
                <Input
                  id="username"
                  data-testid="input-username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="Enter your username"
                  className="h-12 border-[#cdcdcd] focus:border-[#28a745] focus:ring-[#28a745]/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="[font-family:'Nunito',Helvetica] font-semibold text-[#333333]">Password</Label>
                <Input
                  id="password"
                  data-testid="input-password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Enter your password"
                  className="h-12 border-[#cdcdcd] focus:border-[#28a745] focus:ring-[#28a745]/20"
                />
              </div>
              <Button 
                data-testid="button-login"
                type="submit"
                className="w-full h-12 bg-[#28a745] hover:bg-[#218838] text-white [font-family:'Nunito',Helvetica] font-semibold text-base rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              >
                Access Admin Portal
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{backgroundColor: '#7CB342'}}>
      <div className="max-w-7xl mx-auto">
        {/* Header with medical theme */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e1e6eb] p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#28a745] to-[#007bff] flex items-center justify-center">
                <img src="/figmaAssets/logo.svg" alt="Oripio Medico" className="w-8 h-8" />
              </div>
              <div>
                <h1 className="[font-family:'Nunito',Helvetica] font-extrabold text-2xl sm:text-3xl text-[#333333]">Admin Dashboard</h1>
                <p className="[font-family:'Poppins',Helvetica] text-[#666666] text-sm">Oripio Medico Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="[font-family:'Nunito',Helvetica] font-semibold text-[#333333]" data-testid="text-welcome">Welcome back!</p>
                <p className="[font-family:'Poppins',Helvetica] text-sm text-[#666666]">{currentUser?.username}</p>
              </div>
              <Button 
                data-testid="button-logout"
                variant="outline" 
                onClick={() => {
                  setIsLoggedIn(false);
                  setCurrentUser(null);
                }}
                className="border-[#28a745] text-[#28a745] hover:bg-[#28a745] hover:text-white transition-all duration-200"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="content" value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-[#e1e6eb] p-4">
            <TabsList className="w-full overflow-x-auto inline-flex gap-2 bg-[#007bff08] rounded-lg p-2 sm:grid sm:grid-cols-3 lg:grid-cols-6 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] overscroll-x-contain touch-pan-x">
              <TabsTrigger 
                ref={(el) => (tabRefs.current['content'] = el)}
                data-testid="tab-content" 
                value="content"
                className="[font-family:'Nunito',Helvetica] font-semibold text-sm snap-start flex-shrink-0 min-w-[120px] h-10 px-3 py-2 whitespace-nowrap text-[#333333] data-[state=active]:bg-[#28a745] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 rounded-md transition-all duration-300 hover:bg-[#28a745]/10 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Site Content
              </TabsTrigger>
              <TabsTrigger 
                ref={(el) => (tabRefs.current['products'] = el)}
                data-testid="tab-products" 
                value="products"
                className="[font-family:'Nunito',Helvetica] font-semibold text-sm snap-start flex-shrink-0 min-w-[120px] h-10 px-3 py-2 whitespace-nowrap text-[#333333] data-[state=active]:bg-[#28a745] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 rounded-md transition-all duration-300 hover:bg-[#28a745]/10 flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Products
              </TabsTrigger>
              <TabsTrigger 
                ref={(el) => (tabRefs.current['categories'] = el)}
                data-testid="tab-categories" 
                value="categories"
                className="[font-family:'Nunito',Helvetica] font-semibold text-sm snap-start flex-shrink-0 min-w-[120px] h-10 px-3 py-2 whitespace-nowrap text-[#333333] data-[state=active]:bg-[#28a745] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 rounded-md transition-all duration-300 hover:bg-[#28a745]/10 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Categories
              </TabsTrigger>
              <TabsTrigger 
                ref={(el) => (tabRefs.current['contacts'] = el)}
                data-testid="tab-contacts" 
                value="contacts"
                className="[font-family:'Nunito',Helvetica] font-semibold text-sm snap-start flex-shrink-0 min-w-[120px] h-10 px-3 py-2 whitespace-nowrap text-[#333333] data-[state=active]:bg-[#28a745] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 rounded-md transition-all duration-300 hover:bg-[#28a745]/10 flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Contacts
              </TabsTrigger>
              <TabsTrigger 
                ref={(el) => (tabRefs.current['offers'] = el)}
                data-testid="tab-offers" 
                value="offers"
                className="[font-family:'Nunito',Helvetica] font-semibold text-sm snap-start flex-shrink-0 min-w-[120px] h-10 px-3 py-2 whitespace-nowrap text-[#333333] data-[state=active]:bg-[#28a745] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 rounded-md transition-all duration-300 hover:bg-[#28a745]/10 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Offers
              </TabsTrigger>
              <TabsTrigger 
                ref={(el) => (tabRefs.current['images'] = el)}
                data-testid="tab-images" 
                value="images"
                className="[font-family:'Nunito',Helvetica] font-semibold text-sm snap-start flex-shrink-0 min-w-[120px] h-10 px-3 py-2 whitespace-nowrap text-[#333333] data-[state=active]:bg-[#28a745] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 rounded-md transition-all duration-300 hover:bg-[#28a745]/10 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Images
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="content">
            <Card className="bg-white border-[#e1e6eb] shadow-sm rounded-xl">
              <CardHeader className="border-b border-[#e1e6eb] pb-4">
                <CardTitle className="[font-family:'Nunito',Helvetica] font-bold text-xl text-[#333333] flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#28a745]/10 flex items-center justify-center">
                    <span className="text-[#28a745] text-lg">📝</span>
                  </div>
                  Site Content Management
                </CardTitle>
                <CardDescription className="[font-family:'Poppins',Helvetica] text-[#666666]">Edit website text content, banners, and other elements</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ContentEditor 
                  siteContent={siteContent} 
                  onUpdate={updateContent}
                  onImageUpload={uploadImage}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="bg-white border-[#e1e6eb] shadow-sm rounded-xl">
              <CardHeader className="border-b border-[#e1e6eb] pb-4">
                <CardTitle className="[font-family:'Nunito',Helvetica] font-bold text-xl text-[#333333] flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#28a745]/10 flex items-center justify-center">
                    <span className="text-[#28a745] text-lg">💊</span>
                  </div>
                  Product Management
                </CardTitle>
                <CardDescription className="[font-family:'Poppins',Helvetica] text-[#666666]">Add, edit, and manage medical products and supplies</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ProductManager 
                  products={products} 
                  categories={categories}
                  onCreate={createProduct}
                  onDelete={deleteProduct}
                  onUpdate={loadAdminData}
                  onImageUpload={uploadImage}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card className="bg-white border-[#e1e6eb] shadow-sm rounded-xl">
              <CardHeader className="border-b border-[#e1e6eb] pb-4">
                <CardTitle className="[font-family:'Nunito',Helvetica] font-bold text-xl text-[#333333] flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#28a745]/10 flex items-center justify-center">
                    <span className="text-[#28a745] text-lg">🏷️</span>
                  </div>
                  Category Management
                </CardTitle>
                <CardDescription className="[font-family:'Poppins',Helvetica] text-[#666666]">Manage product categories and navigation structure</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <CategoryManager categories={categories} products={products} onUpdate={loadAdminData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card className="bg-white border-[#e1e6eb] shadow-sm rounded-xl">
              <CardHeader className="border-b border-[#e1e6eb] pb-4">
                <CardTitle className="[font-family:'Nunito',Helvetica] font-bold text-xl text-[#333333] flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#28a745]/10 flex items-center justify-center">
                    <span className="text-[#28a745] text-lg">📞</span>
                  </div>
                  Contact Management
                </CardTitle>
                <CardDescription className="[font-family:'Poppins',Helvetica] text-[#666666]">Manage company contact information and support details</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ContactManager contacts={contacts} onUpdate={loadAdminData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offers">
            <Card className="bg-white border-[#e1e6eb] shadow-sm rounded-xl">
              <CardHeader className="border-b border-[#e1e6eb] pb-4">
                <CardTitle className="[font-family:'Nunito',Helvetica] font-bold text-xl text-[#333333] flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#28a745]/10 flex items-center justify-center">
                    <span className="text-[#28a745] text-lg">🏷️</span>
                  </div>
                  Offers Management
                </CardTitle>
                <CardDescription className="[font-family:'Poppins',Helvetica] text-[#666666]">Manage promotional offers and special medical product deals</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <OfferManager offers={offers} onUpdate={loadAdminData} onImageUpload={uploadImage} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <Card className="bg-white border-[#e1e6eb] shadow-sm rounded-xl">
              <CardHeader className="border-b border-[#e1e6eb] pb-4">
                <CardTitle className="[font-family:'Nunito',Helvetica] font-bold text-xl text-[#333333] flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#28a745]/10 flex items-center justify-center">
                    <span className="text-[#28a745] text-lg">🖼️</span>
                  </div>
                  Image Management
                </CardTitle>
                <CardDescription className="[font-family:'Poppins',Helvetica] text-[#666666]">Upload and manage website images and media assets</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ImageManager onUpload={uploadImage} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 shadow-2xl flex items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#28a745]" />
              <div>
                <h3 className="font-semibold text-gray-900">Loading...</h3>
                <p className="text-sm text-gray-600">Updating your data</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Popup */}
        <SuccessPopup
          isOpen={popupState.isOpen}
          onClose={closePopup}
          title={popupState.title}
          message={popupState.message}
          action={popupState.action}
        />

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={dialogState.isOpen}
          onClose={closeDialog}
          onConfirm={dialogState.onConfirm || (() => {})}
          title={dialogState.title}
          message={dialogState.message}
          type={dialogState.type}
          confirmText={dialogState.confirmText}
          cancelText={dialogState.cancelText}
          isLoading={dialogState.isLoading}
        />
      </div>
    </div>
  );
};

// Content Editor Component - User-Friendly Interface
const ContentEditor: React.FC<{
  siteContent: SiteContent[];
  onUpdate: (section: string, key: string, value: string, type?: string) => void;
  onImageUpload: (file: File) => Promise<string | null>;
}> = ({ siteContent, onUpdate, onImageUpload }) => {
  const { toast } = useToast();
  const [isUploadingBannerImage, setIsUploadingBannerImage] = useState(false);

  // Helper function to get content value by section and key
  const getContent = (section: string, key: string) => {
    const content = siteContent.find(c => c.section === section && c.key === key);
    return content?.value || '';
  };

  // Helper function to update content with toast feedback
  const updateWithFeedback = (section: string, key: string, value: string, type: string = 'text') => {
    onUpdate(section, key, value, type);
    toast({ title: 'Updated!', description: 'Content updated successfully' });
  };

  return (
    <div className="space-y-8">
      {/* Website Header Section */}
      <Card className="border-[#e1e6eb] shadow-sm">
        <CardHeader className="bg-gradient-to-r from-[#28a745]/5 to-[#007bff]/5 border-b border-[#e1e6eb]">
          <CardTitle className="[font-family:'Nunito',Helvetica] font-bold text-lg text-[#333333] flex items-center gap-2">
            <span className="text-2xl">🏠</span> Website Header & Hero Section
          </CardTitle>
          <CardDescription className="[font-family:'Poppins',Helvetica] text-[#666666]">
            Main heading and tagline that visitors see first
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#333333] text-base">Main Headline</Label>
            <Input
              value={getContent('hero', 'title')}
              onChange={(e) => updateWithFeedback('hero', 'title', e.target.value)}
              placeholder="Your Health, Our Priority"
              className="mt-2 h-12 text-lg border-[#cdcdcd] focus:border-[#28a745] focus:ring-[#28a745]/20"
              data-testid="input-hero-title"
            />
            <p className="text-sm text-gray-500 mt-1">This appears as the main heading on your homepage</p>
          </div>
          <div>
            <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#333333] text-base">Subtitle/Description</Label>
            <Input
              value={getContent('hero', 'subtitle')}
              onChange={(e) => updateWithFeedback('hero', 'subtitle', e.target.value)}
              placeholder="Premium medical supplies and healthcare products"
              className="mt-2 h-12 border-[#cdcdcd] focus:border-[#28a745] focus:ring-[#28a745]/20"
              data-testid="input-hero-subtitle"
            />
            <p className="text-sm text-gray-500 mt-1">Supporting text that explains what your business offers</p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Section */}
      <Card className="border-[#e1e6eb] shadow-sm">
        <CardHeader className="bg-gradient-to-r from-[#007bff]/5 to-[#28a745]/5 border-b border-[#e1e6eb]">
          <CardTitle className="[font-family:'Nunito',Helvetica] font-bold text-lg text-[#333333] flex items-center gap-2">
            <span className="text-2xl">🧭</span> Navigation Bar
          </CardTitle>
          <CardDescription className="[font-family:'Poppins',Helvetica] text-[#666666]">
            Brand name and navigation elements
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#333333] text-base">Brand/Company Name</Label>
            <Input
              value={getContent('navbar', 'logo_text')}
              onChange={(e) => updateWithFeedback('navbar', 'logo_text', e.target.value)}
              placeholder="Oripio Medico"
              className="mt-2 h-12 text-lg font-semibold border-[#cdcdcd] focus:border-[#28a745] focus:ring-[#28a745]/20"
              data-testid="input-navbar-logo"
            />
            <p className="text-sm text-gray-500 mt-1">This appears in the top navigation bar next to your logo</p>
          </div>
        </CardContent>
      </Card>

      {/* Promotional Banner Section */}
      <Card className="border-[#e1e6eb] shadow-sm">
        <CardHeader className="bg-gradient-to-r from-[#28a745]/5 to-[#ffc107]/5 border-b border-[#e1e6eb]">
          <CardTitle className="[font-family:'Nunito',Helvetica] font-bold text-lg text-[#333333] flex items-center gap-2">
            <span className="text-2xl">🎯</span> Promotional Banner
          </CardTitle>
          <CardDescription className="[font-family:'Poppins',Helvetica] text-[#666666]">
            Special offers and promotional content
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#333333] text-base">Banner Title</Label>
              <Input
                value={getContent('promotional_banner', 'title')}
                onChange={(e) => updateWithFeedback('promotional_banner', 'title', e.target.value)}
                placeholder="Save Big Today!"
                className="mt-2 h-12 text-lg font-bold border-[#cdcdcd] focus:border-[#28a745] focus:ring-[#28a745]/20"
                data-testid="input-banner-title"
              />
            </div>
            <div>
              <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#333333] text-base">Banner Subtitle</Label>
              <Input
                value={getContent('promotional_banner', 'subtitle')}
                onChange={(e) => updateWithFeedback('promotional_banner', 'subtitle', e.target.value)}
                placeholder="on Essential Medicines"
                className="mt-2 h-12 border-[#cdcdcd] focus:border-[#28a745] focus:ring-[#28a745]/20"
                data-testid="input-banner-subtitle"
              />
            </div>
            <div>
              <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#333333] text-base">Discount Text</Label>
              <Input
                value={getContent('promotional_banner', 'discount_text')}
                onChange={(e) => updateWithFeedback('promotional_banner', 'discount_text', e.target.value)}
                placeholder="60% OFF"
                className="mt-2 h-12 text-xl font-bold text-center border-[#cdcdcd] focus:border-[#28a745] focus:ring-[#28a745]/20"
                data-testid="input-banner-discount"
              />
            </div>
            <div>
              <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#333333] text-base">Button Text</Label>
              <Input
                value={getContent('promotional_banner', 'cta_button')}
                onChange={(e) => updateWithFeedback('promotional_banner', 'cta_button', e.target.value)}
                placeholder="Shop Now"
                className="mt-2 h-12 font-semibold border-[#cdcdcd] focus:border-[#28a745] focus:ring-[#28a745]/20"
                data-testid="input-banner-button"
              />
            </div>
          </div>
          <div>
            <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#333333] text-base">Banner Description</Label>
            <Textarea
              value={getContent('promotional_banner', 'description')}
              onChange={(e) => updateWithFeedback('promotional_banner', 'description', e.target.value)}
              placeholder="Get premium medical supplies at unbeatable prices"
              rows={3}
              className="mt-2 border-[#cdcdcd] focus:border-[#28a745] focus:ring-[#28a745]/20"
              data-testid="textarea-banner-description"
            />
            <p className="text-sm text-gray-500 mt-1">Supporting text for your promotional offer</p>
          </div>
          
          <div>
            <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#333333] text-base">Banner Image</Label>
            <Input
              data-testid="input-banner-image"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setIsUploadingBannerImage(true);
                  try {
                    const imageUrl = await onImageUpload(file);
                    if (imageUrl) {
                      onUpdate('promotional_banner', 'icon', imageUrl, 'image');
                      toast({ title: 'Success', description: 'Banner image uploaded successfully!' });
                    }
                  } catch (error) {
                    toast({ title: 'Error', description: 'Failed to upload banner image', variant: 'destructive' });
                  } finally {
                    setIsUploadingBannerImage(false);
                  }
                }
              }}
              disabled={isUploadingBannerImage}
              className="mt-2 border-[#cdcdcd] focus:border-[#28a745] focus:ring-[#28a745]/20"
            />
            <p className="text-xs text-gray-500 mt-1">Upload a new banner image (Max: 10MB. Supported: JPG, PNG, WEBP, AVIF)</p>
            
            {isUploadingBannerImage && (
              <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                ⏳ Uploading banner image...
              </p>
            )}
            
            {getContent('promotional_banner', 'icon') && !isUploadingBannerImage && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium mb-2">Current Banner Image:</p>
                <img 
                  src={getContent('promotional_banner', 'icon')} 
                  alt="Current banner" 
                  className="w-32 h-20 object-cover rounded border-2 border-green-300 shadow-sm" 
                />
                <p className="text-xs text-green-600 mt-1">✓ Banner image is set and will appear on your website</p>
              </div>
            )}
            
            {!getContent('promotional_banner', 'icon') && !isUploadingBannerImage && (
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">📷 No banner image uploaded yet. Choose a file above to add one.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer Section */}
      <Card className="border-[#e1e6eb] shadow-sm">
        <CardHeader className="bg-gradient-to-r from-[#6c757d]/5 to-[#28a745]/5 border-b border-[#e1e6eb]">
          <CardTitle className="[font-family:'Nunito',Helvetica] font-bold text-lg text-[#333333] flex items-center gap-2">
            <span className="text-2xl">🏢</span> Footer Information
          </CardTitle>
          <CardDescription className="[font-family:'Poppins',Helvetica] text-[#666666]">
            Company information that appears at the bottom of your website
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#333333] text-base">Company Name</Label>
            <Input
              value={getContent('footer', 'company_name')}
              onChange={(e) => updateWithFeedback('footer', 'company_name', e.target.value)}
              placeholder="Oripio Medico"
              className="mt-2 h-12 text-lg font-semibold border-[#cdcdcd] focus:border-[#28a745] focus:ring-[#28a745]/20"
              data-testid="input-footer-company"
            />
          </div>
          <div>
            <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#333333] text-base">Company Tagline</Label>
            <Input
              value={getContent('footer', 'tagline')}
              onChange={(e) => updateWithFeedback('footer', 'tagline', e.target.value)}
              placeholder="Quality Healthcare Solutions"
              className="mt-2 h-12 border-[#cdcdcd] focus:border-[#28a745] focus:ring-[#28a745]/20"
              data-testid="input-footer-tagline"
            />
            <p className="text-sm text-gray-500 mt-1">Brief description of your business mission</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-[#28a745] bg-gradient-to-r from-[#28a745]/5 to-[#007bff]/5">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="[font-family:'Nunito',Helvetica] font-bold text-lg text-[#333333] mb-2">✨ All Changes Saved Automatically</h3>
            <p className="[font-family:'Poppins',Helvetica] text-[#666666]">
              Your website content updates instantly as you type. No need to click save buttons!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Product Manager Component
const ProductManager: React.FC<{
  products: Product[];
  categories: Category[];
  onCreate: (product: any) => void;
  onDelete: (id: number) => void;
  onUpdate: () => void;
  onImageUpload: (file: File) => Promise<string | null>;
}> = ({ products, categories, onCreate, onDelete, onUpdate, onImageUpload }) => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    features: '',
    isActive: true
  });

  const [isUploading, setIsUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditUploading, setIsEditUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Immediate feedback
      setIsUploading(true);
      
      try {
        const imageUrl = await onImageUpload(file);
        if (imageUrl) {
          setNewProduct(prev => {
            return { ...prev, image: imageUrl };
          });
          toast({ title: 'Success', description: 'Image uploaded successfully!' });
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProduct) {
      setIsEditUploading(true);
      
      try {
        const imageUrl = await onImageUpload(file);
        if (imageUrl) {
          setEditingProduct(prev => prev ? { ...prev, image: imageUrl } : null);
          toast({ title: 'Success', description: 'Image uploaded successfully!' });
        }
      } finally {
        setIsEditUploading(false);
      }
    }
  };

  const updateProduct = async (id: number, productData: Partial<Product>) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      toast({ title: 'Success', description: 'Product updated successfully' });
      setEditingProduct(null);
      onUpdate();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update product', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="[font-family:'Nunito',Helvetica] font-bold text-lg text-[#333333] mb-4 flex items-center gap-2">
          <span className="text-[#28a745]">+</span> Add New Product
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Product Name</Label>
            <Input
              data-testid="input-product-name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              placeholder="Enter product name"
            />
          </div>
          <div>
            <Label>Price</Label>
            <Input
              data-testid="input-product-price"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              placeholder="₹0.00"
            />
          </div>
          <div className="col-span-2">
            <Label>Description</Label>
            <Textarea
              data-testid="textarea-product-description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              placeholder="Product description..."
              rows={3}
            />
          </div>
          <div className="col-span-2">
            <Label>Product Features</Label>
            <Textarea
              data-testid="textarea-product-features"
              value={newProduct.features}
              onChange={(e) => setNewProduct({ ...newProduct, features: e.target.value })}
              placeholder="Enter product features, one per line..."
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">Enter each feature on a new line</p>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
              <SelectTrigger data-testid="select-product-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#333333] flex items-center gap-1">
              Product Image 
              <span className="text-red-500 font-bold">*</span>
            </Label>
            <Input
              data-testid="input-product-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="mt-1 border-[#cdcdcd] focus:border-[#28a745] focus:ring-[#28a745]/20"
            />
            <p className="text-xs text-gray-500 mt-1">Max file size: 10MB. Supported: JPG, PNG, WEBP, AVIF</p>
            {isUploading && (
              <p className="text-sm text-blue-600 mt-2">⏳ Uploading image...</p>
            )}
            {!newProduct.image && !isUploading && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                ⚠️ Product image is required before creating the product
              </p>
            )}
            {newProduct.image && (
              <div className="mt-2">
                <img src={newProduct.image} alt="Preview" className="w-20 h-20 object-cover rounded border-2 border-green-200" />
                <p className="text-sm text-green-600 mt-1">✓ Image uploaded successfully</p>
              </div>
            )}
          </div>
          <div className="col-span-2">
            <Button
              data-testid="button-create-product"
              onClick={() => {
                if (!newProduct.image) {
                  toast({ 
                    title: 'Image Required', 
                    description: 'Please upload a product image before creating the product', 
                    variant: 'destructive' 
                  });
                  return;
                }
                onCreate(newProduct);
                setNewProduct({ name: '', description: '', price: '', category: '', image: '', features: '', isActive: true });
              }}
              disabled={!newProduct.name || !newProduct.image || !newProduct.description || !newProduct.price || !newProduct.category || isUploading}
              className="bg-[#28a745] hover:bg-[#218838] text-white [font-family:'Nunito',Helvetica] font-semibold rounded-lg shadow-md transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading Image...' : 'Create Product'}
            </Button>
            {(!newProduct.name || !newProduct.image || !newProduct.description || !newProduct.price || !newProduct.category) && !isUploading && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium mb-1">Please complete all required fields:</p>
                <ul className="text-xs text-red-600 space-y-1">
                  {!newProduct.name && <li>• Product name is required</li>}
                  {!newProduct.description && <li>• Product description is required</li>}
                  {!newProduct.price && <li>• Product price is required</li>}
                  {!newProduct.category && <li>• Product category is required</li>}
                  {!newProduct.image && <li>• Product image is required</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Existing Products</h3>
        <div className="grid gap-4">
          {products.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                {editingProduct?.id === product.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Product Name</Label>
                        <Input
                          data-testid={`input-edit-product-name-${product.id}`}
                          value={editingProduct.name || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Price</Label>
                        <Input
                          data-testid={`input-edit-product-price-${product.id}`}
                          value={editingProduct.price || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Description</Label>
                        <Textarea
                          data-testid={`textarea-edit-product-description-${product.id}`}
                          value={editingProduct.description || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Product Features</Label>
                        <Textarea
                          data-testid={`textarea-edit-product-features-${product.id}`}
                          value={editingProduct.features || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, features: e.target.value })}
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select value={editingProduct.category || ''} onValueChange={(value) => setEditingProduct({ ...editingProduct, category: value })}>
                          <SelectTrigger data-testid={`select-edit-product-category-${product.id}`}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Product Image</Label>
                        <Input
                          data-testid={`input-edit-product-image-${product.id}`}
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageUpload}
                          disabled={isEditUploading}
                        />
                        {isEditUploading && (
                          <p className="text-sm text-blue-600 mt-2">⏳ Uploading image...</p>
                        )}
                        {editingProduct.image && (
                          <div className="mt-2">
                            <img src={editingProduct.image} alt="Preview" className="w-20 h-20 object-cover rounded border-2 border-green-200" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-testid={`button-save-product-${product.id}`}
                        size="sm"
                        disabled={!editingProduct.name?.trim() || !editingProduct.description?.trim() || !editingProduct.price?.trim() || !editingProduct.category?.trim()}
                        onClick={() => updateProduct(product.id, {
                          name: editingProduct.name?.trim() || '',
                          description: editingProduct.description?.trim() || '',
                          price: editingProduct.price?.trim() || '',
                          category: editingProduct.category?.trim() || '',
                          features: editingProduct.features?.trim() || '',
                          image: editingProduct.image || '',
                          isActive: editingProduct.isActive ?? true
                        })}
                        className="bg-[#28a745] hover:bg-[#218838] text-white"
                      >
                        Save
                      </Button>
                      <Button
                        data-testid={`button-cancel-edit-product-${product.id}`}
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingProduct(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      {product.image && (
                        <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                      )}
                      <div>
                        <h4 className="font-medium" data-testid={`text-product-name-${product.id}`}>{product.name}</h4>
                        <p className="text-sm text-gray-600">{product.description}</p>
                        <p className="text-sm font-medium">{product.price}</p>
                        <span className="text-xs bg-blue-100 px-2 py-1 rounded">{product.category}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-testid={`button-edit-product-${product.id}`}
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingProduct(product)}
                        className="[font-family:'Nunito',Helvetica] font-semibold"
                      >
                        Edit
                      </Button>
                      <Button
                        data-testid={`button-delete-product-${product.id}`}
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(product.id)}
                        className="bg-red-500 hover:bg-red-600 text-white [font-family:'Nunito',Helvetica] font-semibold transition-all duration-200"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// Category Manager Component
const CategoryManager: React.FC<{
  categories: Category[];
  products: Product[];
  onUpdate: () => void;
}> = ({ categories, products, onUpdate }) => {
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  const createCategory = async () => {
    try {
      await fetch('/api/categories', {
        method: 'POST',
        body: JSON.stringify(newCategory),
        headers: { 'Content-Type': 'application/json' }
      });
      
      toast({ title: 'Success', description: 'Category created successfully' });
      setNewCategory({ name: '' });
      onUpdate();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create category', variant: 'destructive' });
    }
  };

  const updateCategory = async (id: number, categoryData: any) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        toast({ title: 'Error', description: errorData?.error || 'Failed to update category', variant: 'destructive' });
        return;
      }
      
      toast({ title: 'Success', description: 'Category updated successfully' });
      setEditingCategory(null);
      onUpdate();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update category', variant: 'destructive' });
    }
  };

  const deleteCategory = async (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          toast({ title: 'Error', description: errorData?.error || 'Failed to delete category', variant: 'destructive' });
          return;
        }
        
        toast({ title: 'Success', description: 'Category deleted successfully' });
        onUpdate();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="[font-family:'Nunito',Helvetica] font-bold text-lg text-[#333333] mb-4 flex items-center gap-2">
          <span className="text-[#28a745]">+</span> Add New Category
        </h3>
        <div className="grid gap-4">
          <div>
            <Label>Category Name</Label>
            <Input
              data-testid="input-category-name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              placeholder="Enter category name"
            />
          </div>
          <div>
            <Button
              data-testid="button-create-category"
              onClick={createCategory}
              disabled={!newCategory.name}
              className="bg-[#28a745] hover:bg-[#218838] text-white [font-family:'Nunito',Helvetica] font-semibold rounded-lg shadow-md transition-all duration-200"
            >
              Create Category
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Existing Categories</h3>
        <div className="grid gap-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-4">
                {editingCategory?.id === category.id ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Category Name</Label>
                      <Input
                        data-testid={`input-edit-category-name-${category.id}`}
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-testid={`button-save-category-${category.id}`}
                        size="sm"
                        disabled={!editingCategory.name.trim()}
                        onClick={() => updateCategory(category.id, { 
                          name: editingCategory.name.trim()
                        })}
                      >
                        Save
                      </Button>
                      <Button
                        data-testid={`button-cancel-edit-category-${category.id}`}
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingCategory(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium" data-testid={`text-category-name-${category.id}`}>{category.name}</span>
                      <span className="text-sm text-gray-500 ml-2">Products: {products.filter(product => product.category === category.name).length}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-testid={`button-edit-category-${category.id}`}
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingCategory(category)}
                      >
                        Edit
                      </Button>
                      <Button
                        data-testid={`button-delete-category-${category.id}`}
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteCategory(category.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// Contact Manager Component
const ContactManager: React.FC<{
  contacts: Contact[];
  onUpdate: () => void;
}> = ({ contacts, onUpdate }) => {
  const [newContact, setNewContact] = useState({ name: '', email: '', contactNumber: '', address: '' });
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const { toast } = useToast();

  const createContact = async () => {
    try {
      await fetch('/api/contacts', {
        method: 'POST',
        body: JSON.stringify(newContact),
        headers: { 'Content-Type': 'application/json' }
      });
      
      toast({ title: 'Success', description: 'Contact created successfully' });
      setNewContact({ name: '', email: '', contactNumber: '', address: '' });
      onUpdate();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create contact', variant: 'destructive' });
    }
  };

  const updateContact = async (id: number, contactData: any) => {
    try {
      await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(contactData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      toast({ title: 'Success', description: 'Contact updated successfully' });
      setEditingContact(null);
      onUpdate();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update contact', variant: 'destructive' });
    }
  };

  const deleteContact = async (id: number) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
        toast({ title: 'Success', description: 'Contact deleted successfully' });
        onUpdate();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete contact', variant: 'destructive' });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Add New Contact</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label>Name</Label>
            <Input
              data-testid="input-contact-name"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              placeholder="Enter contact name"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              data-testid="input-contact-email"
              type="email"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>
          <div>
            <Label>Contact Number</Label>
            <Input
              data-testid="input-contact-number"
              value={newContact.contactNumber}
              onChange={(e) => setNewContact({ ...newContact, contactNumber: e.target.value })}
              placeholder="Enter contact number"
            />
          </div>
          <div>
            <Label>Address</Label>
            <Input
              data-testid="input-contact-address"
              value={newContact.address}
              onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
              placeholder="Enter address (optional)"
            />
          </div>
          <div>
            <Button
              data-testid="button-create-contact"
              onClick={createContact}
              disabled={!newContact.name || !newContact.email || !newContact.contactNumber}
            >
              Create Contact
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Existing Contacts</h3>
        <div className="grid gap-4">
          {contacts.map((contact) => (
            <Card key={contact.id}>
              <CardContent className="p-4">
                {editingContact?.id === contact.id ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        data-testid={`input-edit-contact-name-${contact.id}`}
                        value={editingContact.name}
                        onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        data-testid={`input-edit-contact-email-${contact.id}`}
                        type="email"
                        value={editingContact.email}
                        onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Contact Number</Label>
                      <Input
                        data-testid={`input-edit-contact-number-${contact.id}`}
                        value={editingContact.contactNumber}
                        onChange={(e) => setEditingContact({ ...editingContact, contactNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input
                        data-testid={`input-edit-contact-address-${contact.id}`}
                        value={editingContact.address || ''}
                        onChange={(e) => setEditingContact({ ...editingContact, address: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-testid={`button-save-contact-${contact.id}`}
                        size="sm"
                        onClick={() => updateContact(contact.id, { 
                          name: editingContact.name, 
                          email: editingContact.email, 
                          contactNumber: editingContact.contactNumber,
                          address: editingContact.address 
                        })}
                      >
                        Save
                      </Button>
                      <Button
                        data-testid={`button-cancel-edit-contact-${contact.id}`}
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingContact(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium" data-testid={`text-contact-name-${contact.id}`}>{contact.name}</h4>
                      <p className="text-sm text-gray-600" data-testid={`text-contact-email-${contact.id}`}>{contact.email}</p>
                      <p className="text-sm text-gray-600" data-testid={`text-contact-number-${contact.id}`}>{contact.contactNumber}</p>
                      {contact.address && <p className="text-sm text-gray-600" data-testid={`text-contact-address-${contact.id}`}>{contact.address}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-testid={`button-edit-contact-${contact.id}`}
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingContact(contact)}
                      >
                        Edit
                      </Button>
                      <Button
                        data-testid={`button-delete-contact-${contact.id}`}
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteContact(contact.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// Offer Manager Component
const OfferManager: React.FC<{
  offers: Offer[];
  onUpdate: () => void;
  onImageUpload: (file: File) => Promise<string | null>;
}> = ({ offers, onUpdate, onImageUpload }) => {
  const [newOffer, setNewOffer] = useState({
    title: '',
    subtitle: '',
    discount: '',
    originalPrice: '',
    currentPrice: '',
    image: '',
    imageAlt: '',
    isLarge: false,
    displayOrder: 0,
    isActive: true
  });

  const [isUploading, setIsUploading] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const imageUrl = await onImageUpload(file);
        if (imageUrl) {
          setNewOffer(prev => ({ ...prev, image: imageUrl }));
          toast({ title: 'Success', description: 'Image uploaded successfully!' });
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  const createOffer = async () => {
    try {
      await fetch('/api/offers', {
        method: 'POST',
        body: JSON.stringify(newOffer),
        headers: { 'Content-Type': 'application/json' }
      });

      toast({ title: 'Success', description: 'Offer created successfully' });
      setNewOffer({
        title: '',
        subtitle: '',
        discount: '',
        originalPrice: '',
        currentPrice: '',
        image: '',
        imageAlt: '',
        isLarge: false,
        displayOrder: 0,
        isActive: true
      });
      onUpdate();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create offer', variant: 'destructive' });
    }
  };

  const deleteOffer = async (id: number) => {
    try {
      await fetch(`/api/offers/${id}`, { method: 'DELETE' });
      toast({ title: 'Success', description: 'Offer deleted successfully' });
      onUpdate();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete offer', variant: 'destructive' });
    }
  };

  const updateOffer = async (id: number, offerData: Partial<Offer>) => {
    try {
      await fetch(`/api/offers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(offerData),
        headers: { 'Content-Type': 'application/json' }
      });

      toast({ title: 'Success', description: 'Offer updated successfully' });
      setEditingOffer(null);
      onUpdate();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update offer', variant: 'destructive' });
    }
  };

  const updateOfferImage = async (id: number, imageUrl: string) => {
    try {
      const response = await fetch(`/api/offers/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ image: imageUrl }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update offer image: ${response.status} ${response.statusText}`);
      }
      
      // Don't close the modal or call onUpdate - just update the image
    } catch (error) {
      console.error('Failed to update offer image:', error);
      throw error;
    }
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingOffer) {
      toast({ title: 'Error', description: 'No offer selected for editing', variant: 'destructive' });
      return;
    }
    
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const imageUrl = await onImageUpload(file);
        if (imageUrl) {
          // Update local state with new image URL
          const updatedOffer = { ...editingOffer, image: imageUrl };
          setEditingOffer(updatedOffer);
          
          // Automatically save just the image without closing the modal
          await updateOfferImage(updatedOffer.id, imageUrl);
          toast({ title: 'Success', description: 'Image uploaded and saved! Don\'t forget to save any other changes.' });
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to save uploaded image', variant: 'destructive' });
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Add New Offer</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Title</Label>
            <Input
              data-testid="input-offer-title"
              value={newOffer.title}
              onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
              placeholder="Offer title"
            />
          </div>
          <div>
            <Label>Discount</Label>
            <Input
              data-testid="input-offer-discount"
              value={newOffer.discount}
              onChange={(e) => setNewOffer({ ...newOffer, discount: e.target.value })}
              placeholder="e.g., 25% OFF"
            />
          </div>
          <div className="col-span-2">
            <Label>Subtitle (Optional)</Label>
            <Textarea
              data-testid="textarea-offer-subtitle"
              value={newOffer.subtitle}
              onChange={(e) => setNewOffer({ ...newOffer, subtitle: e.target.value })}
              placeholder="Offer description..."
              rows={2}
            />
          </div>
          <div>
            <Label>Original Price</Label>
            <Input
              data-testid="input-offer-original-price"
              value={newOffer.originalPrice}
              onChange={(e) => setNewOffer({ ...newOffer, originalPrice: e.target.value })}
              placeholder="₹0.00"
            />
          </div>
          <div>
            <Label>Current Price</Label>
            <Input
              data-testid="input-offer-current-price"
              value={newOffer.currentPrice}
              onChange={(e) => setNewOffer({ ...newOffer, currentPrice: e.target.value })}
              placeholder="₹0.00"
            />
          </div>
          <div>
            <Label>Image Alt Text</Label>
            <Input
              data-testid="input-offer-image-alt"
              value={newOffer.imageAlt}
              onChange={(e) => setNewOffer({ ...newOffer, imageAlt: e.target.value })}
              placeholder="Image description"
            />
          </div>
          <div>
            <Label>Display Order</Label>
            <Input
              data-testid="input-offer-display-order"
              type="number"
              value={newOffer.displayOrder}
              onChange={(e) => setNewOffer({ ...newOffer, displayOrder: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
          <div className="col-span-2">
            <Label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newOffer.isLarge}
                onChange={(e) => setNewOffer({ ...newOffer, isLarge: e.target.checked })}
                data-testid="checkbox-offer-is-large"
              />
              <span>Featured Offer (Large Display)</span>
            </Label>
          </div>
          <div>
            <Label>Offer Image</Label>
            <Input
              data-testid="input-offer-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
            {isUploading && (
              <p className="text-sm text-blue-600 mt-2">⏳ Uploading image...</p>
            )}
            {newOffer.image && (
              <img src={newOffer.image} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded" />
            )}
          </div>
          <div className="flex items-end">
            <Button
              data-testid="button-create-offer"
              onClick={createOffer}
              disabled={!newOffer.title || !newOffer.discount || isUploading}
            >
              {isUploading ? 'Uploading Image...' : 'Create Offer'}
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Existing Offers</h3>
        <div className="grid gap-4">
          {offers.map((offer) => (
            <Card key={offer.id}>
              <CardContent className="p-4">
                {editingOffer && editingOffer.id === offer.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          data-testid={`input-edit-offer-title-${offer.id}`}
                          value={editingOffer.title}
                          onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                          placeholder="Offer title"
                        />
                      </div>
                      <div>
                        <Label>Discount</Label>
                        <Input
                          data-testid={`input-edit-offer-discount-${offer.id}`}
                          value={editingOffer.discount}
                          onChange={(e) => setEditingOffer({ ...editingOffer, discount: e.target.value })}
                          placeholder="e.g., 25% OFF"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Subtitle</Label>
                        <Textarea
                          data-testid={`textarea-edit-offer-subtitle-${offer.id}`}
                          value={editingOffer.subtitle || ''}
                          onChange={(e) => setEditingOffer({ ...editingOffer, subtitle: e.target.value })}
                          placeholder="Offer description..."
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Original Price</Label>
                        <Input
                          data-testid={`input-edit-offer-original-price-${offer.id}`}
                          value={editingOffer.originalPrice}
                          onChange={(e) => setEditingOffer({ ...editingOffer, originalPrice: e.target.value })}
                          placeholder="₹0.00"
                        />
                      </div>
                      <div>
                        <Label>Current Price</Label>
                        <Input
                          data-testid={`input-edit-offer-current-price-${offer.id}`}
                          value={editingOffer.currentPrice}
                          onChange={(e) => setEditingOffer({ ...editingOffer, currentPrice: e.target.value })}
                          placeholder="₹0.00"
                        />
                      </div>
                      <div>
                        <Label>Image Alt Text</Label>
                        <Input
                          data-testid={`input-edit-offer-image-alt-${offer.id}`}
                          value={editingOffer.imageAlt || ''}
                          onChange={(e) => setEditingOffer({ ...editingOffer, imageAlt: e.target.value })}
                          placeholder="Image description"
                        />
                      </div>
                      <div>
                        <Label>Display Order</Label>
                        <Input
                          data-testid={`input-edit-offer-display-order-${offer.id}`}
                          type="number"
                          value={editingOffer.displayOrder || 0}
                          onChange={(e) => setEditingOffer({ ...editingOffer, displayOrder: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={editingOffer.isLarge || false}
                            onChange={(e) => setEditingOffer({ ...editingOffer, isLarge: e.target.checked })}
                            data-testid={`checkbox-edit-offer-is-large-${offer.id}`}
                          />
                          <span>Featured Offer (Large Display)</span>
                        </Label>
                      </div>
                      <div>
                        <Label>Update Image</Label>
                        <Input
                          data-testid={`input-edit-offer-image-${offer.id}`}
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageUpload}
                          disabled={isUploading}
                        />
                        {isUploading && (
                          <p className="text-sm text-blue-600 mt-2">⏳ Uploading image...</p>
                        )}
                        {editingOffer.image && (
                          <img src={editingOffer.image} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded" />
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-testid={`button-save-offer-${offer.id}`}
                        size="sm"
                        onClick={() => updateOffer(offer.id, {
                          title: editingOffer.title,
                          subtitle: editingOffer.subtitle,
                          discount: editingOffer.discount,
                          originalPrice: editingOffer.originalPrice,
                          currentPrice: editingOffer.currentPrice,
                          image: editingOffer.image,
                          imageAlt: editingOffer.imageAlt,
                          isLarge: editingOffer.isLarge,
                          displayOrder: editingOffer.displayOrder
                        })}
                        disabled={isUploading}
                      >
                        {isUploading ? 'Uploading...' : 'Save'}
                      </Button>
                      <Button
                        data-testid={`button-cancel-edit-offer-${offer.id}`}
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingOffer(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      {offer.image && (
                        <img src={offer.image} alt={offer.imageAlt || offer.title} className="w-16 h-16 object-cover rounded" />
                      )}
                      <div>
                        <h4 className="font-medium" data-testid={`text-offer-title-${offer.id}`}>
                          {offer.title} {offer.isLarge && <span className="text-xs bg-blue-100 px-2 py-1 rounded ml-2">Featured</span>}
                        </h4>
                        <p className="text-sm text-gray-600">{offer.subtitle}</p>
                        <div className="text-sm">
                          <span className="font-medium text-green-600">{offer.discount}</span>
                          <span className="ml-2 line-through text-gray-500">{offer.originalPrice}</span>
                          <span className="ml-2 font-bold">{offer.currentPrice}</span>
                        </div>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">Order: {offer.displayOrder}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-testid={`button-edit-offer-${offer.id}`}
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingOffer(offer)}
                      >
                        Edit
                      </Button>
                      <Button
                        data-testid={`button-delete-offer-${offer.id}`}
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteOffer(offer.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// Image Manager Component
const ImageManager: React.FC<{
  onUpload: (file: File) => Promise<string | null>;
}> = ({ onUpload }) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = await onUpload(file);
      if (imageUrl) {
        setUploadedImages([...uploadedImages, imageUrl]);
        toast({ title: 'Success', description: 'Image uploaded successfully' });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Upload New Image</Label>
        <Input
          data-testid="input-image-upload"
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="mt-2"
        />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Recent Uploads</h3>
        <div className="grid grid-cols-4 gap-4">
          {uploadedImages.map((imageUrl, index) => (
            <div key={index} className="border rounded p-2">
              <img src={imageUrl} alt={`Upload ${index}`} className="w-full h-32 object-cover rounded" />
              <p className="text-xs mt-2 break-all">{imageUrl}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};