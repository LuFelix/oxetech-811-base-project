# Camada de Infraestrutura - backend/src/infrastructure

Esta camada gerencia a comunicação do sistema com recursos externos e mecanismos de persistência física (banco de dados PostgreSQL).

---

## 🛠️ PrismaRepository
Implementa a interface de acesso e modificação dos dados através do Prisma ORM.

### Arquivos:
* **`database/prisma.repository.ts`:**
  * Expõe funções assíncronas encapsulando o `PrismaClient` para isolar a dependência do ORM do restante da lógica do domínio.
  * Métodos de persistência para `User`, `Ticket` e `TicketComment`.
* **`database/prisma.ts`:**
  * Instancia e expõe uma instância única e global do `PrismaClient` compartilhada por toda a aplicação.
