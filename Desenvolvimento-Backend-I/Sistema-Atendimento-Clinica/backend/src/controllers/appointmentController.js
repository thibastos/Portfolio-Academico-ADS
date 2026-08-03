const Appointment = require('../models/Appointment');
const { getAddressByCep } = require('../services/cepService');
const { getWeatherAlertText } = require('../services/weatherService');

function normalizeDate(dateInput) {
  const str = String(dateInput || '').trim();

  if (str.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [dd, mm, yyyy] = str.split('/');
    return `${yyyy}-${mm}-${dd}`;
  }

  const d = new Date(str);
  if (!Number.isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  return '';
}

async function getAddressByCepHandler(req, res) {
  try {
    const cep = req.params.cep;
    const address = await getAddressByCep(cep);

    return res.status(200).json({
      cep: cep.replace(/\D/g, ''),
      ...address,
    });
  } catch (error) {
    const status = error?.status || 500;
    return res.status(status).json({ message: error.message || 'Erro ao consultar CEP' });
  }
}

async function createAppointment(req, res) {
  try {
    const {
      date,
      time,
      doctorName,
      doctorEspecialidade,
      cep,
    } = req.body || {};

    const normalizedDate = normalizeDate(date);
    const normalizedTime = String(time || '').trim();
    const normalizedCep = String(cep || '').replace(/\D/g, '');
    const resolvedDoctorName = (doctorName || doctorEspecialidade || '').toString().trim();

    if (!normalizedDate) {
      return res.status(400).json({ message: 'Data inválida' });
    }
    if (!normalizedTime) {
      return res.status(400).json({ message: 'Horário inválido' });
    }
    if (!resolvedDoctorName) {
      return res.status(400).json({ message: 'Médico/especialidade é obrigatório' });
    }
    if (!normalizedCep) {
      return res.status(400).json({ message: 'CEP é obrigatório' });
    }

    const address = await getAddressByCep(normalizedCep);

    const exists = await Appointment.findOne({
      date: normalizedDate,
      time: normalizedTime,
      estatus: 'agendada',
    });

    if (exists) {
      return res.status(400).json({ message: 'Horário indisponível' });
    }

    const weatherAlert = await getWeatherAlertText({
      cidade: address.localidade,
      estado: address.uf,
      data: normalizedDate,
    });

    const appointment = await Appointment.create({
      patient: req.user.id,
      date: normalizedDate,
      time: normalizedTime,
      doctorName: resolvedDoctorName,
      cep: normalizedCep,
      logradouro: address.logradouro,
      bairro: address.bairro,
      cidade: address.localidade,
      estado: address.uf,
      weatherAlert,
      estatus: 'agendada',
    });

    return res.status(201).json({ appointment });
  } catch (error) {
    const status = error?.status || 500;
    return res.status(status).json({ message: error.message || 'Erro ao criar agendamento' });
  }
}

async function getMyAppointments(req, res) {
  try {
    const appointments = await Appointment.find({ patient: req.user.id }).sort({
      date: 1,
      time: 1,
    });

    return res.status(200).json({ appointments });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Erro ao listar agendamentos' });
  }
}

async function getAllAppointments(req, res) {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email')
      .sort({ date: 1, time: 1 });

    return res.status(200).json({ appointments });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Erro ao listar agendamentos' });
  }
}

async function updateAppointmentStatus(req, res) {
  try {
    const { status } = req.body || {};
    const normalizedStatus = String(status || '').trim();

    const allowed = ['agendada', 'realizada', 'cancelada'];
    if (!allowed.includes(normalizedStatus)) {
      return res.status(400).json({ message: 'Status inválido' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Consulta não encontrada' });
    }

    const isOwner = appointment.patient.toString() === req.user.id;
    const isSecretary = req.user.role === 'secretary';

    if (!isOwner && !isSecretary) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Paciente só pode cancelar sua própria consulta
    if (isOwner && !isSecretary && normalizedStatus !== 'cancelada') {
      return res.status(403).json({ message: 'Paciente só pode cancelar consultas' });
    }

    appointment.estatus = normalizedStatus;
    await appointment.save();

    return res.status(200).json({ status: appointment.estatus });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Erro ao atualizar status' });
  }
}

module.exports = {
  getAddressByCepHandler,
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  updateAppointmentStatus,
};
