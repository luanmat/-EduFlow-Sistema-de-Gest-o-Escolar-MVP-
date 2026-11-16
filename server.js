import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { mkdirSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || (isProduction ? null : 'escola_secret_key_super_segura_2026');

if (!JWT_SECRET || (isProduction && JWT_SECRET.length < 32)) {
  throw new Error('Configure JWT_SECRET com pelo menos 32 caracteres no ambiente de produção.');
}

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (allowedOrigins.length > 0) {
  app.use(cors({ origin: allowedOrigins }));
}

app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));

// A interface é servida a partir de public/.
const publicDirectory = path.join(__dirname, 'public');
app.use(express.static(publicDirectory));

// Permite armazenar o SQLite em um disco persistente (ex.: /var/data/escola.db).
// Vercel functions have a read-only filesystem except for temporary /tmp storage.
// Use /tmp only for demonstrations; it is not persistent between function instances.
const dbPath = process.env.DB_PATH || (process.env.VERCEL ? '/tmp/escola.db' : path.join(__dirname, 'escola.db'));
if (dbPath !== ':memory:') {
  mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true });
}
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON;');

// Health check para o Render e serviços externos de monitoramento.
app.get('/healthz', (req, res) => {
  try {
    db.prepare('SELECT 1').get();
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(503).json({ status: 'unavailable' });
  }
});

// Criação das tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    perfil TEXT DEFAULT 'Professor'
  );

  CREATE TABLE IF NOT EXISTS turmas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    ano_letivo INTEGER NOT NULL,
    turno TEXT NOT NULL,
    sala TEXT
  );

  CREATE TABLE IF NOT EXISTS alunos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    matricula TEXT UNIQUE NOT NULL,
    email_responsavel TEXT,
    telefone_responsavel TEXT,
    turma_id INTEGER NOT NULL,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS frequencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER NOT NULL,
    turma_id INTEGER NOT NULL,
    data TEXT NOT NULL,
    status TEXT CHECK(status IN ('P', 'F', 'FJ')) NOT NULL,
    observacao TEXT,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
    UNIQUE(aluno_id, data)
  );
