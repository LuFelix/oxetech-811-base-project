# Utilitários de Domínio - backend/src/domain/utils

Esta pasta agrupa funções utilitárias puras, mapeadores de dados e algoritmos auxiliares que dão suporte à lógica de negócios do Helpdesk sem depender de frameworks externos.

---

## 🛠️ Componentes

### 1. `ticket.utils.ts`
* **Cálculo de Prioridades:** Define a prioridade com base na categoria (`sistemas` -> `high`, `infra` -> `urgent`, etc.).
* **Filtros e Ordenação:** Implementa a ordenação cronológica decrescente dos chamados e filtros de busca.
* **Geração de Sumário:** Agrupa métricas de chamados retornando estatísticas agregadas (total abertos, total fechados).

### 2. `ticket.mapper.ts`
* Responsável por mapear o retorno cru do Prisma (infraestrutura) para o formato limpo de saída esperado pela API, acionando internamente a sanitização de usuários.

### 3. `user.mapper.ts`
* Contém a função `sanitizeUser`, responsável por deletar o campo de senha (`password`) de qualquer objeto de usuário antes que ele saia na resposta HTTP de qualquer controlador.
