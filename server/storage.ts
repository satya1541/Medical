import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq, sql, asc } from "drizzle-orm";
import { 
  users, 
  siteContent, 
  products, 
  categories,
  contacts,
  newsArticles,
  offers,
  emailSubscriptions,
  type User, 
  type InsertUser,
  type SiteContent,
  type InsertSiteContent,
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type Contact,
  type InsertContact,
  type NewsArticle,
  type InsertNewsArticle,
  type Offer,
  type InsertOffer,
  type EmailSubscription,
  type InsertEmailSubscription
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Site content methods
  getSiteContent(section: string, key: string): Promise<SiteContent | undefined>;
  getAllSiteContent(): Promise<SiteContent[]>;
  updateSiteContent(content: InsertSiteContent): Promise<SiteContent>;
  
  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  
  // Contact methods
  getAllContacts(): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact>;
  deleteContact(id: number): Promise<void>;
  
  // News article methods
  getAllNewsArticles(): Promise<NewsArticle[]>;
  getLatestNewsArticles(limit?: number): Promise<NewsArticle[]>;
  getNewsArticle(id: number): Promise<NewsArticle | undefined>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  clearOldNews(keepCount: number): Promise<void>;
  
  // Offer methods
  getAllOffers(): Promise<Offer[]>;
  getOffer(id: number): Promise<Offer | undefined>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  updateOffer(id: number, offer: Partial<InsertOffer>): Promise<Offer>;
  deleteOffer(id: number): Promise<void>;
  
  // Email subscription methods
  getAllEmailSubscriptions(): Promise<EmailSubscription[]>;
  getEmailSubscription(email: string): Promise<EmailSubscription | undefined>;
  createEmailSubscription(subscription: InsertEmailSubscription): Promise<EmailSubscription>;
  deleteEmailSubscription(id: number): Promise<void>;
}

// MySQL Connection using hardcoded credentials
const connection = mysql.createPool({
  host: "40.192.41.79",
  user: "satya", 
  password: "Satya@12345",
  database: "MED_DB",
  port: 3306
});

const db = drizzle(connection);

