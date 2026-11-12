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
cd -- ./-EduFlow-Sistema-de-Gest-o-Escolar-MVP-
npm install
npm start
```

O servidor informa a porta de execução no terminal. **Nota de revisão:** no código atual, o Express procura arquivos estáticos na pasta `public/`, enquanto o `index.html` está na raiz do repositório. Essa divergência precisa ser corrigida (ajustando o caminho servido ou a localização do arquivo) e validada antes de considerar a interface acessível pelo navegador.

## 🔑 Credenciais de demonstração

O código cria uma conta de demonstração quando a tabela de usuários está vazia:

- **E-mail:** `admin@escola.com`
- **Senha:** `admin123`

Use somente em ambiente local de demonstração. Não reutilize essas credenciais em produção.

## 📂 Estrutura atual do repositório

```text
├── README.md
├── index.html
├── server.js
├── package.json
├── package-lock.json
└── escola.db             # arquivo SQLite atualmente versionado
```

## 🔎 Auto-revisão técnica — achados e ações recomendadas

Esta revisão foi feita por inspeção estática dos arquivos do repositório. Os pontos abaixo são pendências identificadas, não correções já aplicadas:

### Arquitetura e manutenção

- O backend está concentrado em `server.js`, incluindo inicialização do banco, rotas e autenticação. Em uma evolução do MVP, separar configuração, acesso a dados, middlewares e rotas facilitaria testes e manutenção.
- Há divergência entre o caminho estático configurado (`public/`) e a localização atual de `index.html` (raiz). Alinhar a estrutura e validar a inicialização local.

### Segurança

- `JWT_SECRET` está definido diretamente no código. Mover o segredo para variável de ambiente, validar sua presença na inicialização e rotacioná-lo antes de qualquer implantação.
- O middleware CORS está configurado sem restrição de origem (`cors()`); definir uma lista explícita de origens confiáveis.
- A conta padrão usa uma senha conhecida (`admin123`). Desabilitar o usuário padrão em produção e exigir credenciais fortes e individuais.
- O arquivo `escola.db` está versionado. Não versionar bancos com dados pessoais ou escolares reais; manter apenas dados fictícios/sanitizados e adicionar o banco local ao `.gitignore`. Se dados reais já foram publicados, avaliar a remoção do histórico e os procedimentos de resposta a incidente.

### Legibilidade e testes

- Manter documentação e estrutura alinhadas ao código efetivamente versionado.
- Criar testes para autenticação, autorização, validação dos dados recebidos e operações de frequência. Os testes não foram executados como parte desta revisão documental.

## 📝 Licença

Distribuído sob a licença MIT, conforme o arquivo `LICENSE`.
