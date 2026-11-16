# EduFlow — Sistema de Gestão Escolar

O EduFlow é um MVP web para apoiar a rotina de gestão escolar. A aplicação reúne cadastro de alunos e turmas, lançamento de frequência e consulta de históricos e relatórios.

> **Situação da publicação:** o repositório contém duas configurações para o Render. `render.yaml` usa plano pago e disco persistente; `render-free.yaml` cria uma instância gratuita apenas para demonstração, com banco SQLite temporário. A aplicação ainda precisa ser implantada no painel do Render para receber uma URL pública.

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
| Deploy preparado | Render Blueprint (`render.yaml` pago e `render-free.yaml` para demonstração) |

## Requisitos

- Node.js 22 ou superior.
- npm.
- Para deploy gratuito de demonstração, use `render-free.yaml`; para manter o SQLite entre reinicializações, use o plano pago de `render.yaml` com disco persistente.

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

Há duas opções de Blueprint. Escolha apenas uma de acordo com o objetivo:

| Arquivo | Plano | Banco | Uso indicado |
|---|---|---|---|
| `render-free.yaml` | Free | SQLite temporário em `/tmp/escola.db` | Demonstração e avaliação, sem garantia de retenção dos dados |
| `render.yaml` | Starter (pago) | SQLite em disco persistente `/var/data/escola.db` | Uso com persistência do arquivo entre reinicializações |

### Opção A — publicar sem pagar (demonstração)

1. Entre em https://dashboard.render.com/ e escolha **New → Blueprint**.
2. Conecte o repositório EduFlow.
3. Selecione a branch `deploy/render-readiness`.
4. Na configuração do Blueprint, altere o caminho do arquivo para `render-free.yaml` (em vez do padrão `render.yaml`).
5. Confira se o serviço aparece com plano **Free** e sem disco persistente antes de confirmar.
6. Informe `ADMIN_EMAIL` e `ADMIN_PASSWORD` quando solicitado. Use uma senha exclusiva com pelo menos 12 caracteres.
7. Confirme a criação e aguarde o primeiro deploy. O Render fornecerá uma URL pública HTTPS.

**Limitações do plano gratuito:** o serviço pode desligar depois de 15 minutos sem tráfego e levar cerca de um minuto para iniciar novamente quando receber uma nova solicitação. O sistema de arquivos é temporário: o SQLite será perdido quando o serviço reiniciar, desligar por inatividade ou receber um novo deploy. Portanto, esta opção serve apenas para demonstração; não cadastre dados escolares reais nem dependa dela para guardar alunos, responsáveis ou frequências.

O Render também aplica limites mensais de horas gratuitas, banda e minutos de build. Acompanhe o consumo no painel e confira os limites atuais antes de publicar.

### Opção B — usar SQLite com persistência (pago)

O arquivo `render.yaml` define um Blueprint para publicar o EduFlow como Web Service Node.js com disco persistente.

### Configuração prevista

- **Build Command:** `npm ci`
- **Start Command:** `npm start`
- **Health Check Path:** `/healthz`
- **Porta:** fornecida pelo Render por meio de `PORT`.
- **Host:** `0.0.0.0`.
- **SQLite:** `/var/data/escola.db`.
- **Disco persistente:** montado em `/var/data`, com 1 GB.
- **JWT_SECRET:** gerado pelo Render.

### Publicar a opção paga usando o Blueprint

1. Mescle o pull request de preparação para deploy na branch `main`.
2. Entre em https://dashboard.render.com/.
3. Selecione **New → Blueprint** e conecte o repositório EduFlow.
4. Use o arquivo padrão `render.yaml`.
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
