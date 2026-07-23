# Camada de Controladores - backend/src/controllers

Esta camada é responsável por receber as requisições HTTP do cliente, validar superficialmente os parâmetros de entrada (como IDs e objetos no corpo da requisição), invocar a camada correspondente de serviços e retornar os dados estruturados de volta ao cliente.

---

## 🛠️ Princípios e Boas Práticas
1. **Desacoplamento de Regras:** Nenhum controlador executa lógica de banco de dados diretamente (Prisma) ou regras de transição de estado. Ele sempre delega para o `TicketService`.
2. **Tratamento de Erros:** Não há blocos `try/catch` explícitos. O controlador assume que o Express 5 capturará rejeições assíncronas do serviço e as repassará para o middleware de erro global.
3. **Mapeamento e Sanitização:** Antes de responder ao cliente, o controlador utiliza funções mapeadoras (ex: `sanitizeUser` do `user.mapper.ts` ou mapeamentos em `ticket.mapper.ts`) para evitar que informações sensíveis, como senhas de usuários, sejam vazadas na resposta HTTP.

---

## 📂 Arquivos Principais
* **`ticket.controller.ts`:**
  * `createTicket`: Trata a criação de chamados.
  * `listTickets`: Trata listagem geral e aplicação de filtros (status, prioridade, categoria).
  * `getTicketById`: Trata busca detalhada por ID.
  * `updateTicketStatus`: Gerencia a alteração de estados de chamados (comentário obrigatório no encerramento).
  * `addTicketComment`: Recebe novos comentários para chamados existentes.
  * `listUsers`: Lista os usuários cadastrados no banco para seleção, higienizando as senhas da listagem.
