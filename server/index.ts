import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createTables } from "./createTables";
import cron from "node-cron";
import { fetchLatestNews, updateNewsDatabase } from "./rssService";
import { storage } from "./storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Create database tables before starting the server
  await createTables();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // ALWAYS serve the app on port 5000 FIRST
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    console.log(`Server ready on http://0.0.0.0:${port}`);
    console.log('Automatic RSS refresh scheduled every 6 hours');
  });

  // Setup automatic RSS refresh every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    try {
      log('Running scheduled RSS refresh...');
      const articles = await fetchLatestNews();
      await updateNewsDatabase(articles, storage);
      log(`Scheduled RSS refresh completed: ${articles.length} articles updated`);
    } catch (error) {
      log(`Scheduled RSS refresh failed: ${error}`);
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  // DO NOT await this so server starts even if Vite has issues
  if (app.get("env") === "development") {
    setupVite(app, server).catch(err => {
      log(`Vite setup failed: ${err.message}`);
    });
  } else {
    serveStatic(app);
  }
})();
