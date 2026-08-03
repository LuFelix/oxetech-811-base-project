# Guia de Execução e Cenários de Testes E2E (Playwright)

Este documento descreve como executar e validar a suíte de testes automatizados **End-to-End (E2E)** desenvolvida para a aplicação **Oxetech Helpdesk**.

A suíte utiliza o framework **Playwright** para simular as ações do usuário diretamente no navegador de forma automatizada, testando a integração completa entre o Frontend (React), a API Backend (Express) e o Banco de Dados (PostgreSQL).

---

## 🚀 Como Executar os Testes

Como a aplicação roda em contêineres Docker, os testes foram configurados para rodar de forma isolada dentro do contêiner do frontend.

No terminal do projeto (na máquina física), execute o comando abaixo:

```bash
docker compose exec front npx playwright test
```

### O que acontece durante a execução?
1. O Playwright inicializará o navegador Chromium em modo silencioso (*headless*) dentro do Docker.
2. Ele executará todos os passos da jornada do usuário descrita abaixo.
3. No final, ele exibirá o resultado no console (ex: `1 passed (9.5s)`).

---

## 📹 Como Visualizar as Provas de Execução (Vídeos e Relatórios)

O Playwright foi configurado para gerar relatórios e evidências visuais de forma automatizada.

### 1. Gravação em Vídeo da Execução
Toda vez que o teste roda, o Playwright grava a tela do navegador executando as ações. O arquivo de vídeo fica salvo em:
*   `frontend/test-results/helpdesk-Oxetech-Helpdesk-.../video.webm`

*Dica: Você pode abrir este arquivo `.webm` em qualquer player de vídeo ou navegador para ver a automação operando o sistema.*

### 2. Relatório HTML Interativo (Trace Viewer)
Para inspecionar detalhadamente cada clique e chamada de rede realizada pelo teste:
1. No terminal do seu computador, entre na pasta do frontend:
   ```bash
   cd frontend
   ```
2. Execute o visualizador de relatórios:
   ```bash
   npx playwright show-report
   ```
3. Uma página local abrirá no seu navegador listando o teste. Clicando nele, você poderá ver prints de tela de cada clique e o tempo de resposta da API.

### 3. Ajuste de Velocidade da Execução (Slow Motion)
Por padrão, os testes automatizados rodam em velocidade de máquina. Para fins de apresentação acadêmica ou gravação de manual, a velocidade foi configurada no arquivo `playwright.config.ts` utilizando a propriedade **`slowMo: 1200`** (Slow Motion).
*   **O que ela faz:** Adiciona um atraso de 1.2 segundos (1200ms) entre cada ação do Playwright (como cliques, navegação ou submissão de formulários).
*   **Por que não atrasa a digitação:** As ações de digitação utilizam o método `.fill()`, que insere a string de texto completa instantaneamente de uma vez, e apenas aguarda 1.2s antes de ir para a próxima ação. Isso deixa o teste fluído e legível.
*   **Quando usar:** Em gravações de demonstrações (demos) para facilitar o acompanhamento visual das telas ou em depurações visuais (debug).
*   **Quando desativar:** Em ambientes de Integração Contínua (CI/CD) para maximizar a velocidade do pipeline de entrega.

---

## 🧪 Cenários de Teste Validados (Jornada do Usuário)

O arquivo de testes está localizado em `frontend/e2e/helpdesk.spec.ts` e valida os seguintes fluxos de ponta a ponta:

1. **Simulação de Login e Persistência:**
   * Abre a Home (`http://localhost:5173`) sem login ativo e valida se a tela é redirecionada para a página de login.
   * Clica no card de perfil de **"Ana Beatriz"** (Perfil Aluna) para efetuar o login simulado.
   * Garante que o dashboard carrega exibindo o nome dela na barra superior.
   * Recarrega a página (F5) e confirma que a sessão permanece ativa (salva no `localStorage`).

2. **Pesquisa no Dashboard:**
   * Digita um termo de busca no campo de filtro superior e valida que a listagem de chamados se atualiza em tempo real.

3. **Criação de Chamado com Validação de Formulário:**
   * Abre o modal de criação de chamados.
   * Tenta salvar o formulário em branco e valida se o alerta de erro *"O título do chamado é obrigatório"* é exibido na tela.
   * Preenche um título único temporário, seleciona a categoria *"Sistemas"*, digita a descrição e envia.
   * Valida se o modal fechou e se o novo chamado aparece listado no grid principal.

4. **Chat da Timeline e Transição de Status:**
   * Clica no chamado criado para abrir a tela de detalhes dele.
   * Escreve uma mensagem de chat e envia, validando que a mensagem aparece na timeline com o nome correto do autor e a hora.
   * Clica no botão **🚀 Iniciar Atendimento** e valida se a transição de status do chamado no backend reflete imediatamente mudando a cor do badge para *"Em Progresso"*.
   * Clica em **Voltar para Lista** e garante o retorno seguro ao painel principal.
