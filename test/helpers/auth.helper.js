import request from 'supertest';
import app from '../../src/app.js';

const ROTA_LOGIN = '/api/auth/login';

export function fazerLogin({ email, senha } = {}) {
  return request(app).post(ROTA_LOGIN).send({ email, senha });
}

export async function loginAdmin(credenciais) {
  const resposta = await fazerLogin(credenciais);
  if (!resposta.body || !resposta.body.token) {
    throw new Error(`Falha ao autenticar o administrador (status ${resposta.status}).`);
  }
  return resposta.body.token;
}

export async function loginAluno(credenciais) {
  const resposta = await fazerLogin(credenciais);
  if (!resposta.body || !resposta.body.token) {
    throw new Error(`Falha ao autenticar o aluno (status ${resposta.status}).`);
  }
  return resposta.body.token;
}

export default { fazerLogin, loginAdmin, loginAluno };
