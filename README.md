# 🏫 EduFlow — Sistema de Gestão Escolar (MVP)

Um MVP para gestão escolar, desenvolvido com foco na simplicidade, no lançamento de chamadas e no acompanhamento da frequência dos estudantes.

---

## 🚀 Funcionalidades documentadas

- 🔐 **Autenticação:** login com JWT e senhas protegidas com bcryptjs.
- 📚 **Gestão de turmas:** cadastro e controle de turnos, salas e anos letivos.
- 👨‍🎓 **Gestão de alunos:** matrícula vinculada à turma e registro de contatos dos responsáveis.
- 📋 **Chamada diária:** registro de presença, falta ou falta justificada, com observações por aluno.
- 📊 **Histórico e relatórios:** consulta por período e turma, cálculo de frequência e sinalização de infrequência.

> Esta lista descreve as funcionalidades declaradas para o MVP. A implementação deve ser validada no código e em testes antes da publicação em produção.

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
cd -EduFlow-Sistema-de-Gest-o-Escolar-MVP-
npm install
npm start
```

Depois de iniciar o servidor, abra `http://localhost:3000` no navegador, conforme a configuração local da aplicação.

## 🔑 Credenciais de demonstração

O projeto documenta as seguintes credenciais para testes locais:

- **E-mail:** `admin@escola.com`
- **Senha:** `admin123`

**Segurança:** use apenas em ambiente local de demonstração. Altere ou remova credenciais padrão antes de qualquer implantação e nunca reutilize senhas de demonstração em produção.

## 📂 Estrutura documentada

```text
├── public/
│   └── index.html
├── escola.db           # Banco SQLite gerado em execução (não versionar dados reais)
├── package.json
├── server.js
└── README.md
```

## 🔎 Pontos de auto-revisão

- **Legibilidade:** títulos, funcionalidades, tecnologias e instruções estão organizados em seções distintas.
- **Manutenção:** a documentação deve acompanhar alterações reais na API, no banco de dados e na interface.
- **Segurança:** credenciais de demonstração não devem ser usadas em produção; dados reais de estudantes exigem proteção e controle de acesso.
- **Validação:** antes do merge, conferir os comandos de instalação e inicialização em um ambiente limpo e testar autenticação e permissões.

## 📝 Licença

Distribuído sob a licença MIT, conforme o arquivo `LICENSE`.
