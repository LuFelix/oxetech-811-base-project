# Camada de Domínio - backend/src/domain

Esta camada representa o coração do sistema Oxetech Helpdesk, contendo as entidades, os modelos de dados, as constantes do negócio, as definições de exceções e a lógica de serviços centrais de domínio.

---

## 📂 Subdiretórios e Componentes

### 1. `errors/` ([README](file:///home/jaspion/projetos/oxetech-811-base-project/backend/src/domain/errors/README.md) se aplicável)
* Contém as exceções personalizadas da aplicação (`AppError`, `NotFoundError`, `ValidationError`). 
* Essas classes estendem a classe base nativa `Error` do JavaScript e definem propriedades como a mensagem do erro e o código de status HTTP correspondente.

### 2. `services/`
* Contém a lógica de regras de negócio. O arquivo principal é o `ticket.service.ts`, que implementa todas as validações estruturais relativas ao ciclo de vida de chamados (existência do autor/solicitante, transições permitidas, e obrigatoriedade de comentários ao fechar chamados).

### 3. `utils/`
* Contém utilitários puros como algoritmos de ordenação, mapeadores de dados (`ticket.mapper.ts`, `user.mapper.ts`) e cálculos auxiliares de regras de negócio (prioridades baseadas em categoria, status abertos/fechados).

### 4. `ticket.constants.ts` e `types.ts`
* Arquivos que unificam as constantes imutáveis do negócio (categorias válidas, status suportados) e tipos estáticos do TypeScript para garantir a segurança de compilação da aplicação.
