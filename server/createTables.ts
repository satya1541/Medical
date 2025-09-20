import mysql from "mysql2/promise";

const connection = mysql.createPool({
  host: "40.192.41.79",
  user: "satya",
  password: "Satya@12345",
  database: "MED_DB",
  port: 3306
});

export async function createTables() {
  try {

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create site_content table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS site_content (
        id INT AUTO_INCREMENT PRIMARY KEY,
        section VARCHAR(100) NOT NULL,
        \`key\` VARCHAR(100) NOT NULL,
        value TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'text',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_section_key (section, \`key\`)
      )
    `);

    // Create categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    // Create products table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price VARCHAR(50),
        image VARCHAR(255),
        category VARCHAR(100),
        features TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create contacts table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        contact_number VARCHAR(50) NOT NULL,
        address VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create news_articles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS news_articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        content TEXT,
        image_url VARCHAR(500),
        source_url VARCHAR(500) NOT NULL,
        source_name VARCHAR(100),
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    // Create offers table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS offers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        discount VARCHAR(50) NOT NULL,
        original_price VARCHAR(50) NOT NULL,
        current_price VARCHAR(50) NOT NULL,
        image VARCHAR(255),
        image_alt VARCHAR(255),
        is_large BOOLEAN DEFAULT FALSE,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create email_subscriptions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS email_subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    // Add address column to contacts table if it doesn't exist
    try {
      await connection.execute(`
        ALTER TABLE contacts ADD COLUMN address VARCHAR(500)
      `);
    } catch (error: any) {
      // Column already exists, which is fine
      if (!error.message.includes('Duplicate column name')) {
      }
    }

    // Add features column to products table if it doesn't exist
    try {
      await connection.execute(`
        ALTER TABLE products ADD COLUMN features TEXT
      `);
    } catch (error: any) {
      // Column already exists, which is fine
      if (!error.message.includes('Duplicate column name')) {
      }
    }


    // Insert sample contact data if table is empty
    const [contactExists] = await connection.execute('SELECT COUNT(*) as count FROM contacts');
    const contactCount = (contactExists as any[])[0].count;

    if (contactCount === 0) {
      const sampleContacts = [
        ['Dr. Sarah Johnson', 'sarah.johnson@oripiomedico.com', '+1 (555) 123-4567', '123 Medical Center, New York, NY'],
        ['Emergency Hotline', 'emergency@oripiomedico.com', '+1 (555) 911-0000', '123 Road, Dhaka, Bangladesh'],
        ['Customer Support', 'support@oripiomedico.com', '+1 (555) 222-3333', '456 Support Street, California, USA']
      ];

      for (const [name, email, contactNumber, address] of sampleContacts) {
        await connection.execute(
          'INSERT INTO contacts (name, email, contact_number, address) VALUES (?, ?, ?, ?)',
          [name, email, contactNumber, address]
        );
      }
    }

    // Insert admin user if doesn't exist
    const [adminExists] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      ['admin']
    );

    if (!(adminExists as any[]).length) {
      await connection.execute(
        'INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)',
        ['admin', 'admin123', true]
      );
    }

    // Insert default categories if table is empty
    const [categoryExists] = await connection.execute('SELECT COUNT(*) as count FROM categories');
    const categoryCount = (categoryExists as any[])[0].count;

    if (categoryCount === 0) {
      const defaultCategories = [
        ['Pain Relief', 1],
        ['Cold and Flu', 2],
        ['Diabetes Care', 3],
        ['Digestive Health', 4],
        ['First Aid', 5],
        ['Skin Care', 6],
        ['Child and Baby Care', 7],
        ['Heart Health', 8],
        ['Eye and Ear Care', 9],
        ['Respiratory Health', 10]
      ];

      for (const [name, order] of defaultCategories) {
        await connection.execute(
          'INSERT INTO categories (name, display_order, is_active) VALUES (?, ?, ?)',
          [name, order, true]
        );
      }
    }

    // Insert default site content if table is empty
    const [contentExists] = await connection.execute('SELECT COUNT(*) as count FROM site_content');
    const contentCount = (contentExists as any[])[0].count;

    if (contentCount === 0) {
      const defaultContent = [
        ['hero', 'title', 'Your Health, Our Priority', 'text'],
        ['hero', 'subtitle', 'Premium medical supplies and healthcare products', 'text'],
        ['navbar', 'logo_text', 'Oripio Medico', 'text'],
        ['footer', 'company_name', 'Oripio Medico', 'text'],
        ['footer', 'tagline', 'Quality Healthcare Solutions', 'text']
      ];

      for (const [section, key, value, type] of defaultContent) {
        await connection.execute(
          'INSERT INTO site_content (section, `key`, value, type) VALUES (?, ?, ?, ?)',
          [section, key, value, type]
        );
      }
    }

    // Insert sample products if table is empty
    const [productExists] = await connection.execute('SELECT COUNT(*) as count FROM products');
    const productCount = (productExists as any[])[0].count;

    if (productCount === 0) {
      const sampleProducts = [
        ['Paracetamol 500mg', 'Pain relief medication for headaches and fever', '₹45', '/figmaAssets/pngegg--1--1-1.png', 'Pain Relief'],
        ['Cough Syrup', 'Natural cough suppressant with honey', '₹85', '/figmaAssets/pngegg--2--1.png', 'Cold and Flu'],
        ['Digital Thermometer', 'Accurate temperature measurement device', '₹150', '/figmaAssets/pngegg--3--1.png', 'First Aid'],
        ['Blood Glucose Monitor', 'Digital glucose meter for diabetes care', '₹1200', '/figmaAssets/pngegg--4--1.png', 'Diabetes Care'],
        ['Antiseptic Cream', 'Wound healing and infection prevention', '₹65', '/figmaAssets/pngegg--5--1.png', 'First Aid'],
        ['Vitamin D3 Tablets', 'Essential vitamin supplement', '₹180', '/figmaAssets/pngegg--6--1.png', 'Heart Health'],
        ['Face Mask (Pack of 10)', 'Surgical face masks for protection', '₹120', '/figmaAssets/pngegg--7--1.png', 'First Aid'],
        ['Hand Sanitizer 250ml', 'Alcohol-based hand sanitizer', '₹95', '/figmaAssets/pngegg--8--1.png', 'First Aid'],
        ['Blood Pressure Monitor', 'Digital blood pressure measurement', '₹2500', '/figmaAssets/pngegg--9--1.png', 'Heart Health'],
        ['Insulin Pen', 'Diabetes medication delivery device', '₹850', '/figmaAssets/pngegg--10--1.png', 'Diabetes Care'],
        ['Moisturizing Lotion', 'Gentle skin care for dry skin', '₹220', '/figmaAssets/pngegg--11--1.png', 'Skin Care'],
        ['Cough Drops', 'Throat soothing menthol drops', '₹35', '/figmaAssets/pngegg--13--1.png', 'Cold and Flu']
      ];

      for (const [name, description, price, image, category] of sampleProducts) {
        await connection.execute(
          'INSERT INTO products (name, description, price, image, category, is_active) VALUES (?, ?, ?, ?, ?, ?)',
          [name, description, price, image, category, true]
        );
      }
    }

    // Insert sample offers if table is empty
    const [offerExists] = await connection.execute('SELECT COUNT(*) as count FROM offers');
    const offerCount = (offerExists as any[])[0].count;

    if (offerCount === 0) {
      const sampleOffers = [
        [
          'BLACK GARLIC OIL',
          'Stronger and Thicker Hair With Black Garlic Oil.',
          '25% OFF',
          '₹37.00',
          '₹37.00',
          '/figmaAssets/kara-sarimsak-yagi-1.png',
          'Black Garlic Oil',
          true, // isLarge
          1
        ],
        [
          'Dental Care Set for Vivid and Bright Smiles',
          null,
          '25% OFF',
          '₹33.90',
          '₹22.90',
          '/figmaAssets/disbeyazlaticiset-2.png',
          'Dental Care Set',
          false, // isLarge
          2
        ],
        [
          'BANANA FLAVOURED TOOTHPASTE',
          null,
          '25% OFF',
          '₹37.00',
          '₹37.00',
          '/figmaAssets/muz-aromali-dis-.png',
          'Banana Flavoured Toothpaste',
          false, // isLarge
          3
        ]
      ];

      for (const [title, subtitle, discount, originalPrice, currentPrice, image, imageAlt, isLarge, displayOrder] of sampleOffers) {
        await connection.execute(
          'INSERT INTO offers (title, subtitle, discount, original_price, current_price, image, image_alt, is_large, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [title, subtitle, discount, originalPrice, currentPrice, image, imageAlt, isLarge, displayOrder, true]
        );
      }
    }

    return true;
  } catch (error) {
    console.error('Error creating tables:', error);
    return false;
  }
}
