import React, { useState, useEffect } from "react";

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

interface TicketDetailsProps {
  ticketId: string;
  currentUser: User;
  onBack: () => void;
}

const API_BASE_URL = "http://localhost:3000/api";

export function TicketDetails({ ticketId, currentUser, onBack }: TicketDetailsProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const fetchTicketDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`);
      if (!response.ok) throw new Error("Erro ao buscar detalhes do chamado");
      const data = await response.json();
      setTicket(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorId: currentUser.id,
          message: newMessage.trim(),
        }),
      });

      if (!response.ok) throw new Error("Falha ao adicionar comentário");

      setNewMessage("");
      // Refetch to update comments
      await fetchTicketDetails();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    let comment: string | undefined = undefined;
    if (newStatus === "closed") {
      const input = prompt("Por favor, digite uma justificativa/comentário para o fechamento:");
      if (input === null) return; // cancel click
      if (!input.trim()) {
        alert("É necessário informar uma justificativa para fechar o chamado.");
        return;
      }
      comment = input.trim();
    }

    setSubmittingStatus(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          authorId: currentUser.id,
          comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao atualizar status");
      }

      // Refetch to update ticket details
      await fetchTicketDetails();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingStatus(false);
    }
  };

  if (loading && !ticket) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Buscando detalhes do chamado...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="empty-state">
        <span className="empty-icon">⚠️</span>
        <h3>Erro ao Carregar Detalhes</h3>
        <p>{error || "Chamado não encontrado."}</p>
        <button className="btn-cancel" onClick={onBack} style={{ marginTop: "1rem" }}>
          Voltar para Lista
        </button>
      </div>
    );
  }

  // Priority layout colors
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

  const requesterInitial = ticket.requester?.name ? ticket.requester.name.charAt(0).toUpperCase() : "?";

  return (
    <div className="details-container">
      {/* Back button */}
      <button className="btn-back" onClick={onBack}>
        ⬅️ Voltar para Lista
      </button>

      {/* Main Grid */}
      <div className="details-grid">
        {/* Left Side: Ticket info */}
        <div className="details-card-info" style={{ "--priority-color": priorityColors[ticket.priority] } as React.CSSProperties}>
          <div className="ticket-header-details">
            <span className="details-ticket-id">{ticket.id}</span>
            <span className="details-ticket-date">
              {new Date(ticket.createdAt).toLocaleString("pt-BR")}
            </span>
          </div>

          <h2 className="details-title-text">{ticket.title}</h2>
          
          <div className="details-badges-row">
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

          <div className="details-desc-box">
            <h4>Descrição</h4>
            <p>{ticket.description}</p>
          </div>

          <div className="details-user-box">
            <div>
              <h4>Solicitante</h4>
              <div className="user-profile-info">
                <div className="avatar-circle">{requesterInitial}</div>
                <div>
                  <strong>{ticket.requester?.name}</strong>
                  <div className="user-email">{ticket.requester?.email}</div>
                </div>
              </div>
            </div>

            {ticket.assignedTo && (
              <div style={{ marginTop: "1rem" }}>
                <h4>Responsável Técnico</h4>
                <div className="user-profile-info">
                  <div className="avatar-circle" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>🛠️</div>
                  <div>
                    <strong>{ticket.assignedTo.name}</strong>
                    <div className="user-email">{ticket.assignedTo.email}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status actions */}
          <div className="details-status-actions">
            <h4>Ações de Status</h4>
            <div className="actions-buttons-row">
              {ticket.status === "open" && (
                <button
                  className="btn-submit"
                  onClick={() => handleUpdateStatus("in_progress")}
                  disabled={submittingStatus}
                  style={{ background: "var(--status-in-progress)", color: "#000", boxShadow: "none" }}
                >
                  🚀 Iniciar Atendimento
                </button>
              )}

              {ticket.status === "in_progress" && (
                <>
                  <button
                    className="btn-submit"
                    onClick={() => handleUpdateStatus("resolved")}
                    disabled={submittingStatus}
                    style={{ background: "var(--status-resolved)", color: "#fff", boxShadow: "none" }}
                  >
                    ✅ Resolver Chamado
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => handleUpdateStatus("closed")}
                    disabled={submittingStatus}
                    style={{ border: "1px solid var(--status-closed)", color: "var(--status-closed)" }}
                  >
                    🔒 Fechar Chamado
                  </button>
                </>
              )}

              {ticket.status === "resolved" && (
                <>
                  <button
                    className="btn-submit"
                    onClick={() => handleUpdateStatus("closed")}
                    disabled={submittingStatus}
                    style={{ background: "var(--status-closed)", color: "#fff", boxShadow: "none" }}
                  >
                    🔒 Fechar Chamado
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => handleUpdateStatus("open")}
                    disabled={submittingStatus}
                    style={{ border: "1px solid var(--status-open)", color: "var(--status-open)" }}
                  >
                    ♻️ Reabrir Chamado
                  </button>
                </>
              )}

              {ticket.status === "closed" && (
                <button
                  className="btn-submit"
                  onClick={() => handleUpdateStatus("open")}
                  disabled={submittingStatus}
                  style={{ background: "var(--status-open)", color: "#fff", boxShadow: "none" }}
                >
                  ♻️ Reabrir Chamado
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Timeline & Chat comments */}
        <div className="details-card-comments">
          <h3>Linha do Tempo / Chat</h3>

          <div className="comments-timeline-list">
            {ticket.comments.length === 0 ? (
              <div className="no-comments-placeholder">
                💬 Nenhum comentário ainda. Inicie a conversa abaixo!
              </div>
            ) : (
              ticket.comments.map((comment) => {
                const commentInitial = comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : "?";
                const isCurrentUser = comment.author?.id === currentUser.id;

                return (
                  <div key={comment.id} className={`timeline-item ${isCurrentUser ? "self" : ""}`}>
                    <div className="timeline-comment-header">
                      <div className="user-profile-info" style={{ gap: "0.5rem" }}>
                        <div className="avatar-circle" style={{ width: "20px", height: "20px", fontSize: "0.6rem" }}>
                          {commentInitial}
                        </div>
                        <span className="comment-author-name">{comment.author?.name}</span>
                        <span className={`badge badge-role-${comment.author?.role}`} style={{ fontSize: "0.55rem", padding: "0.1rem 0.3rem" }}>
                          {comment.author?.role === "student" ? "Aluno" : comment.author?.role === "teacher" ? "Prof" : "Suporte"}
                        </span>
                      </div>
                      <span className="comment-time">
                        {new Date(comment.createdAt).toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="timeline-comment-body">
                      <p>{comment.message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleAddComment} className="comment-submit-form">
            <textarea
              className="form-control text-area"
              rows={2}
              placeholder="Escreva uma mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={submittingComment}
              style={{ minHeight: "60px" }}
            ></textarea>
            <button
              type="submit"
              className="btn-submit"
              disabled={submittingComment || !newMessage.trim()}
              style={{ alignSelf: "flex-end" }}
            >
              {submittingComment ? "Enviando..." : "Enviar Mensagem"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
