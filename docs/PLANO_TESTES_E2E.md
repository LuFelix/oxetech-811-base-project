# Plano de Implementação - Testes E2E com Playwright (Issue #13)

Este plano descreve as etapas para instalar, configurar e implementar testes End-to-End (E2E) robustos e automatizados para a aplicação **Oxetech Helpdesk**.

---

## 🛠️ Etapa 1: Instalação e Infraestrutura

Executaremos a instalação das ferramentas na pasta `frontend`:
1. **Instalar o Playwright Test:**
   ```bash
   npm install -D @playwright/test
   ```
2. **Baixar os Binários do Navegador (Chromium):**
   ```bash
   npx playwright install chromium
   ```

---

## ⚙️ Etapa 2: Configuração (`frontend/playwright.config.ts`)

Criaremos o arquivo de configuração `playwright.config.ts` apontando para a URL do dev server da aplicação (`http://localhost:5173`) com as seguintes políticas:
* **Gravação de Vídeo:** Habilitada (`video: 'on'`) para gerar o manual visual automatizado do sistema.
* **Rastreamento (Trace Viewer):** Habilitado (`trace: 'on'`) para permitir depuração detalhada passo a passo de cada teste.
* **Captura de Tela:** Tirar print das telas em caso de falha (`screenshot: 'only-on-failure'`).

---

## 🧪 Etapa 3: Cenários de Teste (`frontend/e2e/helpdesk.spec.ts`)

Escreveremos uma suíte de testes contendo a jornada do usuário de ponta a ponta:

### 1. Teste de Login e Persistência de Sessão
* **Ação:** Acessar a raiz `/` sem sessão ativa.
* **Validação:** Garantir redirecionamento automático para a tela de `/login`.
* **Ação:** Selecionar o perfil "Ana Beatriz" (Aluna).
* **Validação:** Confirmar redirecionamento para o dashboard e exibição do nome no cabeçalho.
* **Ação:** Atualizar a página (F5/Reload).
* **Validação:** Garantir que o usuário continue logado (sessão persistida no `localStorage`).

### 2. Busca e Filtragem no Dashboard
* **Ação:** Digitar termos no campo de busca (ex: "acesso").
* **Validação:** Confirmar que a quantidade de chamados listados se altera.
* **Ação:** Filtrar por Categoria e Status.
* **Validação:** Verificar que o grid renderiza apenas os chamados correspondentes aos filtros selecionados.

### 3. Criação de Novo Chamado com Validação
* **Ação:** Clicar em "Novo Chamado" para abrir o modal.
* **Ação:** Tentar submeter o formulário vazio.
* **Validação:** Garantir a exibição do alerta de erro ("Título é obrigatório").
* **Ação:** Preencher os dados válidos e salvar.
* **Validação:** Garantir que o modal feche, o novo chamado apareça na listagem e os contadores de estatísticas atualizem reativamente.

### 4. Visualização de Detalhes, Envio de Comentários e Mudança de Status
* **Ação:** Clicar no chamado recém-criado para abrir a tela de detalhes.
* **Validação:** Verificar a exibição da descrição completa do chamado e dos dados do solicitante.
* **Ação:** Escrever e enviar um comentário no chat.
* **Validação:** Confirmar que o comentário aparece na timeline com o nome "Ana Beatriz" e o badge "Aluno".
* **Ação:** Alterar o status do chamado utilizando as ações contextuais (ex: clicar em "Iniciar Atendimento").
* **Validação:** Garantir que o badge de status e os botões de ação na tela atualizem imediatamente de acordo com as regras de transição.
* **Ação:** Clicar em "Voltar para Lista" e retornar ao dashboard.
