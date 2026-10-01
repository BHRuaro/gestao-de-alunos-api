import { expect } from 'chai';
import dados from './data/index.js';
import { fazerLogin } from './helpers/auth.helper.js';

describe('POST /api/auth/login - autenticacao (Data-Driven Testing)', () => {
  dados.cenariosLogin.forEach((cenario) => {
    it(`deve retornar ${cenario.statusEsperado} para ${cenario.descricao}`, async () => {
      const resposta = await fazerLogin({ email: cenario.email, senha: cenario.senha });

      expect(resposta.status).to.equal(cenario.statusEsperado);

      if (cenario.esperaToken) {
        expect(resposta.body).to.have.property('token');
        expect(resposta.body.token).to.be.a('string');
        expect(resposta.body).to.have.property('usuario');
        expect(resposta.body.usuario.email).to.equal(cenario.email);
      } else {
        expect(resposta.body).to.not.have.property('token');
        expect(resposta.body).to.have.property('error');
      }
    });
  });
});
