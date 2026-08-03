const axios = require('axios');

function normalizeCep(cep) {
  return String(cep || '').replace(/\D/g, '');
}

function validateCep(cepDigits) {
  if (!cepDigits || cepDigits.length !== 8) {
    const err = new Error('CEP inválido. Informe 8 dígitos.');
    err.status = 400;
    throw err;
  }
}

async function getAddressByCep(cep) {
  const cepDigits = normalizeCep(cep);
  validateCep(cepDigits);

  const url = `https://viacep.com.br/ws/${cepDigits}/json/`;
  const { data } = await axios.get(url, { timeout: 10000 });

  const isErro = data?.erro === 'true' || data?.erro === true;
  if (isErro) {
    const err = new Error('CEP não encontrado.');
    err.status = 404;
    throw err;
  }

  return {
    logradouro: data.logradouro,
    bairro: data.bairro,
    localidade: data.localidade,
    uf: data.uf,
  };
}

module.exports = {
  getAddressByCep,
};

