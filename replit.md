# Replit Project Documentation

## Overview

This is a full-stack medical e-commerce web application built with React frontend and Express backend. The project is a medical products marketplace called "Oripio Medico" that offers various medical supplies, equipment, and healthcare products. The application features a modern design with product catalogs, promotional banners, news sections, and a comprehensive shopping experience for medical professionals and consumers.

**Project Status**: Successfully imported and running on Replit platform with external MySQL database connectivity.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript and follows a component-based architecture:

- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing (lightweight React router alternative)
- **Styling**: Tailwind CSS with custom CSS variables and utility classes
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design system
- **State Management**: TanStack React Query for server state management and API caching
- **Build Tool**: Vite for fast development and optimized builds
- **Component Structure**: Organized into pages and sections for better maintainability

The frontend follows a section-based page layout pattern where each page is composed of multiple reusable sections (NavbarSection, HeroSection, ProductSection, etc.). This approach provides modularity and reusability across different pages.

### Backend Architecture
The backend uses Express.js with TypeScript and connects to an external MySQL database:

- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations with MySQL
- **External Database**: MySQL database at 40.192.74.89 (MED_DB)
- **Storage Layer**: MySQLStorage implementation with fallback MemStorage for development
- **Development Setup**: Hot reloading with tsx and Vite middleware integration
- **API Design**: RESTful API structure with /api prefix for all endpoints
- **File Uploads**: Multer for handling product image uploads

### Database Configuration
- **Production Database**: External MySQL server (40.192.74.89/MED_DB)
- **Connection**: mysql2 with connection pooling
- **Tables**: users, site_content, products, categories, contacts, news_articles
- **Schema Management**: Raw SQL table creation with sample data initialization
- **Sample Data**: Pre-populated with medical products, categories, contacts, and admin user

### Key Features Implemented
1. **Product Management**: Full CRUD operations for medical products with image upload
2. **Category System**: Organized product categorization (Pain Relief, Diabetes Care, etc.)
3. **Contact Management**: Company contact information management
4. **News Articles**: Medical news and updates system with RSS integration
5. **Admin Interface**: Administrative panel for content management
6. **Site Content**: Dynamic site content management for headers, footers, etc.

### Development and Build Process
- **Development**: Single unified server on port 5000 serving both frontend and backend
- **Frontend Dev**: Vite with React and TypeScript
- **Backend Dev**: tsx for TypeScript execution with hot reload
- **Build Process**: Vite for frontend bundling, esbuild for backend production build
- **Host Configuration**: Properly configured for Replit with 0.0.0.0:5000 and allowedHosts: true

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for modern React development
- **Backend Framework**: Express.js for server-side API handling
- **Build Tools**: Vite for frontend tooling, tsx for TypeScript execution, esbuild for production builds

### Database and ORM
- **Drizzle ORM**: Type-safe database operations with MySQL dialect
- **MySQL2**: Connection pooling and raw SQL execution for external database
- **Database Tooling**: Drizzle Kit for schema management

### UI and Styling
- **Styling Framework**: Tailwind CSS with PostCSS for utility-first CSS
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **UI System**: shadcn/ui components built on top of Radix UI
- **Icons**: Lucide React for consistent iconography
- **Utilities**: clsx and tailwind-merge for conditional styling

### Form and Validation
- **Form Handling**: React Hook Form with Hookform Resolvers
- **Validation**: Zod for runtime type validation and schema validation
- **Integration**: Drizzle-Zod for automatic schema-to-validation mapping

### Additional Features
- **File Upload**: Multer for product image management
- **RSS Integration**: RSS parser for medical news updates
- **Date Handling**: date-fns for date manipulation and formatting
- **Session Management**: Express session with memory store
- **WebSocket**: ws for real-time features

## Recent Changes

### Mobile Responsiveness & PWA Enhancement (September 9, 2025)
- **Mobile Navigation**: Implemented hamburger menu navigation for mobile devices with improved UX
- **Responsive Search**: Enhanced search functionality with mobile-optimized suggestions dropdown
- **PWA Implementation**: Full Progressive Web App features added:
  - Web App Manifest with proper metadata and app configuration
  - Service Worker for offline functionality and caching capabilities
  - PWA Meta Tags for optimal mobile web app experience
  - Install prompt with custom UI for app installation
  - Network status detection and offline notifications
  - Push notification support framework
- **Icon System**: Complete PWA icon set in multiple sizes (16x16 to 512x512)
- **Cross-Platform Support**: Apple, Microsoft, and standard PWA compatibility
- **Offline Experience**: Cached resources and graceful offline functionality

### Project Import and Setup (September 9, 2025)
- **Replit Configuration**: Successfully configured for Replit environment
- **Workflow Setup**: Configured single workflow to run both frontend and backend on port 5000
- **Host Configuration**: Set up proper host settings (0.0.0.0 with allowedHosts: true) for Replit proxy
- **TypeScript Fix**: Resolved contact schema type compatibility issue
- **Deployment Config**: Configured autoscale deployment with proper build and run commands
- **Database Connection**: Verified external MySQL database connectivity and table creation
- **Sample Data**: Confirmed all sample data (products, categories, contacts) loads correctly

### Contacts Management System (Added September 8, 2025)
- **New Database Table**: Added `contacts` table with fields for name, email, and contact number
- **Admin Interface**: New "Contacts" tab in admin dashboard for managing company contact information
- **CRUD Operations**: Full create, read, update, and delete functionality for contacts
- **API Endpoints**: RESTful API endpoints at `/api/contacts` for contacts management
- **Sample Data**: Pre-populated with sample contacts including Dr. Sarah Johnson, Emergency Hotline, and Customer Support
- **Type Safety**: Complete TypeScript integration with Drizzle ORM and Zod validation

## Current Status
✅ **Application Running**: Successfully running on port 5000 with both frontend and backend
✅ **Database Connected**: External MySQL database connection established and working
✅ **API Endpoints**: All REST API endpoints functional (/api/products, /api/categories, /api/contacts, /api/news)
✅ **Frontend Loading**: React application loads correctly with medical product catalog
✅ **Deployment Ready**: Configured for autoscale deployment on Replit
✅ **Sample Data**: All sample medical products, categories, and contacts loaded successfully

The application is fully functional and ready for use on the Replit platform.