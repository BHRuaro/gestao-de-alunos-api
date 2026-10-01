import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import dados from './data/index.js';
import { loginAdmin, loginAluno } from './helpers/auth.helper.js';

describe('Fluxo E2E - do login de admin ao registro de entrega de trabalho', function () {
  this.timeout(15000);

  const execucao = Date.now();
  const novoAluno = {
    nome: dados.novoAluno.nome,
    email: dados.novoAluno.email.replace('@', `+${execucao}@`),
    matricula: `${dados.novoAluno.matricula}-${execucao}`,
    senha: dados.novoAluno.senha,
  };

  const context = {
    adminToken: null,
    alunoToken: null,
    alunoId: null,
  };

  it('1) o administrador faz login e recebe um token (Helper)', async () => {
    context.adminToken = await loginAdmin(dados.admin);

    expect(context.adminToken).to.be.a('string');
    expect(context.adminToken.length).to.be.greaterThan(0);
  });

  it('2) o administrador cadastra um novo aluno', async () => {
    const resposta = await request(app)
      .post('/api/admin/alunos')
      .set('Authorization', `Bearer ${context.adminToken}`)
      .send(novoAluno);

    expect(resposta.status).to.equal(201);
    expect(resposta.body).to.include({
      nome: novoAluno.nome,
      email: novoAluno.email,
      matricula: novoAluno.matricula,
      role: 'aluno',
    });
    expect(resposta.body).to.not.have.property('senha');
    expect(resposta.body).to.have.property('id');

    context.alunoId = resposta.body.id;
  });

  it('3) o administrador matricula o aluno na disciplina (pre-condicao da entrega)', async () => {
    const resposta = await request(app)
      .post(`/api/admin/disciplinas/${dados.disciplina.id}/matriculas`)
      .set('Authorization', `Bearer ${context.adminToken}`)
      .send({ alunoId: context.alunoId });

    expect(resposta.status).to.equal(201);
    expect(resposta.body).to.include({
      alunoId: context.alunoId,
      disciplinaId: dados.disciplina.id,
    });
  });

  it('4) o aluno recem-cadastrado faz login e recebe um token (Helper)', async () => {
    context.alunoToken = await loginAluno({
      email: novoAluno.email,
      senha: novoAluno.senha,
    });

    expect(context.alunoToken).to.be.a('string');
    expect(context.alunoToken.length).to.be.greaterThan(0);
  });

  it('5) o aluno registra a entrega de um trabalho', async () => {
    const resposta = await request(app)
      .post(`/api/alunos/${context.alunoId}/trabalhos`)
      .set('Authorization', `Bearer ${context.alunoToken}`)
      .send({
        disciplinaId: dados.disciplina.id,
        titulo: dados.trabalho.titulo,
        descricao: dados.trabalho.descricao,
      });

    expect(resposta.status).to.equal(201);
    expect(resposta.body).to.include({
      alunoId: context.alunoId,
      disciplinaId: dados.disciplina.id,
      titulo: dados.trabalho.titulo,
      descricao: dados.trabalho.descricao,
      status: 'entregue',
    });
    expect(resposta.body).to.have.property('id');
    expect(resposta.body).to.have.property('dataEntrega');
  });
});
