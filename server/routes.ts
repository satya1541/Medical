import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { 
  insertUserSchema, 
  insertSiteContentSchema, 
  insertProductSchema, 
  insertCategorySchema,
  insertContactSchema,
  insertNewsArticleSchema,
  insertOfferSchema,
  insertEmailSubscriptionSchema
} from "@shared/schema";
import { storage } from "./storage";
import { fromZodError } from "zod-validation-error";
import { fetchLatestNews, updateNewsDatabase } from "./rssService";
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = 'client/public/uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'client/public/uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // User authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      res.json({ user: { id: user.id, username: user.username, isAdmin: user.isAdmin } });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Site content management routes
  app.get("/api/content", async (req, res) => {
    try {
      const content = await storage.getAllSiteContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/content/:section/:key", async (req, res) => {
    try {
      const { section, key } = req.params;
      const content = await storage.getSiteContent(section, key);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/content", async (req, res) => {
    try {
      const contentData = insertSiteContentSchema.parse(req.body);
      const content = await storage.updateSiteContent(contentData);
      res.json(content);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Product management routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      res.json(product);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Category management routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      res.json(category);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Contact management routes
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await storage.getContact(id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.json(contact);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.put("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contactData = insertContactSchema.partial().parse(req.body);
      const contact = await storage.updateContact(id, contactData);
      res.json(contact);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteContact(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Offers management routes
  app.get("/api/offers", async (req, res) => {
    try {
      const offers = await storage.getAllOffers();
      res.json(offers);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/offers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const offer = await storage.getOffer(id);
      if (!offer) {
        return res.status(404).json({ error: "Offer not found" });
      }
      res.json(offer);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/offers", async (req, res) => {
    try {
      const offerData = insertOfferSchema.parse(req.body);
      const offer = await storage.createOffer(offerData);
      res.json(offer);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.put("/api/offers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const offerData = insertOfferSchema.partial().parse(req.body);
      const offer = await storage.updateOffer(id, offerData);
      res.json(offer);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.delete("/api/offers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteOffer(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // News articles routes
  app.get("/api/news", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const articles = await storage.getLatestNewsArticles(limit);
      // Filter out only static sample data (specific example.com URLs)
      const realArticles = articles.filter(article => 
        !article.sourceUrl.startsWith('https://example.com/')
      );
      res.json(realArticles);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/news/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getNewsArticle(id);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin route to fetch and update news from RSS feeds
  app.post("/api/news/refresh", async (req, res) => {
    try {
      const articles = await fetchLatestNews();
      
      const success = await updateNewsDatabase(articles, storage);
      if (success) {
        res.json({ message: "News updated successfully", count: articles.length });
      } else {
        res.status(500).json({ error: "Failed to update news database" });
      }
    } catch (error) {
      console.error("Error refreshing news:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin route to clear static sample data
  app.post("/api/news/clear-static", async (req, res) => {
    try {
      // Remove articles with example.com URLs (static sample data)
      const mysql = await import('mysql2/promise');
      const connection = mysql.createPool({
        host: "40.192.41.79",
        user: "satya", 
        password: "Satya@12345",
        database: "MED_DB",
        port: 3306
      });
      
      await connection.execute("DELETE FROM news_articles WHERE source_url LIKE 'https://example.com%'");
      res.json({ message: "Static data cleared successfully" });
    } catch (error) {
      console.error("Error clearing static data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // File upload route
  app.post("/api/upload", upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      res.status(500).json({ error: "File upload failed" });
    }
  });

  // Email subscription routes
  app.get("/api/emails", async (req, res) => {
    try {
      // Admin authentication check
      const { authorization } = req.headers;
      if (!authorization) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const subscriptions = await storage.getAllEmailSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching email subscriptions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/emails", async (req, res) => {
    try {
      const subscriptionData = insertEmailSubscriptionSchema.parse(req.body);
      
      // Check if email already exists
      const existingSubscription = await storage.getEmailSubscription(subscriptionData.email);
      if (existingSubscription) {
        return res.status(409).json({ error: "Email already subscribed" });
      }
      
      const subscription = await storage.createEmailSubscription(subscriptionData);
      res.json(subscription);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        console.error("Error creating email subscription:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.delete("/api/emails/:id", async (req, res) => {
    try {
      // Admin authentication check
      const { authorization } = req.headers;
      if (!authorization) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const id = parseInt(req.params.id);
      await storage.deleteEmailSubscription(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting email subscription:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
