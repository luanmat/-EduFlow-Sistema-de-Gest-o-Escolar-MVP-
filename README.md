# EduFlow — Sistema de Gestão Escolar

MVP web para apoiar a organização escolar, o cadastro de alunos e turmas, o lançamento diário de frequência e a consulta de históricos e relatórios.

## Funcionalidades

- Autenticação de usuários com JWT e senhas armazenadas com bcryptjs.
- Cadastro, listagem e exclusão de turmas.
- Cadastro, consulta e exclusão de alunos, com vínculo à turma.
- Lançamento de frequência: presente (P), falta (F) e falta justificada (FJ).
- Histórico de frequência com filtros por turma, aluno e período e estatísticas por estudante.

## Tecnologias

- **Runtime e backend:** Node.js 22+ e Express.
- **Frontend:** HTML5, JavaScript, Tailwind CSS e Font Awesome.
- **Banco de dados:** SQLite nativo por meio de `node:sqlite`.
- **Autenticação:** JSON Web Token e bcryptjs.

## Executar localmente

Pré-requisito: Node.js 22 ou superior.

```bash
npm ci
npm start
```

Acesse http://localhost:3000.

Em um banco local vazio, o modo de desenvolvimento cria uma conta e dados fictícios para demonstração:

- E-mail: `admin@escola.com`
- Senha: `admin123`

Essas credenciais são exclusivas para desenvolvimento/testes. Não são utilizadas no modo de produção.

## Testes automatizados

```bash
npm test
```

Os testes de fumaça verificam o endpoint de saúde, a entrega do frontend, o login de demonstração e o bloqueio de uma rota protegida sem token. A execução apresenta também o resumo de cobertura do Node.js.

## Deploy no Render

O arquivo `render.yaml` contém um Blueprint para criar o serviço web:

- Build command: `npm ci`
- Start command: `npm start`
- Health check: `/healthz`
- Banco SQLite: `/var/data/escola.db`
- Disco persistente: `/var/data` (1 GB)
- Segredo JWT gerado pelo Render.

### Publicar

1. No Render, selecione **New** → **Blueprint**.
2. Conecte este repositório e selecione a branch que contém o `render.yaml`.
3. Revise a configuração e confirme a criação do serviço.
4. Informe os valores de `ADMIN_EMAIL` e `ADMIN_PASSWORD` quando solicitados. Use uma senha forte com pelo menos 12 caracteres.
5. Aguarde o deploy terminar e abra a URL pública fornecida pelo Render.

**Importante sobre persistência:** o serviço está configurado com um disco persistente, disponível em plano pago do Render. Não remova o disco nem altere `DB_PATH` para um caminho fora de `/var/data`, caso contrário o arquivo SQLite poderá ser perdido em reinicializações ou novos deploys. O disco do Render é conectado a uma única instância do serviço e não deve ser compartilhado entre várias instâncias.

### Monitoramento

O endpoint `GET /healthz` verifica se o processo consegue consultar o SQLite. Em funcionamento normal, responde HTTP 200:

```json
{ "status": "ok" }
```

Configure o Render para usar esse endpoint como health check (já definido no Blueprint). Para alertas externos de indisponibilidade, cadastre a URL pública terminada em `/healthz` em um monitor HTTP, como o UptimeRobot.

## Variáveis de ambiente

| Variável | Finalidade |
|---|---|
| `PORT` | Porta fornecida pela plataforma de hospedagem. |
| `HOST` | Interface de rede; padrão `0.0.0.0`. |
| `NODE_ENV` | Use `production` no ambiente publicado. |
| `JWT_SECRET` | Segredo JWT. Obrigatório em produção e deve ter ao menos 32 caracteres. |
| `DB_PATH` | Caminho do arquivo SQLite. No Render: `/var/data/escola.db`. |
| `ADMIN_EMAIL` | E-mail da conta administrativa criada na primeira inicialização do banco de produção. |
| `ADMIN_PASSWORD` | Senha forte para a conta administrativa inicial (mínimo de 12 caracteres). |
| `ADMIN_NAME` | Nome da conta administrativa (opcional). |
| `CORS_ORIGINS` | Lista separada por vírgulas de origens autorizadas, somente se a API for chamada de outro domínio. |

O banco local `*.db` e arquivos `.env` são ignorados pelo Git. Em produção, o sistema não cria alunos ou turmas de demonstração.

## Estrutura

```text
├── .github/workflows/deploy-readiness.yml
├── public/
│   └── index.html
├── tests/
│   └── deploy-smoke.test.js
├── .gitignore
├── package.json
├── package-lock.json
├── render.yaml
├── server.js
└── README.md
```
