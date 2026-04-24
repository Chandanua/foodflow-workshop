import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';

const db = new Database('foodflow.db');
const JWT_SECRET = process.env.JWT_SECRET || 'foodflow-secret-key-2026';

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('customer', 'restaurant'))
  );

  CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ownerId INTEGER NOT NULL,
    name TEXT NOT NULL,
    cuisine TEXT NOT NULL,
    image TEXT,
    rating REAL DEFAULT 0,
    deliveryTime TEXT,
    FOREIGN KEY(ownerId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurantId INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT,
    image TEXT,
    FOREIGN KEY(restaurantId) REFERENCES restaurants(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerId INTEGER NOT NULL,
    restaurantId INTEGER NOT NULL,
    items TEXT NOT NULL,
    totalPrice REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customerId) REFERENCES users(id),
    FOREIGN KEY(restaurantId) REFERENCES restaurants(id)
  );
`);

// Middleware to verify JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Middleware for role-based authorization
const authorizeRole = (...allowedRoles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access restricted' });
    }
    next();
  };
};

// Seed Data helper
const seedIfEmpty = async () => {
  const userCount = db.prepare('SELECT count(*) as count FROM users').get() as any;
  if (userCount.count === 0) {
    const hashedPassword = await bcrypt.hash('password', 10);
    
    // Seed Admin/Restaurant
    const info = db.prepare('INSERT INTO users (fullName, email, password, role) VALUES (?, ?, ?, ?)').run('Admin User', 'admin@example.com', hashedPassword, 'restaurant');
    const ownerId = info.lastInsertRowid;

    const restaurants = [
      ['Pizza Palace', 'Italian • Pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop', 4.8, '15-25 min'],
      ['Sushi Zen', 'Japanese • Sushi', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop', 4.9, '30-45 min'],
      ['Burger Barn', 'American • Burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop', 4.5, '20-30 min'],
      ['Taco Town', 'Mexican • Tacos', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800&auto=format&fit=crop', 4.7, '15-20 min'],
      ['Green Garden', 'Healthy • Salads', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop', 4.6, '20-35 min'],
      ['Curry Quest', 'Indian • Spicy', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop', 4.8, '35-50 min']
    ];

    for (const r of restaurants) {
      const rInfo = db.prepare('INSERT INTO restaurants (ownerId, name, cuisine, image, rating, deliveryTime) VALUES (?, ?, ?, ?, ?, ?)').run(ownerId, ...r);
      
      // Seed some menu items for Pizza Palace
      if (r[0] === 'Pizza Palace') {
        db.prepare('INSERT INTO menu_items (restaurantId, name, description, price, category, image) VALUES (?, ?, ?, ?, ?, ?)').run(
          rInfo.lastInsertRowid, 'Margherita Pizza', 'Classic tomato sauce, fresh mozzarella, and basil.', 14.99, 'Main Course', 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?q=80&w=600&auto=format&fit=crop'
        );
        db.prepare('INSERT INTO menu_items (restaurantId, name, description, price, category, image) VALUES (?, ?, ?, ?, ?, ?)').run(
          rInfo.lastInsertRowid, 'Pepperoni Feast', 'Double pepperoni with extra cheese.', 16.99, 'Main Course', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop'
        );
      }
    }
  }
};

async function startServer() {
  await seedIfEmpty();
  const app = express();
  const PORT = 3000;

  app.use(morgan('dev'));
  app.use(cors());
  app.use(express.json());
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  // Auth Endpoints
  app.post('/api/register', async (req, res) => {
    const { fullName, email, password, role } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare('INSERT INTO users (fullName, email, password, role) VALUES (?, ?, ?, ?)');
      const info = stmt.run(fullName, email, hashedPassword, role);
      
      if (role === 'restaurant') {
        const restStmt = db.prepare('INSERT INTO restaurants (ownerId, name, cuisine, deliveryTime) VALUES (?, ?, ?, ?)');
        restStmt.run(info.lastInsertRowid, `${fullName}'s Kitchen`, 'General', '20-30 min');
      }

      res.status(201).json({ success: true });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ error: 'Email already exists or invalid data' });
    }
  });

  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      
      if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '6h' });
        res.json({ 
          token,
          user: { id: user.id, role: user.role, fullName: user.fullName }
        });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Global Error Handler for better debugging
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('SERVER ERROR:', err.stack);
    res.status(500).json({ error: 'Something broke on our end' });
  });

  // Restaurant Endpoints
  app.get('/api/restaurants', (req, res) => {
    const restaurants = db.prepare('SELECT * FROM restaurants').all();
    res.json(restaurants);
  });

  app.get('/api/restaurants/:id', (req, res) => {
    const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(req.params.id);
    res.json(restaurant);
  });

  app.get('/api/restaurants/owner/:ownerId', authenticateToken, authorizeRole('restaurant'), (req: any, res) => {
    if (req.user.id !== parseInt(req.params.ownerId)) return res.status(403).json({ error: 'Forbidden' });
    const restaurant = db.prepare('SELECT * FROM restaurants WHERE ownerId = ?').get(req.params.ownerId);
    res.json(restaurant);
  });

  // Menu Endpoints
  app.get('/api/menu/:restaurantId', (req, res) => {
    const items = db.prepare('SELECT * FROM menu_items WHERE restaurantId = ?').all(req.params.restaurantId);
    res.json(items);
  });

  app.post('/api/menu', authenticateToken, authorizeRole('restaurant'), (req: any, res) => {
    const { restaurantId, name, description, price, category, image } = req.body;
    const stmt = db.prepare('INSERT INTO menu_items (restaurantId, name, description, price, category, image) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(restaurantId, name, description, price, category, image);
    res.status(201).json({ id: info.lastInsertRowid });
  });

  app.put('/api/menu/:id', authenticateToken, authorizeRole('restaurant'), (req: any, res) => {
    const { name, description, price, category, image } = req.body;
    const stmt = db.prepare('UPDATE menu_items SET name = ?, description = ?, price = ?, category = ?, image = ? WHERE id = ?');
    stmt.run(name, description, price, category, image, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/menu/:id', authenticateToken, authorizeRole('restaurant'), (req: any, res) => {
    db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Advanced Order Management
  app.post('/api/orders', authenticateToken, authorizeRole('customer'), (req: any, res) => {
    const { restaurantId, items, totalPrice } = req.body;
    const customerId = req.user.id;
    const stmt = db.prepare('INSERT INTO orders (customerId, restaurantId, items, totalPrice) VALUES (?, ?, ?, ?)');
    const info = stmt.run(customerId, restaurantId, JSON.stringify(items), totalPrice);
    res.status(201).json({ id: info.lastInsertRowid });
  });

  app.get('/api/orders/customer', authenticateToken, authorizeRole('customer'), (req: any, res) => {
    const orders = db.prepare('SELECT orders.*, restaurants.name as restaurantName FROM orders JOIN restaurants ON orders.restaurantId = restaurants.id WHERE customerId = ? ORDER BY createdAt DESC').all(req.user.id);
    res.json(orders);
  });

  app.get('/api/orders/restaurant/:restaurantId', authenticateToken, authorizeRole('restaurant'), (req: any, res) => {
    const orders = db.prepare('SELECT orders.*, users.fullName as customerName FROM orders JOIN users ON orders.customerId = users.id WHERE restaurantId = ? ORDER BY createdAt DESC').all(req.params.restaurantId);
    res.json(orders);
  });

  app.patch('/api/orders/:id/status', authenticateToken, authorizeRole('restaurant'), (req: any, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'delivering', 'delivered', 'rejected'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.status(200).json({ success: true });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
