<template>
    <div>
        <h1>Sistema da Clínica</h1>
        <p>Frontend em Construção</p>

        <nav>
            <h3>Navegação:</h3>
            <ul>
                <li><router-link to="/">🏠 Início</router-link></li>
                <li><router-link to="/login">🔐 Login</router-link></li>
                <li><router-link to="/register">📝 Cadastro</router-link></li>
                <li><router-link to="/schedule">📅 Agendar Consulta</router-link></li>
                <li><router-link to="/my-appointments">📋 Minhas Consultas</router-link></li>
                <li><router-link to="/admin">⚙️ Painel Administrativo</router-link></li>
            </ul>
        </nav>
    </div>
</template>

<script setup>
</script>

<style scoped>
nav {
    margin-top: 20px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
}

nav h3 {
    margin-top: 0;
    color: #333;
}

nav ul {
    list-style: none;
    padding: 0;
}

nav li {
    margin: 10px 0;
}

nav a {
    text-decoration: none;
    color: #007bff;
    font-weight: 500;
    padding: 8px 12px;
    border-radius: 4px;
    transition: background-color 0.3s;
}

nav a:hover {
    background-color: #e9ecef;
    color: #0056b3;
}

nav a.router-link-active {
    background-color: #007bff;
    color: white;
}
</style>