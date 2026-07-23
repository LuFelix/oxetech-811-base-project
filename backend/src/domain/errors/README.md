# Exceções de Domínio - backend/src/domain/errors

Esta pasta agrupa as classes de exceção personalizadas do sistema, utilizadas para sinalizar de forma clara e estruturada quando uma regra de negócio ou validação foi violada.

---

## 🛠️ Hierarquia de Exceções

### 1. `AppError` (Classe Base)
* Estende a classe nativa `Error`.
* Serve como ancestral de todas as exceções controladas da aplicação.
* Carrega a propriedade `statusCode` (padrão 500) que define qual código HTTP deve ser retornado para o cliente.

### 2. `ValidationError`
* Representa uma falha de consistência ou regra de negócio inválida.
* Exemplo: Categoria de chamado inválida ou ausência de comentário ao fechar um chamado.
* Define `statusCode = 400` (Bad Request).

### 3. `NotFoundError`
* Sinaliza que um recurso solicitado (Usuário, Chamado ou Comentário) não existe no banco de dados.
* Define `statusCode = 404` (Not Found).
