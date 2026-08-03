import React from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TicketComment {
  id: string;
  message: string;
  createdAt: string;
  author: User;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: "sistemas" | "infra" | "academico";
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  updatedAt: string;
  requester: User;
  assignedTo?: User;
  comments: TicketComment[];
}

interface TicketCardProps {
  ticket: Ticket;
  onSelect: () => void;
}

export function TicketCard({ ticket, onSelect }: TicketCardProps) {
  const priorityColors = {
    low: "var(--priority-low)",
    medium: "var(--priority-medium)",
    high: "var(--priority-high)",
    urgent: "var(--priority-urgent)",
  };

  const priorityLabels = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    urgent: "Urgente",
  };

  const categoryLabels = {
    sistemas: "Sistemas",
    infra: "Infraestrutura",
    academico: "Acadêmico",
  };

  const statusLabels = {
    open: "Aberto",
    in_progress: "Em Progresso",
    resolved: "Resolvido",
    closed: "Fechado",
  };

  const formattedDate = new Date(ticket.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const requesterInitial = ticket.requester?.name ? ticket.requester.name.charAt(0).toUpperCase() : "?";

  return (
    <div
      className="ticket-card"
      style={{ "--priority-color": priorityColors[ticket.priority], cursor: "pointer" } as React.CSSProperties}
      onClick={onSelect}
    >
      <div className="ticket-body">
        <div className="ticket-meta-top">
          <span className="ticket-id">{ticket.id}</span>
          <span className="ticket-id" style={{ fontFamily: "inherit" }}>{formattedDate}</span>
        </div>

        <h3 className="ticket-title">{ticket.title}</h3>
        <p className="ticket-desc">{ticket.description}</p>

        <div className="badge-row">
          <span className={`badge badge-status-${ticket.status}`}>
            {statusLabels[ticket.status]}
          </span>
          <span className={`badge badge-cat-${ticket.category}`}>
            {categoryLabels[ticket.category]}
          </span>
          <span className={`badge badge-prio-${ticket.priority}`}>
            {priorityLabels[ticket.priority]}
          </span>
        </div>
      </div>

      <div className="ticket-footer">
        <div className="ticket-user">
          <div className="avatar-circle">{requesterInitial}</div>
          <div>
            <div>{ticket.requester?.name || "Sem Nome"}</div>
            {ticket.assignedTo && (
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "1px" }}>
                Resp: {ticket.assignedTo.name}
              </div>
            )}
          </div>
        </div>
        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          💬 {ticket.comments ? ticket.comments.length : 0}
        </div>
      </div>
    </div>
  );
}
