import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';

const { app, db } = await import('../server.js');

let server;
let baseUrl;
let token;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
  db.close();
});

test('login rejeita campos obrigatórios ausentes', async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: 'Email e senha são obrigatórios'
  });
});

test('login válido retorna token JWT', async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@escola.com', senha: 'admin123' })
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(body.token);
  assert.equal(body.usuario.email, 'admin@escola.com');
  token = body.token;
});

test('rota protegida rejeita requisição sem token', async () => {
  const response = await fetch(`${baseUrl}/api/turmas`);
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: 'Token não fornecido' });
});

test('rota protegida lista turmas com token válido', async () => {
  assert.ok(token, 'o teste de login deve fornecer um token');
  const response = await fetch(`${baseUrl}/api/turmas`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  assert.equal(response.status, 200);
  const turmas = await response.json();
  assert.ok(Array.isArray(turmas));
  assert.ok(turmas.length > 0);
  assert.ok('total_alunos' in turmas[0]);
});

test('frequência exige turma_id e data', async () => {
  const response = await fetch(`${baseUrl}/api/frequencia`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: 'turma_id e data são obrigatórios'
  });
});
