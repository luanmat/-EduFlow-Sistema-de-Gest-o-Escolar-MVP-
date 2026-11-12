# 🏫 EduFlow — Sistema de Gestão Escolar (MVP)

MVP de gestão escolar com foco no registro de chamadas e no acompanhamento da frequência dos estudantes.

---

## 🚀 Funcionalidades

- **Autenticação:** login com JWT e senhas armazenadas com bcryptjs.
- **Gestão de turmas:** cadastro e controle de turnos, salas e anos letivos.
- **Gestão de alunos:** matrícula vinculada à turma e contatos dos responsáveis.
- **Chamada diária:** registro de presença (P), falta (F) ou falta justificada (FJ), com observações.
- **Histórico e relatórios:** consulta por período e turma e cálculo de frequência.

## 🛠️ Tecnologias

- **Backend:** Node.js 22+ e Express.
- **Banco de dados:** SQLite (`node:sqlite`).
- **Segurança:** JWT e bcryptjs.
- **Frontend:** HTML, JavaScript, Tailwind CSS e Font Awesome.

## 🏁 Como executar

### Pré-requisitos

- Node.js 22 ou superior.
- npm.

### Instalação

```bash
git clone https://github.com/luanmat/-EduFlow-Sistema-de-Gest-o-Escolar-MVP-.git
cd -- -EduFlow-Sistema-de-Gest-o-Escolar-MVP-
npm install
npm start
```

O servidor usa `express.static` para disponibilizar os arquivos da pasta `public/`. A interface principal está em `public/index.html`.

### Testes automatizados e cobertura

Execute a suíte completa com Node.js 22 ou superior:

```bash
npm test
```

A suíte combina testes unitários da validação de frequência (`tests/attendance-validation.test.js`) e testes de integração das rotas HTTP, autenticação e persistência SQLite (`tests/server.test.js`). Também é possível executar cada grupo separadamente com `npm run test:unit` e `npm run test:integration`. O runner nativo do Node.js apresenta o resumo de cobertura ao final de `npm test`. Os testes de integração usam SQLite em memória (`NODE_ENV=test`), sem alterar o banco local. O GitHub Actions executa `npm ci` e `npm test` automaticamente em pushes na branch de revisão e em pull requests para `main`.

## 🔑 Credenciais de demonstração

O código cria uma conta de demonstração quando a tabela de usuários está vazia:

- **E-mail:** `admin@escola.com`
- **Senha:** `admin123`

Use somente em ambiente local de demonstração. Não reutilize essas credenciais em produção.

## 📂 Estrutura do projeto

```text
├── public/
│   └── index.html      # Interface SPA completa e responsiva
├── lib/
│   └── attendance-validation.js # Validação reutilizável de frequência
├── tests/
│   ├── attendance-validation.test.js # Testes unitários
│   └── server.test.js  # Testes de integração da API
├── .github/workflows/
│   └── tests.yml       # Execução automática no GitHub Actions
├── escola.db           # Banco SQLite gerado automaticamente na inicialização
├── package.json        # Dependências e scripts
├── server.js           # API REST, autenticação e regras de negócio
└── README.md           # Documentação do projeto
```

> `package-lock.json` também pode permanecer no repositório para registrar versões exatas das dependências. O arquivo `escola.db` deve conter somente dados fictícios/sanitizados; nunca publique dados reais de estudantes ou responsáveis.

## 🔎 Auto-revisão técnica — achados e ações recomendadas

Esta revisão foi feita por inspeção estática dos arquivos do repositório. Os pontos abaixo são pendências identificadas, não correções já aplicadas:

### Arquitetura e manutenção

- O backend está concentrado em `server.js`, incluindo inicialização do banco, rotas e autenticação. Em uma evolução do MVP, separar configuração, acesso a dados, middlewares e rotas facilitaria testes e manutenção.

### Segurança

- `JWT_SECRET` está definido diretamente no código. Mover o segredo para variável de ambiente, validar sua presença na inicialização e rotacioná-lo antes de qualquer implantação.
- O middleware CORS está configurado sem restrição de origem (`cors()`); definir uma lista explícita de origens confiáveis.
- A conta padrão usa uma senha conhecida (`admin123`). Desabilitar o usuário padrão em produção e exigir credenciais fortes e individuais.
- O arquivo `escola.db` está versionado. Não versionar bancos com dados pessoais ou escolares reais; manter apenas dados fictícios/sanitizados e adicionar o banco local ao `.gitignore`. Se dados reais já foram publicados, avaliar a remoção do histórico e os procedimentos de resposta a incidente.

### Legibilidade e testes

- Manter documentação e estrutura alinhadas ao código efetivamente versionado.
- Foram adicionados testes unitários para a validação dos registros de frequência e testes de integração para login, autorização, turmas, alunos, frequência, histórico e interface estática. O backend rejeita registros de frequência com identificador ou status inválido. A execução real e o percentual de cobertura devem ser confirmados pelo resultado do workflow `Automated tests` na aba `Actions` ou por `npm test` em ambiente Node.js 22+.

## 📝 Licença

Distribuído sob a licença MIT, conforme o arquivo `LICENSE`.
