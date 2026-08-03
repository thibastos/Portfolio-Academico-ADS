<template>
  <div class="container">
    <h1>Matrícula em Cursos On-line</h1>
    <p class="descricao">
      Preencha seus dados para realizar a matrícula em um dos cursos disponíveis.
    </p>

    <form @submit.prevent="enviarFormulario" class="formulario">
      <div class="campo">
        <label for="nomeCompleto">Nome completo</label>
        <input
          id="nomeCompleto"
          v-model="nomeCompleto"
          type="text"
          placeholder="Digite seu nome completo"
        />
      </div>

      <div class="campo">
        <label for="email">E-mail</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="Digite seu e-mail"
        />
      </div>

      <div class="campo">
        <label for="curso">Curso</label>

        <select id="curso" v-model="curso">
          <option value="">Selecione um curso</option>
          <option v-for="item in cursos" :key="item.id" :value="item.nome">
            {{ item.nome }}
          </option>
        </select>

      </div>

      <button type="submit" :disabled="carregando">
        {{ carregando ? 'Enviando...' : 'Realizar matrícula' }}
      </button>
        <p v-if="mensagem" :class="tipoMensagem">{{ mensagem }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Curso {
  id: number;
  nome: string;
}

const nomeCompleto = ref('');
const email = ref('');
const curso = ref('');
const cursos = ref<Curso[]>([]);
const mensagem = ref('');
const tipoMensagem = ref('');
const carregando = ref(false);

onMounted(async () => {
  await carregarCursos();
});

async function carregarCursos() {
  const resposta = await fetch('http://localhost:3000/cursos');
  const dados = await resposta.json();
  cursos.value = dados;
}

async function enviarFormulario() {
    carregando.value = true;
    mensagem.value = '';
    tipoMensagem.value = '';

    try {
        const resposta = await fetch('http://localhost:3000/matricula', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nomeCompleto: nomeCompleto.value,
                email: email.value,
                curso: curso.value
            })
        });

        const dados = await resposta.json();
        mensagem.value = dados.mensagem;

        if (resposta.ok) {
            tipoMensagem.value = 'sucesso';
            nomeCompleto.value = '';
            email.value = '';
            curso.value = '';
        } else {
            tipoMensagem.value = 'erro';
        }
    } catch (error) {
        mensagem.value = 'Erro ao conectar com o servidor.';
        tipoMensagem.value = 'erro';
    } finally {
        carregando.value = false;
    }
}

function validarFormulario () {
    if (!validarFormulario() ){
        return;
    }
    if (!nomeCompleto.value.trim()) {
        mensagem.value = 'Informe o nome completo.';
        tipoMensagem.value = 'erro';
    return false;
    }

    if (!email.value.trim()) {
        mensagem.value = 'Informe o e-mail.';
        tipoMensagem.value = 'erro';
        return false;
    }
    const emailValido = /\S+@\S+\.\S+/;
    if (!emailValido.test(email.value)) {
        mensagem.value = 'Informe um e-mail válido.';
        tipoMensagem.value = 'erro';
        return false;
    }
    if (!curso.value) {
        mensagem.value = 'Selecione um curso.';
        tipoMensagem.value = 'erro';
        return false;
    }
}

</script>

<style scoped>
.container {
  max-width: 500px;
  margin: 40px auto;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  background-color: #ffffff;
  font-family: Arial, sans-serif;
}

h1 {
  margin-bottom: 8px;
  text-align: center;
}

.descricao {
  text-align: center;
  margin-bottom: 24px;
  color: #555;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.campo {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 6px;
  font-weight: bold;
}

input,
select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
}

button {
  padding: 12px;
  border: none;
  border-radius: 8px;
  background-color: #1f6feb;
  color: white;
  font-size: 16px;
  cursor: pointer;
}

button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.mensagem {
    margin-top: 8px;
    font-weight: bold;
    text-align: center;
}

.sucesso {
    color: green;
}
.erro {
    color: red;
}
</style>