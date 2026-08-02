import React, { useState, useEffect } from "react";
import { DashboardStats } from "./components/DashboardStats";
import { TicketFilters } from "./components/TicketFilters";
import { TicketCard } from "./components/TicketCard";
import { Login } from "./components/Login";
import { CreateTicketModal } from "./components/CreateTicketModal";
import { TicketDetails } from "./components/TicketDetails";
import { useTheme } from "./context/ThemeContext";

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
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("oxetech-helpdesk:user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [summary, setSummary] = useState<SummaryData>({ open: 0, in_progress: 0, resolved: 0, closed: 0, urgent: 0 });
  
  // Filters State
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const { theme, toggleTheme } = useTheme();

  // Fetch Tickets and Summary (Depends on Filters - only if user is logged in)
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

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
  }, [currentUser, search, category, status, refreshTrigger]);

  const handleLogin = (user: User) => {
    localStorage.setItem("oxetech-helpdesk:user", JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("oxetech-helpdesk:user");
    setCurrentUser(null);
    setSelectedTicketId(null);
  };

  const getRoleBadgeLabel = (role: string) => {
    if (role === "student") return "Aluno";
    if (role === "teacher") return "Prof";
    return "Suporte";
  };

  const getRoleIcon = (role: string) => {
    if (role === "student") return "🎓";
    if (role === "teacher") return "👨‍🏫";
    return "🛠️";
  };

  // Render Login if no session
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const userInitial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "?";

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

          <div className="navbar-actions">
            {/* Theme Toggle */}
            <button className="theme-toggle-btn" onClick={toggleTheme} title="Alternar Tema">
              {theme === "dark" ? "☀️ Claro" : "🌙 Escuro"}
            </button>

            {/* Simulated User Info */}
            <div className="user-profile-nav">
              <div className="avatar-circle">{getRoleIcon(currentUser.role)}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{currentUser.name}</span>
                <span className="role-name">{getRoleBadgeLabel(currentUser.role)}</span>
              </div>
            </div>

            {/* Logout */}
            <button className="btn-logout" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </nav>

        {selectedTicketId ? (
          <TicketDetails
            ticketId={selectedTicketId}
            currentUser={currentUser}
            onBack={() => {
              setSelectedTicketId(null);
              setRefreshTrigger((prev) => prev + 1); // reload stats and list
            }}
          />
        ) : (
          <>
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
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span className="tickets-count">
                    {loading ? "Carregando..." : `${tickets.length} chamados encontrados`}
                  </span>
                  <button className="btn-create-ticket" onClick={() => setIsModalOpen(true)}>
                    ➕ Novo Chamado
                  </button>
                </div>
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
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onSelect={() => setSelectedTicketId(ticket.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
        onTicketCreated={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </>
  );
}

export default App;
