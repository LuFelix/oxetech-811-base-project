# Serviços de Domínio - backend/src/domain/services

Esta pasta contém as classes de serviço que implementam as regras de negócio e coordenam as operações entre a camada de controladores e a persistência (Repositórios).

---

## 🛠️ TicketService
O `TicketService` é o principal ponto de coordenação do domínio do helpdesk, responsável por:

1. **Criação de Chamados (`createTicket`):**
   * Valida se a categoria do chamado é válida (`sistemas`, `infra`, `academico`).
   * Valida se o solicitante (`requesterId`) existe no banco.
   * Calcula a prioridade do chamado baseado na categoria fornecida.
2. **Atualização de Status (`updateTicketStatus`):**
   * Verifica se o chamado existe no banco de dados.
   * Aplica validação de transição de estado: se o chamado for alterado para `closed`, exige obrigatoriamente um comentário explicativo.
   * Cria o comentário no banco se fornecido.
3. **Adição de Comentários (`addTicketComment`):**
   * Valida a existência do chamado.
   * Valida a existência do autor do comentário no banco.
   * Registra o novo comentário e atualiza a data de modificação do chamado (`updatedAt`).
