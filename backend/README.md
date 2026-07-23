# Oxetech Helpdesk - Backend Service

Este é o serviço de backend do sistema Oxetech Helpdesk, uma API REST construída com Node.js, Express e TypeScript, utilizando o Prisma ORM para persistência no PostgreSQL e Vitest para testes automatizados.

---

## 🛠️ Stack Tecnológica
* **Runtime:** Node.js v20
* **Framework:** Express (com suporte a captura assíncrona automática)
* **ORM:** Prisma Client
* **Banco de Dados:** PostgreSQL
* **Suite de Testes:** Vitest + Supertest
* **Validação:** Verificação manual de restrições relacionais e integridade no domínio
* **Erros:** Middleware global de interceptação e mapeamento de exceções typadas

---

## 📂 Estrutura de Pastas
```
backend/
├── prisma/               # Configuração do banco, migrations e seed script
└── src/
    ├── controllers/      # Handlers de rota (validação de parâmetros HTTP)
    ├── domain/           # Entidades, constantes, erros e serviços de domínio
    │   ├── errors/       # Exceções personalizadas (AppError, NotFoundError, etc.)
    │   ├── services/     # Lógica central e regras de negócio (TicketService)
    │   └── utils/        # Mappers de higienização de senhas e utilitários
    ├── infrastructure/   # Repositórios Prisma encapsulados
    ├── middleware/       # Interceptador global de tratamento de erro do Express
    ├── services/         # Serviços transversais (ex: criptografia de senhas)
    ├── app.ts            # Inicialização do Express e rotas (testável)
    └── server.ts         # Ponto de entrada física (escuta da porta HTTP)
```

---

## 🚀 Como Executar e Testar

### 1. Rodar os testes da suíte local
```bash
npm run typecheck      # Compilação estática TypeScript
npm test               # Executa os 36 testes com Vitest
npx vitest run --coverage  # Relatório completo de cobertura de código (meta > 80%)
```

### 2. Comandos de Banco de Dados (Prisma)
Se rodando dentro do container:
```bash
npx prisma generate       # Atualiza os tipos do Prisma Client
npx prisma migrate deploy # Aplica as migrações na base Postgres
npm run seed              # Popula o banco usando hashes de senhas dinâmicos
```
