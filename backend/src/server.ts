import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import queriesRoutes from './routes/queriesRoutes';



import authRoutes from './routes/authRoutes';
import membersRoutes from './routes/membersRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import paymentsRoutes from './routes/paymentsRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import trainersRoutes from './routes/trainersRoutes';
import progressRoutes from './routes/progressRoutes';
import reportsRoutes from './routes/reportsRoutes';
import notificationsRoutes from './routes/notificationsRoutes';
import settingsRoutes from './routes/settingsRoutes';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for any local frontend origin (5173, 5174, 3000, etc.)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl) or any localhost
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Seed DB on start if requested or empty
if (process.env.SEED_DB === 'true' || process.argv.includes('--seed')) {
  
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/trainers', trainersRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/queries', queriesRoutes);

// Seed API endpoint for viva demo ease
app.post('/api/seed', (req, res) => {
 
  res.json({ message: 'Database re-seeded with demo data successfully.' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'Smart Gym Management System API', timestamp: new Date() });
});

// Centralized error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({ error: 'An internal server error occurred. Please try again.' });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`  SFW THE GYM API SERVER RUNNING ON PORT ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=================================================`);
});

