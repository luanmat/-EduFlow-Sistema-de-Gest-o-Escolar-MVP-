# EduFlow — Sistema de Gestão Escolar

O EduFlow é um MVP web para apoiar a rotina de gestão escolar. A aplicação reúne cadastro de alunos e turmas, lançamento de frequência e consulta de históricos e relatórios.

> **Situação da publicação:** o repositório contém a configuração para deploy no Render, mas a aplicação ainda precisa ser implantada no painel do Render para receber uma URL pública de produção. Não use o endereço do GitHub como endereço de produção.

## Funcionalidades

- **Autenticação:** login com JWT e senhas armazenadas com bcryptjs.
- **Gestão de turmas:** cadastro, listagem e exclusão de turmas.
- **Gestão de alunos:** cadastro, consulta e exclusão de alunos, com vínculo à turma e dados de contato dos responsáveis.
- **Frequência:** lançamento de presença (P), falta (F) e falta justificada (FJ), com observações.
- **Histórico e relatórios:** consulta por turma, aluno e período, com indicadores de frequência.

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Runtime e backend | Node.js 22+, Express 4 |
| Frontend | HTML5, JavaScript, Tailwind CSS e Font Awesome |
| Banco de dados | SQLite nativo por meio de `node:sqlite` |
| Autenticação | JSON Web Token (JWT) e bcryptjs |
| Testes | Test runner nativo do Node.js (`node:test`) |
| CI | GitHub Actions |
| Deploy preparado | Render Blueprint (`render.yaml`) |

## Requisitos

- Node.js 22 ou superior.
- npm.
- Para o deploy no Render com persistência SQLite, um serviço com disco persistente.

## Executar localmente

1. Clone o repositório e entre na pasta do projeto.
2. Instale as dependências:
   ```bash
   npm ci
   ```
3. Inicie o servidor:
   ```bash
   npm start
   ```
4. Abra http://localhost:3000 no navegador.

Em um banco local vazio, no modo de desenvolvimento, o sistema cria uma conta e dados fictícios para demonstração:

- **E-mail:** `admin@escola.com`
- **Senha:** `admin123`

Essas credenciais são exclusivas do modo de desenvolvimento/testes. Não são utilizadas automaticamente em produção.

## Testes automatizados

Execute:

```bash
npm test
```

A suíte de smoke tests verifica:
1. O endpoint de saúde `GET /healthz`.
2. A entrega da interface pela rota raiz.
3. O login local de demonstração e a geração de token JWT.
4. O bloqueio de uma rota protegida quando não há token.

O comando também exibe o relatório de cobertura do Node.js. O GitHub Actions executa `npm ci` e `npm test` em pushes para `main` e para a branch de preparação, além de pull requests direcionados à `main`.

## Deploy no Render

O arquivo `render.yaml` define um Blueprint para publicar o EduFlow como Web Service Node.js.

### Configuração prevista

- **Build Command:** `npm ci`
- **Start Command:** `npm start`
- **Health Check Path:** `/healthz`
- **Porta:** fornecida pelo Render por meio de `PORT`.
- **Host:** `0.0.0.0`.
- **SQLite:** `/var/data/escola.db`.
- **Disco persistente:** montado em `/var/data`, com 1 GB.
- **JWT_SECRET:** gerado pelo Render.

### Publicar usando o Blueprint

1. Mescle o pull request de preparação para deploy na branch `main`.
2. Entre em https://dashboard.render.com/.
3. Selecione **New → Blueprint**.
4. Conecte o repositório EduFlow e escolha a branch `main`.
5. Confira os recursos e custos descritos pelo Render antes de confirmar a criação.
6. Informe `ADMIN_EMAIL` e `ADMIN_PASSWORD`. Use um e-mail administrativo válido e uma senha exclusiva, forte e com pelo menos 12 caracteres.
7. Aguarde o deploy terminar e abra a URL HTTPS fornecida pelo Render.

O serviço definido em `render.yaml` usa o plano Starter para suportar o disco persistente. Verifique o preço atual no painel do Render antes de confirmar. O disco é necessário para preservar o arquivo SQLite após reinicializações e novos deploys; sem armazenamento persistente, o arquivo local pode ser perdido. A configuração é destinada a uma única instância, não a múltiplas instâncias compartilhando o mesmo arquivo SQLite.

### Variáveis de ambiente

| Variável | Finalidade |
|---|---|
| `PORT` | Porta definida automaticamente pela plataforma. |
| `HOST` | Interface de rede; padrão `0.0.0.0`. |
| `NODE_ENV` | Definir como `production` no ambiente publicado. |
| `JWT_SECRET` | Segredo de assinatura JWT; obrigatório em produção e com pelo menos 32 caracteres. O Blueprint solicita geração automática. |
| `DB_PATH` | Caminho do banco SQLite; no Render, `/var/data/escola.db`. |
| `ADMIN_EMAIL` | E-mail do administrador criado na primeira inicialização do banco de produção. |
| `ADMIN_PASSWORD` | Senha inicial do administrador; mínimo de 12 caracteres. |
| `ADMIN_NAME` | Nome exibido para a conta administrativa (opcional). |
| `CORS_ORIGINS` | Origens adicionais autorizadas, separadas por vírgula, caso a API seja chamada de outro domínio. |

O banco é criado automaticamente se não existir. Dados de demonstração são incluídos apenas fora do ambiente de produção. Os arquivos `.env` e bancos `*.db` são ignorados pelo Git e não devem ser enviados ao repositório.

## Monitoramento e disponibilidade

A rota `GET /healthz` executa uma consulta simples ao SQLite. Se a aplicação e o banco estiverem operacionais, retorna HTTP 200:

```json
{ "status": "ok" }
```

O Render utiliza essa rota como health check por meio da configuração `healthCheckPath` do Blueprint. Para receber alertas externos de indisponibilidade, depois do deploy:

1. Crie uma conta em https://uptimerobot.com/.
2. Adicione um monitor do tipo **HTTP(s)**.
3. Informe a URL pública do serviço terminada em `/healthz`.
4. Configure o e-mail de notificação.
5. Confira o status **UP** no painel e os alertas quando houver falha.

**Nota:** a rota de saúde e a configuração de health check estão no código. O monitor externo do UptimeRobot só estará ativo depois de ser cadastrado na conta.

## Estrutura do projeto

```text
├── .github/
│   └── workflows/
│       └── deploy-readiness.yml
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

## Próximas evoluções

- Aprimorar a modularização das rotas, regras de negócio e acesso ao banco.
- Reforçar os controles de segurança e autorização por perfil.
- Ampliar os testes de integração e cobertura das funcionalidades.
- Validar a acessibilidade com usuários e tecnologias assistivas.
- Avaliar migração para PostgreSQL caso a necessidade de acesso concorrente e escalabilidade aumente.

## Licença

Distribuído sob a licença MIT. Consulte o arquivo `LICENSE` para mais informações.
