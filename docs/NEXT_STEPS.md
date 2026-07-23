# Planejamento de Próximos Passos - Oxetech Helpdesk

Este documento descreve as três rotas possíveis para a próxima fase de desenvolvimento do Oxetech Helpdesk, analisando o impacto de entrega, a segurança de arquitetura e fornecendo uma recomendação estratégica.

---

## 🗺️ Opções de Caminhos

### Opção 1: Documentação Interativa com Swagger (Backend)
Implementação de documentação automatizada das rotas da API Express usando Swagger UI (`swagger-ui-express` e `swagger-jsdoc`).
* **Impacto Visual:** Baixo (apenas para desenvolvedores).
* **Segurança de Arquitetura:** Alta (formaliza o contrato da API antes de novas integrações).
* **Esforço:** Baixo.
* **Prós:** Facilita testes rápidos dos endpoints diretamente do navegador sem necessidade de Postman/Insomnia.
* **Contras:** Não adiciona novas regras de negócio nem telas para o usuário final.

### Opção 2: Sistema de Autenticação Real (JWT + Roles)
Implementação do fluxo completo de registro, login e proteção de rotas no backend usando tokens JWT.
* **Impacto Visual:** Baixo (funcionalidade puramente de segurança e backend).
* **Segurança de Arquitetura:** Máxima (evita retrabalho futuro, pois todas as rotas do frontend já nascerão exigindo cabeçalhos de autorização `Bearer token`).
* **Esforço:** Médio-Alto.
* **Prós:** Prepara o backend com segurança real de produção e controle de acesso baseado em papéis (RBAC - Estudante, Professor, Suporte).
* **Contras:** Entrega técnica pesada e de pouca "satisfação visual" imediata.

### Opção 3: Construção das Primeiras Telas do Frontend (React SPA)
Desenvolvimento da interface gráfica em React integrando diretamente com a API do backend (rodando no container).
* **Impacto Visual:** Máximo (traz o sistema à vida de forma tangível).
* **Segurança de Arquitetura:** Média (utiliza autenticação simulada/mockada localmente, exigindo um ajuste simples nos cabeçalhos de requisição quando o JWT real for implementado).
* **Esforço:** Alto (construção de layouts Vanilla CSS premium e consumo da API).
* **Prós:** Altíssima satisfação visual. Permite ver o fluxo de chamados funcionando de ponta a ponta (ver, criar e comentar chamados em tempo real na tela).

---

## 🏆 Recomendação Estratégica: Opção 3 (Primeiras Telas)

**Por que a Opção 3 é a recomendada?**
O backend da AV2 já está totalmente completo, testado (97.8% de cobertura) e populado com dados relacionais reais no banco de dados. Construir a interface agora valida a integração de rede do Docker-compose e dá o maior retorno em termos de demonstração de produto.

### Plano de Ação para a Opção 3 (Frontend):
Para mitigar os riscos arquiteturais de retrabalho com autenticação futura, faremos o seguinte:
1. **Login Simulado:** Criamos uma tela de login moderna com design premium (glassmorphism/dark mode) onde o usuário seleciona um dos usuários do seed (Ana, Bruno ou Carla).
2. **Armazenamento Seguro:** Salvamos os dados do usuário logado no `localStorage` em um formato idêntico ao payload de um JWT.
3. **Consumo da API:** Criamos um cliente HTTP unificado (usando `fetch` ou `axios`) que injeta automaticamente os dados do usuário nos cabeçalhos das requisições. 
4. **Resultados:** Assim que implementarmos a Opção 2 (autenticação real JWT) futuramente, o frontend precisará apenas substituir a chamada simulada pelo endpoint real de login do backend, sem nenhuma alteração nos componentes visuais!

---

## 📌 Telas a serem Desenvolvidas (Escopo da Opção 3)
1. **Tela de Login:** Seleção de perfil e entrada no sistema.
2. **Dashboard / Lista de Chamados:** Grid interativo de chamados com filtros de status (Open, Closed), prioridade (Urgent, High) e categoria (Sistemas, Infra).
3. **Modal de Novo Chamado:** Formulário com validação de dados para criar um ticket.
4. **Detalhes do Chamado & Timeline:** Visualização do ticket e campo de chat para inserção de comentários em tempo real.
