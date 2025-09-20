import { mysqlTable, text, int, boolean, varchar, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const siteContent = mysqlTable("site_content", {
  id: int("id").primaryKey().autoincrement(),
  section: varchar("section", { length: 100 }).notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value").notNull(),
  type: varchar("type", { length: 50 }).default("text"), // text, image, html
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = mysqlTable("products", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: varchar("price", { length: 50 }),
  image: varchar("image", { length: 255 }),
  category: varchar("category", { length: 100 }),
  features: text("features"), // JSON string of features array
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = mysqlTable("categories", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayOrder: int("display_order").default(0),
  isActive: boolean("is_active").default(true),
});

export const contacts = mysqlTable("contacts", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  contactNumber: varchar("contact_number", { length: 50 }).notNull(),
  address: varchar("address", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const newsArticles = mysqlTable("news_articles", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  content: text("content"),
  imageUrl: varchar("image_url", { length: 500 }),
  sourceUrl: varchar("source_url", { length: 500 }).notNull(),
  sourceName: varchar("source_name", { length: 100 }),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const offers = mysqlTable("offers", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: text("subtitle"),
  discount: varchar("discount", { length: 50 }).notNull(),
  originalPrice: varchar("original_price", { length: 50 }).notNull(),
  currentPrice: varchar("current_price", { length: 50 }).notNull(),
  image: varchar("image", { length: 255 }),
  imageAlt: varchar("image_alt", { length: 255 }),
  isLarge: boolean("is_large").default(false), // true for featured card, false for smaller cards
  displayOrder: int("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailSubscriptions = mysqlTable("email_subscriptions", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const insertSiteContentSchema = createInsertSchema(siteContent).pick({
  section: true,
  key: true,
  value: true,
  type: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  image: true,
  category: true,
  features: true,
  isActive: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  displayOrder: true,
  isActive: true,
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  name: true,
  email: true,
  contactNumber: true,
  address: true,
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles).pick({
  title: true,
  description: true,
  content: true,
  imageUrl: true,
  sourceUrl: true,
  sourceName: true,
  publishedAt: true,
  isActive: true,
});

export const insertOfferSchema = createInsertSchema(offers).pick({
  title: true,
  subtitle: true,
  discount: true,
  originalPrice: true,
  currentPrice: true,
  image: true,
  imageAlt: true,
  isLarge: true,
  displayOrder: true,
  isActive: true,
});

export const insertEmailSubscriptionSchema = createInsertSchema(emailSubscriptions).pick({
  email: true,
  isActive: true,
}).extend({
  email: z.string().email("Please enter a valid email address"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SiteContent = typeof siteContent.$inferSelect;
export type InsertSiteContent = z.infer<typeof insertSiteContentSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type Offer = typeof offers.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type EmailSubscription = typeof emailSubscriptions.$inferSelect;
export type InsertEmailSubscription = z.infer<typeof insertEmailSubscriptionSchema>;
