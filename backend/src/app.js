import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();

// Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


// import routes
import authRoutes from "./routes/authRoutes.js";


// Routes
app.use('/api/v1/auth', authRoutes);
app.get('/', (req, res) => res.send('Backend is running'));

export default app;
