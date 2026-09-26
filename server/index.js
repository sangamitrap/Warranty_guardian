require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const authMiddleware = require('./middleware/auth');

const app = express();


// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
  });
});


// Protected test route
app.get('/api/protected-test', authMiddleware, (req, res) => {
  res.json({
    message: 'You are authenticated',
    userId: req.userId,
  });
});


// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });


// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});