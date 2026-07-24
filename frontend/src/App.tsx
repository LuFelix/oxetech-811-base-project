import React, { useState, useEffect } from "react";
import { DashboardStats } from "./components/DashboardStats";
import { TicketFilters } from "./components/TicketFilters";
import { TicketCard } from "./components/TicketCard";

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

interface SummaryData {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  urgent: number;
}

const API_BASE_URL = "http://localhost:3000/api";

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [summary, setSummary] = useState<SummaryData>({ open: 0, in_progress: 0, resolved: 0, closed: 0, urgent: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  
  // Filters State
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Users (On Mount)
  useEffect(() => {
    fetch(`${API_BASE_URL}/users`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar usuários");
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        if (data.length > 0) setSelectedUser(data[0].id);
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch Tickets and Summary (Depends on Filters)
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Build Query String
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (category) params.append("category", category);
    if (search) params.append("search", search);

    const ticketsPromise = fetch(`${API_BASE_URL}/tickets?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar os chamados");
        return res.json();
      });

    const summaryPromise = fetch(`${API_BASE_URL}/tickets/summary`)
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar o resumo");
        return res.json();
      });

    Promise.all([ticketsPromise, summaryPromise])
      .then(([ticketsData, summaryData]) => {
        setTickets(ticketsData);
        setSummary(summaryData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [search, category, status]);

  return (
    <>
      <div className="bg-gradients">
        <div className="grad-1"></div>
        <div className="grad-2"></div>
      </div>

      <div className="app-container">
        {/* Navbar */}
        <nav className="top-navbar">
          <div className="navbar-brand">
            <span style={{ fontSize: "1.5rem" }}>🚀</span>
            <h1>Oxetech Helpdesk</h1>
          </div>

          <div className="user-selector">
            <label htmlFor="user-select">Simular Usuário:</label>
            <select
              id="user-select"
              className="select-input"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role === "student" ? "Aluno" : user.role === "teacher" ? "Prof" : "Suporte"})
                </option>
              ))}
            </select>
          </div>
        </nav>

        {/* Stats Row */}
        <DashboardStats summary={summary} />

        {/* Filters */}
        <TicketFilters
          search={search}
          category={category}
          status={status}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onStatusChange={setStatus}
        />

        {/* Tickets Section */}
        <section>
          <div className="tickets-header">
            <h2 className="tickets-title">Chamados Registrados</h2>
            <span className="tickets-count">
              {loading ? "Carregando..." : `${tickets.length} chamados encontrados`}
            </span>
          </div>

          {error && (
            <div className="empty-state">
              <span className="empty-icon">⚠️</span>
              <h3>Erro de Conexão</h3>
              <p>{error}. Verifique se o container do backend está ativo na porta 3000.</p>
            </div>
          )}

          {loading && !error && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Buscando dados da API...</p>
            </div>
          )}

          {!loading && !error && tickets.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">📂</span>
              <h3>Nenhum chamado encontrado</h3>
              <p>Tente alterar os termos de busca ou filtros selecionados.</p>
            </div>
          )}

          {!loading && !error && tickets.length > 0 && (
            <div className="tickets-grid">
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default App;
