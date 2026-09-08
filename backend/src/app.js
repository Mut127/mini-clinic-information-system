const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler');
const patientRoutes = require('./routes/patientRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Mini Clinic API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);

app.use(errorHandler);

module.exports = app;