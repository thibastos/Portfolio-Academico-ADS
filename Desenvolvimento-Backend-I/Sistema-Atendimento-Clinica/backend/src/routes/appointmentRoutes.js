const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const appointmentController = require('../controllers/appointmentController');

const router = express.Router();

router.get('/cep/:cep', appointmentController.getAddressByCepHandler);

router.post('/', authMiddleware, appointmentController.createAppointment);

router.get('/my', authMiddleware, appointmentController.getMyAppointments);

router.get('/', authMiddleware, roleMiddleware('secretary'), appointmentController.getAllAppointments);

router.patch('/:id/status', authMiddleware, appointmentController.updateAppointmentStatus);

module.exports = router;
