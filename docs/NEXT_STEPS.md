# Planejamento de Próximos Passos - Oxetech Helpdesk

Este documento descreve as quatro rotas possíveis para a próxima fase de desenvolvimento do Oxetech Helpdesk, analisando o impacto de entrega, a segurança de arquitetura e fornecendo uma recomendação de reavaliação.

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

### Opção 3: Construção das Telas Restantes do Frontend (React SPA)
Desenvolvimento das telas restantes da interface gráfica em React integrando diretamente com a API do backend (Login Simulado, Formulário de Novo Chamado, e Linha do Tempo/Comentários do Chamado).
* **Impacto Visual:** Máximo (traz o sistema à vida de forma tangível).
* **Segurança de Arquitetura:** Média (utiliza autenticação simulada/mockada localmente, exigindo um ajuste simples nos cabeçalhos de requisição quando o JWT real for implementado).
* **Esforço:** Alto (construção de layouts e consumo da API).
* **Prós:** Altíssima satisfação visual. Permite ver o fluxo de chamados funcionando de ponta a ponta.
* **Contras:** Aumenta o volume de código frontend sem testes automatizados que garantam sua estabilidade.

### Opção 4: Automação de Testes End-to-End (E2E) com Playwright
Instalação, configuração e escrita dos primeiros testes de integração E2E com o Playwright para a tela de listagem e filtragem de chamados já desenvolvida.
* **Impacto de Entrega:** Alto (garante a robustez do fluxo de ponta a ponta e a integridade de rede do monorepo).
* **Segurança de Arquitetura:** Alta (cria a infraestrutura de testes de frontend no monorepo e valida o comportamento real no navegador).
* **Esforço:** Médio.
* **Prós:** Eleva a qualidade do frontend ao mesmo nível de maturidade do backend (que já possui 97% de cobertura), garantindo que alterações futuras nas telas não quebrem o comportamento atual.
* **Contras:** O escopo inicial de testes cobrirá apenas a visualização e os filtros, pois as telas de criação e comentários ainda não existem.

---

## 🏆 Reavaliação: Qual caminho seguir agora?

Com a tela de **Listagem e Filtros** concluída com sucesso na AV2, temos duas abordagens principais para escolher:

### Abordagem A: Pausar Telas e Iniciar E2E (Opção 3 em pausa ➜ Foco na Opção 4)
* **Objetivo:** Adicionar o Playwright agora e testar a tela de listagem de chamados.
* **Por que fazer:** Garante a estabilidade da interface atual imediatamente. Introduz a infraestrutura de testes E2E de forma limpa quando o volume de código ainda é pequeno e fácil de testar.
* **Desvantagem:** Os testes E2E ficarão congelados cobrindo apenas listagem, e precisaremos escrever novos testes conforme novas telas forem criadas.

### Abordagem B: Concluir as Telas e depois aplicar E2E (Foco na Opção 3 ➜ Foco na Opção 4)
* **Objetivo:** Desenvolver primeiro as telas de Criar Chamado e Adicionar Comentários e, uma vez concluído o fluxo visual, configurar o Playwright para testar o sistema inteiro de uma só vez.
* **Por que fazer:** Fluxo de desenvolvimento mais natural e ágil. Evita reaberturas sucessivas da suíte de testes E2E, permitindo escrever cenários de ponta a ponta completos (ex: login ➜ criar ticket ➜ adicionar comentário ➜ verificar status) em um único ciclo.
* **Desvantagem:** Maior volume de código frontend ficará sem testes durante a fase de criação.

---

## 🗺️ Mapa de Progresso (Abordagem B)
- [x] **Issue #10:** Tela de Login Simulado e Temas (Dark/Light Mode)
- [x] **Issue #11:** Formulário de Criação de Novo Chamado com Validação
- [ ] **Issue #12:** Tela de Detalhes do Chamado e Timeline de Comentários
- [ ] **Issue #13:** Automação de Testes E2E com Playwright

