const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    // Referência ao usuário que agendou (paciente)
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Data e hora da consulta
    date: { type: String, required: true },
    time: { type: String, required: true },

    doctorName: { type: String, required: true, trim: true },

    cep: { type: String, required: true, trim: true },
    logradouro: { type: String, required: true, trim: true },
    bairro: { type: String, required: true, trim: true },
    cidade: { type: String, required: true, trim: true },
    estado: { type: String, required: true, trim: true },

    // Alerta/mensagem para previsão de chuva no dia da consulta
    weatherAlert: { type: String, default: '' },

    estatus: {
      type: String,
      enum: ['agendada', 'realizada', 'cancelada'],
      default: 'agendada',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);