`);

// Inicializa a conta administrativa apenas quando o banco está vazio.
// Em produção, as credenciais iniciais vêm das variáveis ADMIN_EMAIL e ADMIN_PASSWORD.
const userCount = db.prepare('SELECT count(*) as count FROM usuarios').get().count;
if (userCount === 0) {
  const adminEmail = isProduction ? process.env.ADMIN_EMAIL : (process.env.ADMIN_EMAIL || 'admin@escola.com');
  const adminPassword = isProduction ? process.env.ADMIN_PASSWORD : (process.env.ADMIN_PASSWORD || 'admin123');

  if (!adminEmail || !adminPassword || (isProduction && adminPassword.length < 12)) {
    throw new Error('Para a primeira inicialização em produção, configure ADMIN_EMAIL e ADMIN_PASSWORD (mínimo de 12 caracteres).');
  }

  const hash = bcrypt.hashSync(adminPassword, 12);
  db.prepare(`
    INSERT INTO usuarios (nome, email, senha, perfil)
    VALUES (?, ?, ?, ?)
  `).run(process.env.ADMIN_NAME || 'Coordenador Pedagógico', adminEmail, hash, 'Administrador');

  // Dados fictícios são criados somente em desenvolvimento/testes.
  if (!isProduction) {
    const turma1 = db.prepare(`
      INSERT INTO turmas (nome, ano_letivo, turno, sala)
      VALUES (?, ?, ?, ?)
    `).run('9º Ano A - Fundamental', 2026, 'Matutino', 'Sala 102');

    const turmaId = turma1.lastInsertRowid;
    const insertAluno = db.prepare(`
      INSERT INTO alunos (nome, matricula, email_responsavel, telefone_responsavel, turma_id)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertAluno.run('Arthur Silva Santos', 'MAT2026001', 'responsavel.arthur@email.com', '(11) 98765-4321', turmaId);
    insertAluno.run('Beatriz Lima Oliveira', 'MAT2026002', 'responsavel.beatriz@email.com', '(11) 97654-3210', turmaId);
    insertAluno.run('Caio Mendes Ferreira', 'MAT2026003', 'responsavel.caio@email.com', '(11) 96543-2109', turmaId);
    insertAluno.run('Daniela Souza Costa', 'MAT2026004', 'responsavel.daniela@email.com', '(11) 95432-1098', turmaId);

    const insertFreq = db.prepare(`
      INSERT INTO frequencias (aluno_id, turma_id, data, status, observacao)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertFreq.run(1, turmaId, '2026-11-09', 'P', '');
    insertFreq.run(2, turmaId, '2026-11-09', 'P', '');
    insertFreq.run(3, turmaId, '2026-11-09', 'F', 'Sem aviso prévio');
    insertFreq.run(4, turmaId, '2026-11-09', 'P', '');
    insertFreq.run(1, turmaId, '2026-11-10', 'P', '');
    insertFreq.run(2, turmaId, '2026-11-10', 'FJ', 'Atestado médico');
    insertFreq.run(3, turmaId, '2026-11-10', 'P', '');
    insertFreq.run(4, turmaId, '2026-11-10', 'P', '');

    console.log('Dados fictícios de demonstração gerados.');
  }
}

// Middleware de Autenticação
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Formato de token inválido' });
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Token inválido ou expirado' });
    req.usuario = decoded;
    next();
  });
}

// --- ROTAS DE AUTENTICAÇÃO ---
app.post('/api/auth/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
  if (!usuario || !bcrypt.compareSync(senha, usuario.senha)) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil }
  });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json(req.usuario);
});

// --- ROTAS DE TURMAS ---
app.get('/api/turmas', authMiddleware, (req, res) => {
  const turmas = db.prepare(`
    SELECT t.*, COUNT(a.id) as total_alunos
    FROM turmas t
    LEFT JOIN alunos a ON a.turma_id = t.id
    GROUP BY t.id
    ORDER BY t.nome ASC
  `).all();
  res.json(turmas);
});

app.post('/api/turmas', authMiddleware, (req, res) => {
  const { nome, ano_letivo, turno, sala } = req.body;
  if (!nome || !ano_letivo || !turno) {
    return res.status(400).json({ error: 'Campos nome, ano_letivo e turno são obrigatórios' });
  }

  const query = db.prepare('INSERT INTO turmas (nome, ano_letivo, turno, sala) VALUES (?, ?, ?, ?)');
  const info = query.run(nome, Number(ano_letivo), turno, sala || '');
  res.status(201).json({ id: info.lastInsertRowid, nome, ano_letivo, turno, sala });
});

app.delete('/api/turmas/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM turmas WHERE id = ?').run(Number(req.params.id));
  res.json({ success: true });
});

// --- ROTAS DE ALUNOS ---
app.get('/api/alunos', authMiddleware, (req, res) => {
  const { turma_id } = req.query;
  let queryText = `
    SELECT a.*, t.nome as turma_nome
    FROM alunos a
    JOIN turmas t ON a.turma_id = t.id
  `;
  const params = [];

  if (turma_id) {
    queryText += ' WHERE a.turma_id = ?';
    params.push(Number(turma_id));
  }

  queryText += ' ORDER BY a.nome ASC';
  const alunos = db.prepare(queryText).all(...params);
  res.json(alunos);
});

app.post('/api/alunos', authMiddleware, (req, res) => {
  const { nome, matricula, email_responsavel, telefone_responsavel, turma_id } = req.body;
  if (!nome || !matricula || !turma_id) {
    return res.status(400).json({ error: 'Nome, matrícula e turma são obrigatórios' });
  }

  try {
    const query = db.prepare(`
      INSERT INTO alunos (nome, matricula, email_responsavel, telefone_responsavel, turma_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = query.run(nome, matricula, email_responsavel || '', telefone_responsavel || '', Number(turma_id));
    res.status(201).json({ id: info.lastInsertRowid, nome, matricula, turma_id });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Matrícula já cadastrada no sistema' });
    }
    console.error('Erro ao cadastrar aluno:', err);
    res.status(500).json({ error: 'Não foi possível cadastrar o aluno.' });
  }
});

