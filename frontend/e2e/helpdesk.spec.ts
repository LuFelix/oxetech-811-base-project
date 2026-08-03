import { test, expect } from "@playwright/test";

test.describe("Oxetech Helpdesk E2E Flow", () => {
  test("should register a new student, login, create ticket, comment, close ticket and verify audit", async ({ page }) => {
    // Aumentar o timeout para evitar falhas por lentidão no container
    test.setTimeout(60000);

    // 1. Navigate to homepage
    await page.goto("/");

    // Validate we are on the Login screen
    await expect(page.locator("h1")).toContainText("Oxetech Helpdesk");
    await expect(page.locator("text=Não tem uma conta? Cadastre-se")).toBeVisible();

    // 2. Navigate to Register Screen
    await page.locator("text=Não tem uma conta? Cadastre-se").click();
    await expect(page.locator("h1")).toContainText("Criar Conta");

    // 3. Fill out Registration Form with dynamic data
    const uniqueId = Date.now();
    const studentName = `Aluno E2E ${uniqueId}`;
    const studentEmail = `aluno.e2e.${uniqueId}@example.com`;
    const studentPassword = "password123";

    await page.locator("#reg-name").fill(studentName);
    await page.locator("#reg-email").fill(studentEmail);
    await page.locator("#reg-password").fill(studentPassword);

    // Submit registration
    await page.locator("button[type='submit']").click();

    // Wait for the success state and automatic redirection to Login screen
    await expect(page.locator("text=Cadastro realizado!")).toBeVisible();
    await expect(page.locator("#login-email")).toBeVisible({ timeout: 5000 });

    // 4. Perform Real Login
    await page.locator("#login-email").fill(studentEmail);
    await page.locator("#login-password").fill(studentPassword);
    await page.locator("button[type='submit']").click();

    // Verify redirection to dashboard, checking the welcome navigation bar
    await expect(page.locator(".user-profile-nav")).toContainText(studentName);
    
    // Verify the Tab switcher navigation is visible
    await expect(page.locator("text=Fila de Chamados")).toBeVisible();
    await expect(page.locator("text=Painel Geral")).toBeVisible();

    // Reload page to verify session persistence
    await page.reload();
    await expect(page.locator(".user-profile-nav")).toContainText(studentName);

    // 5. Create Ticket Flow
    const newTicketBtn = page.locator("text=Novo Chamado");
    await expect(newTicketBtn).toBeVisible();
    await newTicketBtn.click();

    // Verify modal is open
    await expect(page.locator("h2:has-text('Novo Chamado')")).toBeVisible();

    // Attempt empty submit to verify validation works
    const modalSubmitBtn = page.locator("button.btn-submit");
    await modalSubmitBtn.click();
    await expect(page.locator(".modal-error-badge")).toContainText("O título do chamado é obrigatório.");

    // Fill valid data
    const ticketTitle = `Problema E2E - ${uniqueId}`;
    await page.locator("#ticket-title").fill(ticketTitle);
    await page.locator("#ticket-category").selectOption("sistemas");
    await page.locator("#ticket-desc").fill("Descrição detalhada do chamado de teste E2E Playwright.");

    // Submit creation
    await modalSubmitBtn.click();

    // Modal should close and the ticket should be visible in the list
    await expect(page.locator("h2:has-text('Novo Chamado')")).not.toBeVisible();
    
    const searchInput = page.locator('input[placeholder*="Buscar chamados"]');
    await searchInput.fill(ticketTitle);
    await page.waitForTimeout(500);

    const ticketCard = page.locator(`text=${ticketTitle}`);
    await expect(ticketCard).toBeVisible();

    // 6. Ticket Details & Timeline Comment
    await ticketCard.click();

    // Verify detail headers
    await expect(page.locator(".details-title-text")).toContainText(ticketTitle);
    await expect(page.locator(".badge-status-open")).toBeVisible();

    // Write a student comment
    const commentTextArea = page.locator("textarea.text-area");
    await expect(commentTextArea).toBeVisible();
    await commentTextArea.fill("Comentário do aluno no teste E2E.");
    
    await page.locator("text=Enviar Mensagem").click();
    await expect(page.locator("text=Comentário do aluno no teste E2E.")).toBeVisible();

    // 7. Student cancellation (Desistir / Fechar Chamado)
    // Setup dialog prompt handler BEFORE clicking
    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Por favor, digite uma justificativa");
      await dialog.accept("Fechamento pelo próprio aluno no teste E2E");
    });

    // Click on Student Close button
    const closeBtn = page.locator("text=Desistir / Fechar Chamado");
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Verify status updated to closed
    await expect(page.locator(".badge-status-closed")).toBeVisible();

    // Verify the Audit Log was registered and displayed on screen
    await expect(page.locator("text=Histórico de Auditoria")).toBeVisible();
    await expect(page.locator("text=Alterou o status: de Aberto para Fechado")).toBeVisible();

    // 8. Go back to list and check Dashboard tabs
    await page.locator("text=Voltar para Lista").click();
    await expect(page.locator("text=Fila de Chamados")).toBeVisible();

    // Click on dashboard charts tab
    await page.locator("text=Painel Geral").click();
    await expect(page.locator("text=Distribuição por Status")).toBeVisible();
    await expect(page.locator("text=Distribuição por Categoria")).toBeVisible();
  });
});
