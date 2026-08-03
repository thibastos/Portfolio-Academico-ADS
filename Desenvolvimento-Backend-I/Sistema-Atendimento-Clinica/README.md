# Sistema de Atendimento Inteligente para Clínicas Médicas

## 📋 Descrição do Projeto

Sistema web completo para gerenciamento de agendamentos de consultas médicas, desenvolvido como trabalho acadêmico. Implementa autenticação segura, integração com APIs externas e painel administrativo.

## ✨ Funcionalidades

### 👥 Autenticação
- Cadastro e login seguro de usuários (pacientes e secretários)
- Autenticação JWT com proteção de rotas
- Perfis de usuário diferenciados

### 📅 Agendamento
- Formulário de agendamento com validação
- Verificação de disponibilidade de horário
- Consulta automática de endereço via CEP (ViaCEP)
- Integração com API de clima (OpenWeatherMap) para alertas de chuva

### 👨‍⚕️ Painel Administrativo
- Listagem completa de agendamentos
- Filtros por status, data e busca
- Gerenciamento de status (agendada/realizada/cancelada)
- Paginação para melhor performance

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Vue.js 3** com Composition API
- **Vite** para build e desenvolvimento
- **Vue Router** para navegação
- **Pinia** para gerenciamento de estado
- **Axios** para requisições HTTP

### Backend
- **Node.js** com Express
- **MongoDB** para banco de dados
- **JWT** para autenticação
- **bcrypt** para hash de senhas

## 🚀 Como Executar

### Pré-requisitos
- Node.js (v16+)
- MongoDB
- Conta no OpenWeatherMap (para API de clima)

### Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd clinica-atendimento
   ```

2. **Backend**
   ```bash
   cd backend
   npm install
   # Configure as variáveis de ambiente em .env
   npm start
   ```

3. **Frontend**
   ```bash
   cd frontend/frontend
   npm install
   npm run dev
   ```

### Variáveis de Ambiente

**Backend (.env)**
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/clinica
JWT_SECRET=sua-chave-secreta
OPENWEATHER_API_KEY=sua-chave-openweather
```

**Frontend (.env)**
```
VITE_API_BASE_URL=http://localhost:3000
VITE_WEATHER_API_KEY=sua-chave-openweather
```

## 📁 Estrutura do Projeto

```
clinica-atendimento/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── middlewares/
│   └── package.json
└── frontend/
    └── frontend/
        ├── src/
        │   ├── components/
        │   ├── composables/
        │   ├── stores/
        │   ├── utils/
        │   └── views/
        └── package.json
```

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Tokens JWT com expiração
- Middleware de autenticação em rotas protegidas
- Validação de entrada de dados

## 🌐 APIs Externas

- **ViaCEP**: Consulta de endereço por CEP
- **OpenWeatherMap**: Previsão do tempo para alertas

## 📊 Funcionalidades por Perfil

### Paciente
- Agendar consultas
- Visualizar consultas próprias
- Cancelar consultas

### Secretário
- Todas as funcionalidades do paciente
- Painel administrativo completo
- Gerenciar todos os agendamentos

## 🚀 Deploy

### Backend
```bash
cd backend
npm install
# Configure as variáveis de ambiente em .env

# Usar PM2 para produção
npm install -g pm2
pm2 start src/server.js --name clinica-backend
```

### Frontend
```bash
cd frontend/frontend
npm install
npm run build

# Servir os arquivos da pasta dist/
# Pode usar Nginx, Apache ou serviços como Vercel/Netlify
```

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend/frontend
npm run test
```

## 📝 API Endpoints

### Autenticação
- `POST /auth/register` - Cadastro
- `POST /auth/login` - Login

### Agendamentos
- `GET /appointments/cep/:cep` - Consultar endereço por CEP (público)
- `GET /appointments` - Listar todas (somente secretários)
- `GET /appointments/my` - Minhas consultas (pacientes autenticados)
- `POST /appointments` - Criar agendamento (autenticado)
- `PATCH /appointments/:id/status` - Atualizar status (paciente: apenas cancelar; secretário: qualquer status)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é parte de um trabalho acadêmico e não possui licença específica.

## 👨‍💻 Autor

[Seu Nome] - Trabalho acadêmico para a disciplina de Desenvolvimento Backend I