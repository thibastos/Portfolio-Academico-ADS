-- Modelagem de banco de dados para uma universidade
-- Compatível com SQLite 3 (chaves estrangeiras habilitadas abaixo).

PRAGMA foreign_keys = ON;

CREATE TABLE Curso (
    id_curso INTEGER PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Professor (
    id_professor INTEGER PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE Aluno (
    id_aluno INTEGER PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    matricula VARCHAR(20) NOT NULL UNIQUE,
    id_curso INTEGER NOT NULL,
    CONSTRAINT fk_aluno_curso
        FOREIGN KEY (id_curso)
        REFERENCES Curso (id_curso)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE Disciplina (
    id_disciplina INTEGER PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    carga_horaria INTEGER NOT NULL,
    id_curso INTEGER NOT NULL,
    CONSTRAINT uq_disciplina_curso UNIQUE (nome, id_curso),
    CONSTRAINT ck_disciplina_carga_horaria CHECK (carga_horaria > 0),
    CONSTRAINT fk_disciplina_curso
        FOREIGN KEY (id_curso)
        REFERENCES Curso (id_curso)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE Turma (
    id_turma INTEGER PRIMARY KEY,
    semestre VARCHAR(15) NOT NULL,
    id_disciplina INTEGER NOT NULL,
    id_professor INTEGER NOT NULL,
    CONSTRAINT uq_turma_oferta
        UNIQUE (semestre, id_disciplina, id_professor),
    CONSTRAINT fk_turma_disciplina
        FOREIGN KEY (id_disciplina)
        REFERENCES Disciplina (id_disciplina)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_turma_professor
        FOREIGN KEY (id_professor)
        REFERENCES Professor (id_professor)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE Matricula (
    id_matricula INTEGER PRIMARY KEY,
    id_aluno INTEGER NOT NULL,
    id_turma INTEGER NOT NULL,
    nota DECIMAL(4,2),
    frequencia DECIMAL(5,2),
    CONSTRAINT uq_matricula_aluno_turma UNIQUE (id_aluno, id_turma),
    CONSTRAINT ck_matricula_nota
        CHECK (nota IS NULL OR nota BETWEEN 0 AND 10),
    CONSTRAINT ck_matricula_frequencia
        CHECK (frequencia IS NULL OR frequencia BETWEEN 0 AND 100),
    CONSTRAINT fk_matricula_aluno
        FOREIGN KEY (id_aluno)
        REFERENCES Aluno (id_aluno)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_matricula_turma
        FOREIGN KEY (id_turma)
        REFERENCES Turma (id_turma)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
