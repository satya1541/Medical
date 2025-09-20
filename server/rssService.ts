import Parser from 'rss-parser';
import { NewsArticle, InsertNewsArticle } from '@shared/schema';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
      ['description', 'description'],
      ['content:encoded', 'contentEncoded'],
      ['image', 'image'],
      ['itunes:image', 'itunesImage'],
    ]
  }
});

// Medical/Health RSS feeds to fetch from
const RSS_FEEDS = [
  {
    url: 'https://feeds.bbci.co.uk/news/health/rss.xml',
    name: 'BBC Health'
  },
  {
    url: 'https://www.sciencedaily.com/rss/health_medicine.xml',
    name: 'Science Daily Health'
  },
  {
    url: 'https://health.clevelandclinic.org/feed',
    name: 'Cleveland Clinic'
  },
  {
    url: 'https://www.mayoclinic.org/rss/all-podcasts',
    name: 'Mayo Clinic'
  }
];

interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  description?: string;
  contentEncoded?: string;
  mediaContent?: any;
  mediaThumbnail?: any;
  enclosure?: any;
  image?: any;
  itunesImage?: any;
}

export async function fetchLatestNews(): Promise<InsertNewsArticle[]> {
  const articles: InsertNewsArticle[] = [];
  
  for (const feed of RSS_FEEDS) {
    try {
      const feedData = await parser.parseURL(feed.url);
      
      // Get the latest 5 articles from each feed
      const latestItems = feedData.items.slice(0, 5);
      
      for (const item of latestItems) {
        const rssItem = item as RSSItem;
        
        // Extract image URL from various possible fields
        let imageUrl = null;
        
        // Try multiple image sources in order of preference
        if (rssItem.mediaContent && rssItem.mediaContent.$ && rssItem.mediaContent.$.url) {
          imageUrl = rssItem.mediaContent.$.url;
        } else if (rssItem.mediaThumbnail && rssItem.mediaThumbnail.$ && rssItem.mediaThumbnail.$.url) {
          imageUrl = rssItem.mediaThumbnail.$.url;
        } else if (rssItem.enclosure && rssItem.enclosure.url && rssItem.enclosure.type?.startsWith('image/')) {
          imageUrl = rssItem.enclosure.url;
        } else if (rssItem.image) {
          imageUrl = typeof rssItem.image === 'string' ? rssItem.image : rssItem.image.url;
        } else if (rssItem.itunesImage) {
          imageUrl = typeof rssItem.itunesImage === 'string' ? rssItem.itunesImage : rssItem.itunesImage.href;
        }
        
        // If no image found in RSS fields, try to extract from content/description
        if (!imageUrl && (rssItem.content || rssItem.description || rssItem.contentEncoded)) {
          const contentToSearch = rssItem.contentEncoded || rssItem.content || rssItem.description;
          const imgMatch = contentToSearch?.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
          if (imgMatch) {
            imageUrl = imgMatch[1];
          }
        }
        
        // Use content in order of preference
        const content = rssItem.contentEncoded || rssItem.content || rssItem.description || rssItem.contentSnippet;
        const description = rssItem.contentSnippet || rssItem.description;
        
        if (rssItem.title && rssItem.link) {
          const article: InsertNewsArticle = {
            title: rssItem.title.substring(0, 500), // Limit to VARCHAR length
            description: description?.substring(0, 1000) || null, // Reasonable limit for description
            content: content || null,
            imageUrl: imageUrl,
            sourceUrl: rssItem.link,
            sourceName: feed.name,
            publishedAt: rssItem.pubDate ? new Date(rssItem.pubDate) : new Date(),
            isActive: true
          };
          
          articles.push(article);
        }
      }
      
    } catch (error) {
      console.error(`Error fetching RSS feed from ${feed.name}:`, error);
      // Continue with other feeds even if one fails
    }
  }
  
  // Sort by published date, newest first
  articles.sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return dateB - dateA;
  });
  
  // Return the latest 20 articles across all feeds
  return articles.slice(0, 20);
}

export async function updateNewsDatabase(articles: InsertNewsArticle[], storage: any) {
  try {
    // First clear ALL existing articles to ensure only fresh RSS data
    const mysql = await import('mysql2/promise');
    const connection = mysql.createPool({
      host: "40.192.41.79",
      user: "satya", 
      password: "Satya@12345",
      database: "MED_DB",
      port: 3306
    });
    
    // Clear all existing news articles
    await connection.execute("DELETE FROM news_articles");
    
    // Insert new RSS articles only
    for (const article of articles) {
      await storage.createNewsArticle(article);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating news database:', error);
    return false;
  }
}
