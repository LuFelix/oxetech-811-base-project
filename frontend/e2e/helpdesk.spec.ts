import { test, expect } from "@playwright/test";

test.describe("Oxetech Helpdesk E2E Flow", () => {
  test("should go through the full user journey: login, list, create ticket, chat and change status", async ({ page }) => {
    // 1. Login Flow and Session Persistence
    // Navigate to homepage
    await page.goto("/");

    // Validate automatic load of login card (no router is used, so URL remains same)
    await expect(page.locator("text=Selecione um perfil para simular o acesso")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Oxetech Helpdesk");

    // Click on the student profile "Ana Beatriz" to login
    const anaProfileCard = page.locator("text=Ana Beatriz");
    await expect(anaProfileCard).toBeVisible();
    await anaProfileCard.click();

    // Verify redirection to dashboard and welcome message
    await expect(page).toHaveURL(/^http:\/\/localhost:5173\/?$/);
    await expect(page.locator(".user-profile-nav")).toContainText("Ana Beatriz");

    // Reload page to verify session persistence
    await page.reload();
    await expect(page.locator(".user-profile-nav")).toContainText("Ana Beatriz");

    // 2. Search and filter testing
    const searchInput = page.locator('input[placeholder*="Buscar chamados"]');
    await expect(searchInput).toBeVisible();
    
    // Type something that matches, e.g., "Portal"
    await searchInput.fill("Portal");
    await page.waitForTimeout(500);
    
    // Reset search
    await searchInput.fill("");
    await page.waitForTimeout(500);

    // 3. Ticket creation flow with validation
    const newTicketBtn = page.locator("text=Novo Chamado");
    await expect(newTicketBtn).toBeVisible();
    await newTicketBtn.click();

    // Verify modal is open
    await expect(page.locator("h2:has-text('Novo Chamado')")).toBeVisible();
    
    // Attempt empty submit
    const submitBtn = page.locator("button.btn-submit");
    await submitBtn.click();
    
    // Check validation error badge
    await expect(page.locator(".modal-error-badge")).toContainText("O título do chamado é obrigatório.");

    // Fill valid data
    const uniqueTitle = `Teste E2E Playwright - ${Date.now()}`;
    await page.locator("#ticket-title").fill(uniqueTitle);
    await page.locator("#ticket-category").selectOption("sistemas");
    await page.locator("#ticket-desc").fill("Esta é uma descrição de teste gerada pelo Playwright que possui mais de 10 caracteres.");
    
    // Submit creation
    await submitBtn.click();

    // Modal should close, and the ticket should be visible in the list
    await expect(page.locator("h2:has-text('Novo Chamado')")).not.toBeVisible();
    
    // Search for the newly created ticket title to verify it is listed
    await searchInput.fill(uniqueTitle);
    await page.waitForTimeout(500);
    const newTicketCard = page.locator(`text=${uniqueTitle}`);
    await expect(newTicketCard).toBeVisible();

    // 4. Ticket details, comments and status transitions
    await newTicketCard.click();

    // Verify we are inside the TicketDetails component view
    await expect(page.locator(".details-title-text")).toContainText(uniqueTitle);
    await expect(page.locator(".badge-status-open")).toBeVisible();

    // Add a comment
    const commentTextArea = page.locator("textarea.text-area");
    await expect(commentTextArea).toBeVisible();
    await commentTextArea.fill("Comentário de teste E2E.");
    
    const sendCommentBtn = page.locator("text=Enviar Mensagem");
    await sendCommentBtn.click();

    // Verify comment is displayed on timeline
    await expect(page.locator("text=Comentário de teste E2E.")).toBeVisible();
    await expect(page.locator(".comment-author-name").first()).toContainText("Ana Beatriz");

    // Change status: Open -> In Progress
    const startServiceBtn = page.locator("text=Iniciar Atendimento");
    await expect(startServiceBtn).toBeVisible();
    await startServiceBtn.click();

    // Verify status updated to in_progress on details badge
    await expect(page.locator(".badge-status-in_progress")).toBeVisible();

    // Verify new action buttons appear (e.g. Resolver Chamado)
    await expect(page.locator("text=Resolver Chamado")).toBeVisible();

    // Go back to list
    const backBtn = page.locator("text=Voltar para Lista");
    await backBtn.click();

    // Verify dashboard is shown
    await expect(page.locator("text=Chamados Registrados")).toBeVisible();
  });
});
