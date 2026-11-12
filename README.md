# 🏫 EduFlow — Sistema de Gestão Escolar (MVP)

Um MVP completo, funcional e leve para gestão escolar, desenvolvido com foco em simplicidade, agilidade no lançamento de chamadas e monitoramento de infrequência escolar.

---

## 🚀 Funcionalidades

- 🔐 **Autenticação Segura**: Login com JWT e senhas criptografadas via `bcryptjs`.
- 📚 **Gestão de Turmas**: Cadastro, listagem e controle de turnos, salas e anos letivos.
- 👨‍🎓 **Gestão de Alunos**: Matrícula com vínculo direto por turma e contatos dos responsáveis.
- 📋 **Chamada Diária Inteligente**:
  - Registro de Presença (P), Falta (F) ou Falta Justificada (FJ).
  - Campo de observação/justificativa por aluno.
  - Botão de atalho: *"Marcar Todos como Presente"* para agilizar a rotina do professor.
- 📊 **Histórico e Relatórios**:
  - Consulta detalhada por período e turma.
  - Cálculo automático da taxa percentual de frequência.
  - Indicador visual de alerta de infrequência (< 75% conforme a LDB).
## Funcionalidades do EduFlow

O EduFlow é um sistema de gestão escolar que tem como
objetivo facilitar a organização das informações escolares.

Entre seus objetivos estão:
- Organização de informações de alunos.
- Gestão de professores.
- Acompanhamento das atividades escolares.
- Centralização das informações da instituição.
---

## 🛠️ Tecnologias Utilizadas

- **Backend**: [Node.js](https://nodejs.org/) (v22+) + [Express](https://expressjs.com/)
- **Banco de Dados**: SQLite Nativo (`node:sqlite` — dispensando compilação C++ ou bancos externos)
- **Segurança**: JSON Web Token (JWT) + Bcrypt.js
- **Frontend**: HTML5, JavaScript (SPA), [Tailwind CSS](https://tailwindcss.com/) e [Font Awesome](https://fontawesome.com/)

---

## 🏁 Como Executar o Projeto

## Como executar o projeto

1. Acesse o repositório no GitHub.
2. Consulte os arquivos e a documentação do projeto.
3. Siga as instruções de configuração disponíveis.

### Pré-requisitos
- [Node.js](https://nodejs.org/) v22 ou superior instalado.

### Passo a passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU_USUARIO/sistema-gestao-escolar.git
   cd sistema-gestao-escolar
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor:**
   ```bash
   npm start
   ```

4. **Acesse no navegador:**
   ```
   http://localhost:3000
   ```

---

## 🔑 Credenciais Padrão para Testes

O sistema já inicializa o banco SQLite com uma turma, alunos e histórico de teste:

- **E-mail:** `admin@escola.com`
- **Senha:** `admin123`



## 📂 Estrutura do Projeto

```text
├── public/
│   └── index.html      # Interface SPA completa e responsiva
├── escola.db           # Banco SQLite gerado automaticamente na inicialização
├── package.json        # Dependências e scripts
├── server.js           # API REST, autenticação e regras de negócio
└── README.md           # Documentação do projeto
```

---

## 📝 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.
