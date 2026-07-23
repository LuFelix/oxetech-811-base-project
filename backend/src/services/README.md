# Serviços Transversais - backend/src/services

Esta pasta contém serviços utilitários que oferecem funcionalidades transversais de infraestrutura ou utilitários lógicos que dão suporte aos demais módulos da aplicação.

---

## 📂 Subdiretórios

### 1. `security/`
* **`password.ts`:**
  * Implementa a função de criptografia e hashing `hashPassword`.
  * Utiliza o algoritmo SHA-256 nativo do Node.js através da biblioteca `crypto` para gerar hashes em formato hexadecimal (64 caracteres) a partir de senhas em texto puro.
  * Utilizado durante a inicialização (seed) do banco de dados e nos fluxos de validação de credenciais de usuários.
