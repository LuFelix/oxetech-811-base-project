# Camada de Middleware - backend/src/middleware

Esta camada contém os interceptadores de requisições do Express, responsáveis por executar lógicas transversais antes ou depois que as requisições cheguem aos controladores de rotas.

---

## 🛠️ ErrorMiddleware
O arquivo principal é o `error.middleware.ts`, que implementa a captura global de exceções da aplicação:

1. **Tratamento de Exceções de Domínio:**
   * Intercepta qualquer erro que seja uma instância de `AppError` (como `NotFoundError` ou `ValidationError`).
   * Extrai o status HTTP da exceção (`statusCode`) e retorna uma resposta JSON com o formato:
     ```json
     {
       "error": "Mensagem descritiva do erro"
     }
     ```
2. **Tratamento de Erros Inesperados (Fallback 500):**
   * Se o erro for uma falha de conexão do banco de dados ou erro sintático não esperado, intercepta o erro, loga no console do servidor para fins de debug e retorna um status HTTP `500` genérico com a mensagem `"Internal Server Error"` protegendo detalhes internos da aplicação.
