# Decisão de Arquitetura: Ferramenta de Testes End-to-End (E2E)

Este documento registra a análise técnica e a decisão de escolha da suíte de testes End-to-End (E2E) para o ecossistema do **Oxetech Helpdesk**, considerando integrações futuras com múltiplos projetos e portais.

---

## 1. O Cenário e Requisitos
* **Estrutura:** Monorepo composto por SPA React e API Express em containers Docker.
* **Complexidade Futura:** O sistema de Helpdesk será integrado a outros sistemas satélites. Os testes precisam validar fluxos que transitam entre diferentes origens/domínios, múltiplos contextos de usuários (aluno, professor, suporte) e interações em iframes ou novas abas.
* **Manutenibilidade:** Suporte nativo a TypeScript, facilidade de escrita e ferramentas de depuração visual.

---

## 2. Ferramentas Analisadas

### Cypress
* **Características:** Executado dentro do próprio navegador (iframe), muito popular e amigável.
* **Limitações:** Dificuldade histórica em gerenciar múltiplas abas ou janelas do navegador simultaneamente. O suporte a cross-domain foi aprimorado recentemente, mas ainda é menos robusto para fluxos de integrações complexas entre portais externos distintos.

### Playwright (Microsoft) — *Escolha Selecionada*
* **Características:** Controla o navegador de forma externa através do protocolo DevTools (CDP).
* **Vantagens cruciais para o projeto:**
  1. **Isolamento de Contexto (Browser Contexts):** Permite simular múltiplos usuários independentes (ex: um estudante abrindo um chamado e um técnico de suporte visualizando-o no mesmo teste em "janelas" isoladas) de forma rápida e limpa.
  2. **Multi-Domain & Multi-Tab:** Suporte nativo e irrestrito a interações entre múltiplos domínios e manipulação de novas abas/janelas.
  3. **Auto-Waiting:** Aguarda de forma inteligente que elementos estejam interativos na tela antes de clicar, evitando testes falsos-positivos (flakiness).
  4. **Ferramental:** Possui o `codegen` (gravador de testes que gera o código ao interagir com o navegador) e um excelente inspetor visual de trace.

### Selenium / WebdriverIO
* **Características:** Solução clássica de automação de testes.
* **Desvantagens:** Configuração pesada, mais lento para paralelizar e necessita de gerenciamento manual de WebDrivers de terceiros.

---

## 3. Decisão de Arquitetura

Fica decidido o uso do **Playwright** como ferramenta padrão para os testes End-to-End (E2E).

Esta escolha se justifica principalmente pelo requisito de integração futura com outros projetos, onde a habilidade do Playwright de gerenciar transições suaves entre diferentes origens, iframes e sessões de usuários de forma paralela e rápida fornecerá a base mais estável para o pipeline de QA do ecossistema.
