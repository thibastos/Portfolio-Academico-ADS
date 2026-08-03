const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    }
  );
}

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body || {};

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password e role são obrigatórios' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRole = role.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: normalizedRole,
    });

    const token = signToken(user);

    return res.status(201).json({
      message: 'Usuário cadastrado com sucesso',
      token,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    const statusCode = error?.name === 'ValidationError' ? 400 : 500;
    return res.status(statusCode).json({ message: error.message || 'Erro no cadastro' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'email e password são obrigatórios' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = signToken(user);

    return res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Erro no login' });
  }
}

module.exports = {
  register,
  login,
};
