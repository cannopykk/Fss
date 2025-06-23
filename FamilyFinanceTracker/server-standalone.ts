import express, { type Express, Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./server/routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - start;
    console.log(`${new Date().toLocaleTimeString()} [express] ${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    return originalSend.call(this, data);
  };
  
  next();
});

// Register API routes
registerRoutes(app).then((server) => {
  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist/client')));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist/client/index.html'));
    });
  }

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Frontend dev server should be running on http://localhost:5173`);
      console.log(`API endpoints available at http://localhost:${PORT}/api`);
    }
  });
});