export class MySQLStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser);
    return await this.getUser(result[0].insertId) as User;
  }

  // Site content methods
  async getSiteContent(section: string, key: string): Promise<SiteContent | undefined> {
    const result = await db.select().from(siteContent)
      .where(eq(siteContent.section, section));
    return result.find(item => item.key === key);
  }

  async getAllSiteContent(): Promise<SiteContent[]> {
    return await db.select().from(siteContent);
  }

  async updateSiteContent(content: InsertSiteContent): Promise<SiteContent> {
    const existing = await this.getSiteContent(content.section, content.key);
    
    if (existing) {
      await db.update(siteContent)
        .set({ value: content.value, type: content.type, updatedAt: new Date() })
        .where(eq(siteContent.id, existing.id));
      return await this.getSiteContent(content.section, content.key) as SiteContent;
    } else {
      const result = await db.insert(siteContent).values(content);
      return await this.getSiteContent(content.section, content.key) as SiteContent;
    }
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product);
    return await this.getProduct(result[0].insertId) as Product;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    await db.update(products).set(product).where(eq(products.id, id));
    return await this.getProduct(id) as Product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.displayOrder), asc(categories.name));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category);
    const newCategory = await db.select().from(categories).where(eq(categories.id, result[0].insertId));
    return newCategory[0];
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    // Get the current category before updating
    const currentCategory = await db.select().from(categories).where(eq(categories.id, id));
    const oldCategoryName = currentCategory[0]?.name;
    
    // Update the category
    await db.update(categories).set(category).where(eq(categories.id, id));
    const updatedCategory = await db.select().from(categories).where(eq(categories.id, id));
    
    // If the name changed, update all products that reference the old category name
    if (category.name && oldCategoryName && category.name !== oldCategoryName) {
      await db.update(products)
        .set({ category: category.name })
        .where(eq(products.category, oldCategoryName));
    }
    
    return updatedCategory[0];
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Contact methods
  async getAllContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const result = await db.select().from(contacts).where(eq(contacts.id, id));
    return result[0];
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const result = await db.insert(contacts).values(contact);
    return await this.getContact(result[0].insertId) as Contact;
  }

  async updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact> {
    await db.update(contacts).set({
      ...contact,
      updatedAt: new Date()
    }).where(eq(contacts.id, id));
    return await this.getContact(id) as Contact;
  }

  async deleteContact(id: number): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  // News article methods
  async getAllNewsArticles(): Promise<NewsArticle[]> {
    return await db.select().from(newsArticles)
      .where(eq(newsArticles.isActive, true))
      .orderBy(newsArticles.publishedAt);
  }

  async getLatestNewsArticles(limit: number = 10): Promise<NewsArticle[]> {
    return await db.select().from(newsArticles)
      .where(eq(newsArticles.isActive, true))
      .orderBy(newsArticles.publishedAt)
      .limit(limit);
  }

  async getNewsArticle(id: number): Promise<NewsArticle | undefined> {
    const result = await db.select().from(newsArticles).where(eq(newsArticles.id, id));
    return result[0];
  }

  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const result = await db.insert(newsArticles).values(article);
    return await this.getNewsArticle(result[0].insertId) as NewsArticle;
  }

  async clearOldNews(keepCount: number): Promise<void> {
    // First, remove all static sample data (example.com URLs)
    await connection.execute("DELETE FROM news_articles WHERE source_url LIKE 'https://example.com%'");
    
    // Then get IDs of real RSS articles to keep (latest ones, excluding static data)
    const articlesToKeep = await db.select({ id: newsArticles.id })
      .from(newsArticles)
      .where(sql`source_url NOT LIKE 'https://example.com%'`)
      .orderBy(newsArticles.publishedAt)
      .limit(keepCount);
    
    if (articlesToKeep.length > 0) {
      const keepIds = articlesToKeep.map(a => a.id);
      // Delete real RSS articles not in the keep list (but keep all real RSS articles if under limit)
      await connection.execute(
        `DELETE FROM news_articles WHERE id NOT IN (${keepIds.map(() => '?').join(',')}) AND source_url NOT LIKE 'https://example.com%'`,
        keepIds
      );
    }
  }

  // Offer methods
  async getAllOffers(): Promise<Offer[]> {
    return await db.select().from(offers)
      .where(eq(offers.isActive, true))
      .orderBy(offers.displayOrder, offers.id);
  }

  async getOffer(id: number): Promise<Offer | undefined> {
    const result = await db.select().from(offers).where(eq(offers.id, id));
    return result[0];
  }

  async createOffer(offer: InsertOffer): Promise<Offer> {
    const result = await db.insert(offers).values(offer);
    return await this.getOffer(result[0].insertId) as Offer;
  }

  async updateOffer(id: number, offer: Partial<InsertOffer>): Promise<Offer> {
    await db.update(offers).set({
      ...offer,
      updatedAt: new Date()
    }).where(eq(offers.id, id));
    return await this.getOffer(id) as Offer;
  }

  async deleteOffer(id: number): Promise<void> {
    await db.delete(offers).where(eq(offers.id, id));
  }

  // Email subscription methods
  async getAllEmailSubscriptions(): Promise<EmailSubscription[]> {
    return await db.select().from(emailSubscriptions)
      .where(eq(emailSubscriptions.isActive, true))
      .orderBy(emailSubscriptions.subscribedAt);
  }

  async getEmailSubscription(email: string): Promise<EmailSubscription | undefined> {
    const result = await db.select().from(emailSubscriptions).where(eq(emailSubscriptions.email, email));
    return result[0];
  }

  async createEmailSubscription(subscription: InsertEmailSubscription): Promise<EmailSubscription> {
    const result = await db.insert(emailSubscriptions).values(subscription);
    const newSubscription = await db.select().from(emailSubscriptions).where(eq(emailSubscriptions.id, result[0].insertId));
    return newSubscription[0];
  }

  async deleteEmailSubscription(id: number): Promise<void> {
    await db.delete(emailSubscriptions).where(eq(emailSubscriptions.id, id));
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private siteContentMap: Map<string, SiteContent>;
  private productsMap: Map<number, Product>;
  private categoriesMap: Map<number, Category>;
  private contactsMap: Map<number, Contact>;
  private newsArticlesMap: Map<number, NewsArticle>;
  private offersMap: Map<number, Offer>;
  private emailSubscriptionsMap: Map<number, EmailSubscription>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.siteContentMap = new Map();
    this.productsMap = new Map();
    this.categoriesMap = new Map();
    this.contactsMap = new Map();
    this.newsArticlesMap = new Map();
    this.offersMap = new Map();
    this.emailSubscriptionsMap = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      isAdmin: insertUser.isAdmin ?? false
    };
    this.users.set(id, user);
    return user;
  }

  async getSiteContent(section: string, key: string): Promise<SiteContent | undefined> {
    return this.siteContentMap.get(`${section}:${key}`);
  }

  async getAllSiteContent(): Promise<SiteContent[]> {
    return Array.from(this.siteContentMap.values());
  }

  async updateSiteContent(content: InsertSiteContent): Promise<SiteContent> {
    const id = this.currentId++;
    const siteContentItem: SiteContent = { 
      ...content, 
      id, 
      updatedAt: new Date(),
      type: content.type ?? "text"
    };
    this.siteContentMap.set(`${content.section}:${content.key}`, siteContentItem);
    return siteContentItem;
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.productsMap.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.productsMap.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentId++;
    const newProduct: Product = { 
      ...product, 
      id, 
      createdAt: new Date(),
      image: product.image ?? null,
      description: product.description ?? null,
      price: product.price ?? null,
      category: product.category ?? null,
      features: product.features ?? null,
      isActive: product.isActive ?? true
    };
    this.productsMap.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const existing = this.productsMap.get(id);
    if (!existing) throw new Error("Product not found");
    const updated = { ...existing, ...product };
    this.productsMap.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    this.productsMap.delete(id);
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categoriesMap.values())
      .filter(category => category.isActive)
      .sort((a, b) => {
        // Sort by displayOrder first, then by name
        if (a.displayOrder !== b.displayOrder) {
          return (a.displayOrder || 0) - (b.displayOrder || 0);
        }
        return a.name.localeCompare(b.name);
      });
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentId++;
    const newCategory: Category = { 
      ...category, 
      id,
      isActive: category.isActive ?? true,
      displayOrder: category.displayOrder ?? 0
    };
    this.categoriesMap.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const existing = this.categoriesMap.get(id);
    if (!existing) throw new Error("Category not found");
    
    const oldCategoryName = existing.name;
    const updated = { ...existing, ...category };
    this.categoriesMap.set(id, updated);
    
    // If the name changed, update all products that reference the old category name
    if (category.name && oldCategoryName && category.name !== oldCategoryName) {
      Array.from(this.productsMap.entries()).forEach(([productId, product]) => {
        if (product.category === oldCategoryName) {
          const updatedProduct = { ...product, category: category.name };
          this.productsMap.set(productId, updatedProduct);
        }
      });
    }
    
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    this.categoriesMap.delete(id);
  }

  // Contact methods
  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contactsMap.values());
  }

  async getContact(id: number): Promise<Contact | undefined> {
    return this.contactsMap.get(id);
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const id = this.currentId++;
    const newContact: Contact = { 
      ...contact, 
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      address: contact.address || null
    };
    this.contactsMap.set(id, newContact);
    return newContact;
  }

  async updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact> {
    const existing = this.contactsMap.get(id);
    if (!existing) throw new Error("Contact not found");
    const updated = { 
      ...existing, 
      ...contact,
      updatedAt: new Date()
    };
    this.contactsMap.set(id, updated);
    return updated;
  }

  async deleteContact(id: number): Promise<void> {
    this.contactsMap.delete(id);
  }

  // News article methods
  async getAllNewsArticles(): Promise<NewsArticle[]> {
    return Array.from(this.newsArticlesMap.values())
      .filter(article => article.isActive)
      .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime());
  }

  async getLatestNewsArticles(limit: number = 10): Promise<NewsArticle[]> {
    return (await this.getAllNewsArticles()).slice(0, limit);
  }

  async getNewsArticle(id: number): Promise<NewsArticle | undefined> {
    return this.newsArticlesMap.get(id);
  }

  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const id = this.currentId++;
    const newArticle: NewsArticle = { 
      ...article, 
      id,
      createdAt: new Date(),
      description: article.description || null,
      content: article.content || null,
      imageUrl: article.imageUrl || null,
      sourceName: article.sourceName || null,
      publishedAt: article.publishedAt || new Date(),
      isActive: article.isActive ?? true
    };
    this.newsArticlesMap.set(id, newArticle);
    return newArticle;
  }

  async clearOldNews(keepCount: number): Promise<void> {
    const allArticles = await this.getAllNewsArticles();
    const toDelete = allArticles.slice(keepCount);
    toDelete.forEach(article => this.newsArticlesMap.delete(article.id));
  }

  // Offer methods
  async getAllOffers(): Promise<Offer[]> {
    return Array.from(this.offersMap.values())
      .filter(offer => offer.isActive)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || a.id - b.id);
  }

  async getOffer(id: number): Promise<Offer | undefined> {
    return this.offersMap.get(id);
  }

  async createOffer(offer: InsertOffer): Promise<Offer> {
    const id = this.currentId++;
    const newOffer: Offer = { 
      ...offer, 
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      subtitle: offer.subtitle || null,
      image: offer.image || null,
      imageAlt: offer.imageAlt || null,
      isLarge: offer.isLarge ?? false,
      displayOrder: offer.displayOrder ?? 0,
      isActive: offer.isActive ?? true
    };
    this.offersMap.set(id, newOffer);
    return newOffer;
  }

  async updateOffer(id: number, offer: Partial<InsertOffer>): Promise<Offer> {
    const existing = this.offersMap.get(id);
    if (!existing) throw new Error("Offer not found");
    const updated = { 
      ...existing, 
      ...offer,
      updatedAt: new Date()
    };
    this.offersMap.set(id, updated);
    return updated;
  }

  async deleteOffer(id: number): Promise<void> {
    this.offersMap.delete(id);
  }

  // Email subscription methods
  async getAllEmailSubscriptions(): Promise<EmailSubscription[]> {
    return Array.from(this.emailSubscriptionsMap.values())
      .filter(subscription => subscription.isActive)
      .sort((a, b) => new Date(b.subscribedAt!).getTime() - new Date(a.subscribedAt!).getTime());
  }

  async getEmailSubscription(email: string): Promise<EmailSubscription | undefined> {
    return Array.from(this.emailSubscriptionsMap.values())
      .find(subscription => subscription.email === email);
  }

  async createEmailSubscription(subscription: InsertEmailSubscription): Promise<EmailSubscription> {
    const id = this.currentId++;
    const newSubscription: EmailSubscription = {
      ...subscription,
      id,
      subscribedAt: new Date(),
      isActive: subscription.isActive ?? true
    };
    this.emailSubscriptionsMap.set(id, newSubscription);
    return newSubscription;
  }

  async deleteEmailSubscription(id: number): Promise<void> {
    this.emailSubscriptionsMap.delete(id);
  }
}

