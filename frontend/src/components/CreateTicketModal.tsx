import React, { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onTicketCreated: () => void;
}

export function CreateTicketModal({ isOpen, onClose, currentUser, onTicketCreated }: CreateTicketModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("sistemas");
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!title.trim()) {
      setValidationError("O título do chamado é obrigatório.");
      return;
    }
    if (description.trim().length < 10) {
      setValidationError("A descrição do chamado deve ter pelo menos 10 caracteres.");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("oxetech-helpdesk:token");
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          requesterId: currentUser.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar chamado.");
      }

      // Success
      setTitle("");
      setDescription("");
      setCategory("sistemas");
      onTicketCreated();
      onClose();
    } catch (err: any) {
      setValidationError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <header className="modal-header">
          <h2>Novo Chamado</h2>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </header>

        <form onSubmit={handleSubmit} className="modal-form">
          {validationError && (
            <div className="modal-error-badge">
              ⚠️ {validationError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="ticket-title">Título do Chamado</label>
            <input
              type="text"
              id="ticket-title"
              className="form-control"
              placeholder="Ex: Erro ao acessar o portal acadêmico"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="ticket-category">Categoria</label>
            <select
              id="ticket-category"
              className="select-input form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={submitting}
              style={{ width: "100%" }}
            >
              <option value="sistemas">Sistemas (Software)</option>
              <option value="infra">Infraestrutura (Hardware/Rede)</option>
              <option value="academico">Acadêmico (Secretaria/Aulas)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="ticket-desc">Descrição Detalhada</label>
            <textarea
              id="ticket-desc"
              className="form-control text-area"
              rows={4}
              placeholder="Descreva detalhadamente o problema ou solicitação..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
            ></textarea>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={submitting}
            >
              {submitting ? "Criando..." : "Criar Chamado"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
