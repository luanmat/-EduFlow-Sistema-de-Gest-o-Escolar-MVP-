import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';

const { app, db } = await import('../server.js');

let server;
let baseUrl;
let token;
let turmaId;
let alunoId;

async function api(path, options = {}) {
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.auth === false ? {} : (token ? { Authorization: `Bearer ${token}` } : {})),
    ...(options.headers || {})
  };

  return fetch(`${baseUrl}${path}`, { ...options, headers });
}

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@escola.com', senha: 'admin123' })
  });
  assert.equal(login.status, 200);
  token = (await login.json()).token;
  assert.ok(token);
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
  db.close();
});

test('integração: a página inicial é servida com HTTP 200', async () => {
  const response = await api('/');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
});

test('integração: login exige e valida credenciais', async () => {
  const missing = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  assert.equal(missing.status, 400);

  const invalid = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'naoexiste@escola.com', senha: 'senha-incorreta' })
  });
  assert.equal(invalid.status, 401);

  const valid = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@escola.com', senha: 'admin123' })
  });
  assert.equal(valid.status, 200);
  const body = await valid.json();
  assert.ok(body.token);
  assert.equal(body.usuario.email, 'admin@escola.com');
  token = body.token;
});

test('integração: /api/auth/me bloqueia acesso sem token e aceita token válido', async () => {
  const missing = await fetch(`${baseUrl}/api/auth/me`);
  assert.equal(missing.status, 401);

  const invalid = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: 'Bearer token-invalido' }
  });
  assert.equal(invalid.status, 401);

  const valid = await api('/api/auth/me');
  assert.equal(valid.status, 200);
  assert.equal((await valid.json()).email, 'admin@escola.com');
});

test('integração: lista turmas e rejeita cadastro incompleto', async () => {
  const list = await api('/api/turmas');
  assert.equal(list.status, 200);
  assert.ok(Array.isArray(await list.json()));

  const invalid = await api('/api/turmas', {
    method: 'POST',
    body: JSON.stringify({ nome: 'Turma sem turno' })
  });
  assert.equal(invalid.status, 400);

  const created = await api('/api/turmas', {
    method: 'POST',
    body: JSON.stringify({
      nome: 'Turma de Teste Automatizado',
      ano_letivo: 2026,
      turno: 'Matutino',
      sala: 'Laboratório'
    })
  });
  assert.equal(created.status, 201);
  turmaId = Number((await created.json()).id);
  assert.ok(turmaId > 0);
});

test('integração: cadastra e consulta alunos, incluindo matrícula duplicada', async () => {
  const missing = await api('/api/alunos', {
    method: 'POST',
    body: JSON.stringify({ nome: 'Aluno sem matrícula' })
  });
  assert.equal(missing.status, 400);

  const created = await api('/api/alunos', {
    method: 'POST',
    body: JSON.stringify({
      nome: 'Aluno de Teste Automatizado',
      matricula: 'MAT-AUTOMATION-001',
      email_responsavel: 'teste.responsavel@example.com',
      telefone_responsavel: '000000000',
      turma_id: turmaId
    })
  });
  assert.equal(created.status, 201);
  alunoId = Number((await created.json()).id);
  assert.ok(alunoId > 0);

  const duplicate = await api('/api/alunos', {
    method: 'POST',
    body: JSON.stringify({
      nome: 'Aluno Duplicado',
      matricula: 'MAT-AUTOMATION-001',
      turma_id: turmaId
    })
  });
  assert.equal(duplicate.status, 400);

  const filtered = await api(`/api/alunos?turma_id=${turmaId}`);
  assert.equal(filtered.status, 200);
  const alunos = await filtered.json();
  assert.ok(alunos.some((aluno) => Number(aluno.id) === alunoId));
});

test('integração: consulta e registra frequência da turma', async () => {
  const missing = await api('/api/frequencia');
  assert.equal(missing.status, 400);

  const date = '2026-11-12';
  const before = await api(`/api/frequencia?turma_id=${turmaId}&data=${date}`);
  assert.equal(before.status, 200);
  const initial = await before.json();
  assert.ok(initial.some((item) => Number(item.aluno_id) === alunoId && item.status === 'P'));

  const invalid = await api('/api/frequencia', {
    method: 'POST',
    body: JSON.stringify({ turma_id: turmaId, data: date, chamada: 'inválida' })
  });
  assert.equal(invalid.status, 400);

  const saved = await api('/api/frequencia', {
    method: 'POST',
    body: JSON.stringify({
      turma_id: turmaId,
      data: date,
      chamada: [{ aluno_id: alunoId, status: 'F', observacao: 'Registro de teste automatizado' }]
    })
  });
  assert.equal(saved.status, 200);
  assert.equal((await saved.json()).total, 1);

  const afterSave = await api(`/api/frequencia?turma_id=${turmaId}&data=${date}`);
  const records = await afterSave.json();
  assert.ok(records.some((item) => Number(item.aluno_id) === alunoId && item.status === 'F'));
});

test('integração: histórico retorna registros e estatísticas com filtros', async () => {
  const response = await api(
    `/api/historico?turma_id=${turmaId}&aluno_id=${alunoId}&data_inicio=2026-11-12&data_fim=2026-11-12`
  );
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.ok(Array.isArray(result.registros));
  assert.ok(Array.isArray(result.estatisticas));
  assert.ok(result.registros.some((item) => Number(item.id) > 0 && item.status === 'F'));
  assert.ok(result.estatisticas.some((item) => Number(item.id) === alunoId));
});

test('integração: remove aluno e turma criados durante os testes', async () => {
  const deleteStudent = await api(`/api/alunos/${alunoId}`, { method: 'DELETE' });
  assert.equal(deleteStudent.status, 200);
  assert.deepEqual(await deleteStudent.json(), { success: true });

  const deleteClass = await api(`/api/turmas/${turmaId}`, { method: 'DELETE' });
  assert.equal(deleteClass.status, 200);
  assert.deepEqual(await deleteClass.json(), { success: true });
});