// Use MySQL storage to connect to your MED_DB database
export const storage = new MySQLStorage();

// Initialize with some default data for development
const initializeDefaultData = async () => {
  try {
    // Create admin user
    const existingAdmin = await storage.getUserByUsername('admin');
    if (!existingAdmin) {
      await storage.createUser({
        username: 'admin',
        password: 'admin123',
        isAdmin: true
      });
    }

    // Create default categories
    const existingCategories = await storage.getAllCategories();
    if (existingCategories.length === 0) {
      const defaultCategories = [
        { name: 'Pain Relief', displayOrder: 1, isActive: true },
        { name: 'Cold and Flu', displayOrder: 2, isActive: true },
        { name: 'Diabetes Care', displayOrder: 3, isActive: true },
        { name: 'Digestive Health', displayOrder: 4, isActive: true },
        { name: 'First Aid', displayOrder: 5, isActive: true },
        { name: 'Skin Care', displayOrder: 6, isActive: true },
        { name: 'Child and Baby Care', displayOrder: 7, isActive: true },
        { name: 'Heart Health', displayOrder: 8, isActive: true },
        { name: 'Eye and Ear Care', displayOrder: 9, isActive: true },
        { name: 'Respiratory Health', displayOrder: 10, isActive: true }
      ];

      for (const category of defaultCategories) {
        await storage.createCategory(category);
      }
    }

    // Create some sample content
    const existingContent = await storage.getAllSiteContent();
    if (existingContent.length === 0) {
      const defaultContent = [
        { section: 'hero', key: 'title', value: 'Your Health, Our Priority', type: 'text' },
        { section: 'hero', key: 'subtitle', value: 'Premium medical supplies and healthcare products', type: 'text' },
        { section: 'navbar', key: 'logo_text', value: 'Oripio Medico', type: 'text' },
        { section: 'footer', key: 'company_name', value: 'Oripio Medico', type: 'text' },
        { section: 'footer', key: 'tagline', value: 'Quality Healthcare Solutions', type: 'text' }
      ];

      for (const content of defaultContent) {
        await storage.updateSiteContent(content);
      }
    }
  } catch (error) {
  }
};

// Initialize default data when the module loads
initializeDefaultData();