app.delete('/api/alunos/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM alunos WHERE id = ?').run(Number(req.params.id));
  res.json({ success: true });
});

// --- ROTAS DE FREQUÊNCIA ---
// Obter lista da chamada do dia para uma turma
app.get('/api/frequencia', authMiddleware, (req, res) => {
  const { turma_id, data } = req.query;
  if (!turma_id || !data) {
    return res.status(400).json({ error: 'turma_id e data são obrigatórios' });
  }

  const registros = db.prepare(`
    SELECT a.id as aluno_id, a.nome as aluno_nome, a.matricula,
           COALESCE(f.status, 'P') as status,
           COALESCE(f.observacao, '') as observacao
    FROM alunos a
    LEFT JOIN frequencias f ON f.aluno_id = a.id AND f.data = ?
    WHERE a.turma_id = ?
    ORDER BY a.nome ASC
  `).all(data, Number(turma_id));

  res.json(registros);
});

// Salvar a chamada do dia (em lote)
app.post('/api/frequencia', authMiddleware, (req, res) => {
  const { turma_id, data, chamada } = req.body;
  if (!turma_id || !data || !Array.isArray(chamada)) {
    return res.status(400).json({ error: 'Dados incompletos para registro da chamada' });
  }

  const upsert = db.prepare(`
    INSERT INTO frequencias (aluno_id, turma_id, data, status, observacao)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(aluno_id, data) DO UPDATE SET
      status = excluded.status,
      observacao = excluded.observacao
  `);

  for (const item of chamada) {
    upsert.run(Number(item.aluno_id), Number(turma_id), data, item.status, item.observacao || '');
  }

  res.json({ message: 'Chamada registrada com sucesso!', total: chamada.length });
});

// --- ROTAS DE HISTÓRICO & RELATÓRIOS ---
app.get('/api/historico', authMiddleware, (req, res) => {
  const { turma_id, data_inicio, data_fim, aluno_id } = req.query;

  let query = `
    SELECT f.id, f.data, f.status, f.observacao,
           a.nome as aluno_nome, a.matricula,
           t.nome as turma_nome
    FROM frequencias f
    JOIN alunos a ON f.aluno_id = a.id
    JOIN turmas t ON f.turma_id = t.id
    WHERE 1=1
  `;
  const params = [];

  if (turma_id) {
    query += ' AND f.turma_id = ?';
    params.push(Number(turma_id));
  }
  if (aluno_id) {
    query += ' AND f.aluno_id = ?';
    params.push(Number(aluno_id));
  }
  if (data_inicio) {
    query += ' AND f.data >= ?';
    params.push(data_inicio);
  }
  if (data_fim) {
    query += ' AND f.data <= ?';
    params.push(data_fim);
  }

  query += ' ORDER BY f.data DESC, a.nome ASC';
  const registros = db.prepare(query).all(...params);

  // Resumo de presença por aluno na turma
  let estatisticas = [];
  if (turma_id) {
    estatisticas = db.prepare(`
      SELECT a.id, a.nome, a.matricula,
        COUNT(f.id) as total_aulas,
        SUM(CASE WHEN f.status = 'P' THEN 1 ELSE 0 END) as presencas,
        SUM(CASE WHEN f.status = 'F' THEN 1 ELSE 0 END) as faltas,
        SUM(CASE WHEN f.status = 'FJ' THEN 1 ELSE 0 END) as faltas_justificadas,
        ROUND((CAST(SUM(CASE WHEN f.status = 'P' THEN 1 ELSE 0 END) AS REAL) / MAX(COUNT(f.id), 1)) * 100, 1) as percentual_presenca
      FROM alunos a
      LEFT JOIN frequencias f ON f.aluno_id = a.id
      WHERE a.turma_id = ?
      GROUP BY a.id
      ORDER BY a.nome ASC
    `).all(Number(turma_id));
  }

  res.json({ registros, estatisticas });
});

export { app, db };
export default app;

const isMainModule = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule && !process.env.VERCEL) {
  app.listen(PORT, HOST, () => {
    console.log(`EduFlow iniciado em ${HOST}:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/healthz`);
    console.log(`Banco SQLite: ${dbPath}`);
  });
}
