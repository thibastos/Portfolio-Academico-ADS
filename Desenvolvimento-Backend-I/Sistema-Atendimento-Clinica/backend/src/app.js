const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API funcionando' });
});

app.use('/auth', authRoutes);
app.use('/appointments', appointmentRoutes);

module.exports = app;