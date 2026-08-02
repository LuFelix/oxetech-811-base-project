import nodemailer from "nodemailer";

const getTransporter = () => {
  const host = process.env.SMTP_HOST || "localhost";
  const port = parseInt(process.env.SMTP_PORT || "1025", 10);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });
};

export async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const from = process.env.SMTP_FROM || "suporte@tiweb.app.br";
  const transporter = getTransporter();

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
}

export async function sendTicketCreatedNotification(
  to: string,
  ticket: { id: string; title: string; description: string; category: string; priority: string }
): Promise<void> {
  const subject = `[Oxetech Helpdesk] Chamado Criado: #${ticket.id} - ${ticket.title}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">Chamado Criado com Sucesso!</h2>
      <p>Olá,</p>
      <p>Seu chamado foi registrado em nossa plataforma. Aqui estão os detalhes:</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr style="background-color: #f8fafc;">
          <th style="text-align: left; padding: 8px; border: 1px solid #e2e8f0;">Número do Chamado</th>
          <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; color: #6366f1;">#${ticket.id}</td>
        </tr>
        <tr>
          <th style="text-align: left; padding: 8px; border: 1px solid #e2e8f0;">Título</th>
          <td style="padding: 8px; border: 1px solid #e2e8f0;">${ticket.title}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <th style="text-align: left; padding: 8px; border: 1px solid #e2e8f0;">Descrição</th>
          <td style="padding: 8px; border: 1px solid #e2e8f0;">${ticket.description}</td>
        </tr>
        <tr>
          <th style="text-align: left; padding: 8px; border: 1px solid #e2e8f0;">Categoria</th>
          <td style="padding: 8px; border: 1px solid #e2e8f0; text-transform: capitalize;">${ticket.category}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <th style="text-align: left; padding: 8px; border: 1px solid #e2e8f0;">Prioridade</th>
          <td style="padding: 8px; border: 1px solid #e2e8f0; text-transform: capitalize; font-weight: bold;">${ticket.priority}</td>
        </tr>
      </table>
      <p style="margin-top: 20px;">Você receberá notificações por e-mail sempre que houver atualizações neste chamado.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;">
      <p style="font-size: 0.85rem; color: #64748b; text-align: center;">Este é um e-mail automático enviado pelo Oxetech Helpdesk.</p>
    </div>
  `;

  await sendMail(to, subject, html);
}

export async function sendCommentAddedNotification(
  to: string,
  ticketId: string,
  comment: { authorName: string; message: string }
): Promise<void> {
  const subject = `[Oxetech Helpdesk] Novo comentário no chamado #${ticketId}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">Novo Comentário Adicionado</h2>
      <p>Olá,</p>
      <p>Um novo comentário foi adicionado ao seu chamado <strong>#${ticketId}</strong> por <strong>${comment.authorName}</strong>:</p>
      <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 15px; margin: 15px 0; border-radius: 4px; font-style: italic;">
        "${comment.message}"
      </div>
      <p>Para interagir ou responder, acesse a plataforma do Helpdesk.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;">
      <p style="font-size: 0.85rem; color: #64748b; text-align: center;">Este é um e-mail automático enviado pelo Oxetech Helpdesk.</p>
    </div>
  `;

  await sendMail(to, subject, html);
}

export async function sendStatusUpdatedNotification(
  to: string,
  ticketId: string,
  status: string,
  authorName: string,
  comment?: string
): Promise<void> {
  const subject = `[Oxetech Helpdesk] Status Atualizado: Chamado #${ticketId}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">Status do Chamado Atualizado</h2>
      <p>Olá,</p>
      <p>O status do seu chamado <strong>#${ticketId}</strong> foi alterado para <strong style="color: #6366f1; text-transform: uppercase;">${status}</strong> por <strong>${authorName}</strong>.</p>
      ${comment ? `
        <p><strong>Justificativa/Comentário de encerramento:</strong></p>
        <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 15px; margin: 15px 0; border-radius: 4px; font-style: italic;">
          "${comment}"
        </div>
      ` : ""}
      <p>Acesse o painel do Helpdesk para verificar mais detalhes.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;">
      <p style="font-size: 0.85rem; color: #64748b; text-align: center;">Este é um e-mail automático enviado pelo Oxetech Helpdesk.</p>
    </div>
  `;

  await sendMail(to, subject, html);
}
