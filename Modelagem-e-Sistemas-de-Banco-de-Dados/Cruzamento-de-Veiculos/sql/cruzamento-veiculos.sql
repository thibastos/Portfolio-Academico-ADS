-- Modelagem e Sistemas de Banco de Dados - AVA II
-- Cruzamento de veiculos de uma reguladora de transito
-- Script compativel com SQLite 3.

PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS veiculos_orgao;
DROP TABLE IF EXISTS veiculos_gerais;

CREATE TABLE veiculos_gerais (
    placa TEXT PRIMARY KEY,
    modelo TEXT NOT NULL,
    marca TEXT NOT NULL,
    ano INTEGER NOT NULL CHECK (ano BETWEEN 1900 AND 2100),
    cpf_proprietario TEXT NOT NULL
);

CREATE TABLE veiculos_orgao (
    placa TEXT PRIMARY KEY,
    departamento TEXT NOT NULL,
    responsavel TEXT NOT NULL
);

-- Dados ficticios utilizados para demonstracao.
INSERT INTO veiculos_gerais (placa, modelo, marca, ano, cpf_proprietario) VALUES
    ('ABC-1234', 'Gol', 'Volkswagen', 2018, '000.000.000-01'),
    ('XYZ-9876', 'Onix', 'Chevrolet', 2020, '000.000.000-02'),
    ('DET-0001', 'Ranger', 'Ford', 2021, '000.000.000-03');

INSERT INTO veiculos_orgao (placa, departamento, responsavel) VALUES
    ('DET-0001', 'Fiscalizacao', 'Responsavel A'),
    ('GOV-5555', 'Administrativo', 'Responsavel B');

-- Equivalente SQL da juncao interna pela placa.
SELECT
    vg.placa,
    vg.modelo,
    vg.marca,
    vg.ano,
    vg.cpf_proprietario,
    vo.departamento,
    vo.responsavel
FROM veiculos_gerais AS vg
INNER JOIN veiculos_orgao AS vo
    ON vg.placa = vo.placa
ORDER BY vg.placa;
