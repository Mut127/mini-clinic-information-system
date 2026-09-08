const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler');
const patientRoutes = require('./routes/patientRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const queueRoutes = require('./routes/queueRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Mini Clinic API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

app.use(errorHandler);

module.exports = app;