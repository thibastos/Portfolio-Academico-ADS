# Plataforma de Matrícula em Cursos On-line

Aplicação web desenvolvida durante a disciplina de
**Desenvolvimento Backend I**, no curso de
**Análise e Desenvolvimento de Sistemas**.

O projeto simula o processo de matrícula de alunos em cursos on-line,
integrando uma interface desenvolvida em Vue.js com uma API criada
utilizando Node.js, Express e TypeScript.

## Funcionalidades

- Carregamento da lista de cursos por meio da API;
- formulário com nome completo, e-mail e curso;
- envio dos dados de matrícula para o servidor;
- validação dos dados recebidos no backend;
- mensagens de sucesso e erro na interface;
- armazenamento temporário das matrículas em memória.

## Tecnologias utilizadas

### Frontend

- Vue.js 3;
- TypeScript;
- Vite;
- HTML e CSS;
- Fetch API.

### Backend

- Node.js;
- Express;
- TypeScript;
- CORS;
- API REST.

## Arquitetura

A aplicação está dividida em duas partes:

```text
Frontend em Vue.js
        │
        │ Requisições HTTP
        ▼
API com Node.js e Express
        │
        ▼
Armazenamento em memória