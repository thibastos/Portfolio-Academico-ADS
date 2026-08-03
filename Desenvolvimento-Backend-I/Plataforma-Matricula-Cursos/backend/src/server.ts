import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const cursos = [
  { id: 1, nome: 'Desenvolvimento Frontend' },
  { id: 2, nome: 'Desenvolvimento Backend' },
  { id: 3, nome: 'Banco de Dados' },
  { id: 4, nome: 'UX/UI Design' },
  { id: 5, nome: 'JavaScript para Iniciantes' }
];

interface Matricula {
  nomeCompleto: string;
  email: string;
  curso: string;
}

const matriculas: Matricula[] = [];

app.get('/', (req: Request, res: Response) => {
  res.send('API funcionando!');
});

app.get('/cursos', (req: Request, res: Response) => {
  res.status(200).json(cursos);
});

app.post('/matricula', (req: Request, res: Response) => {
  const { nomeCompleto, email, curso } = req.body as Matricula;

  if (!nomeCompleto || !email || !curso) {
    return res.status(400).json({
      mensagem: 'Todos os campos são obrigatórios.'
    });
  }

  const emailValido = /\S+@\S+\.\S+/;
  if (!emailValido.test(email)) {
    return res.status(400).json({
      mensagem: 'E-mail inválido.'
    });
  }

  const cursoExiste = cursos.some((c) => c.nome === curso);
  if (!cursoExiste) {
    return res.status(400).json({
      mensagem: 'Curso selecionado é inválido.'
    });
  }

  const novaMatricula: Matricula = {
    nomeCompleto,
    email,
    curso
  };

  matriculas.push(novaMatricula);

  return res.status(201).json({
    mensagem: 'Matrícula realizada com sucesso!',
    dados: novaMatricula
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});