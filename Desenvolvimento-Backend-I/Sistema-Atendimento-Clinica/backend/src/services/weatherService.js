const axios = require('axios');

function normalizeDateKey(dateInput) {
  const str = String(dateInput || '').trim();

  // Caso já venha em formato ISO/YYYY-MM-DD...
  if (str.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10); // YYYY-MM-DD
  }

  // Caso venha como dd/mm/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [dd, mm, yyyy] = str.split('/');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Fallback: tenta converter usando Date
  const d = new Date(str);
  if (!Number.isNaN(d.getTime())) {
    // Mantém comparacao por YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  const err = new Error('Data inválida para consultar previsão de clima.');
  err.status = 400;
  throw err;
}

function buildQuery(cidade, estado) {
  const city = String(cidade || '').trim();
  const uf = String(estado || '').trim();

  if (uf) return `${city},${uf},BR`;
  // fallback se não vier estado
  return `${city},BR`;
}

async function getWeatherAlertText({ cidade, estado, data }) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    const err = new Error('OPENWEATHER_API_KEY não configurado.');
    err.status = 500;
    throw err;
  }

  const dateKey = normalizeDateKey(data);
  const q = buildQuery(cidade, estado);

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(q)}&appid=${apiKey}`;
  const response = await axios.get(url, { timeout: 15000 });

  const items = response?.data?.list || [];
  const dayItems = items.filter((it) => String(it?.dt_txt || '').slice(0, 10) === dateKey);

  if (dayItems.length === 0) {
    // Se não achar itens daquele dia, considera "sem previsão" para não bloquear o agendamento.
    return 'Sem previsão de chuva.';
  }

  const rainRegex = /(rain|drizzle|thunderstorm)/i;

  for (const it of dayItems) {
    const weatherTexts = (it?.weather || [])
      .map((w) => `${w?.main || ''} ${w?.description || ''}`.trim())
      .join(' ');

    if (rainRegex.test(weatherTexts)) {
      return 'Há previsão de chuva!';
    }
  }

  return 'Sem previsão de chuva.';
}

module.exports = {
  getWeatherAlertText,
};

