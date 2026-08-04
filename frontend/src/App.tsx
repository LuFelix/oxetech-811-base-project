import React, { useState, useEffect } from "react";
import { DashboardStats } from "./components/DashboardStats";
import { TicketFilters } from "./components/TicketFilters";
import { TicketCard } from "./components/TicketCard";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
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
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState<"tickets" | "dashboard">("tickets");
  const { theme, toggleTheme } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Fetch Tickets and Summary (Depends on Filters - only if user is logged in)
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    const token = localStorage.getItem("oxetech-helpdesk:token");
    const headers: Record<string, string> = token ? { "Authorization": `Bearer ${token}` } : {};

    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (category) params.append("category", category);
    if (search) params.append("search", search);

    const ticketsPromise = fetch(`${API_BASE_URL}/tickets?${params.toString()}`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar os chamados");
        return res.json();
      });

    const summaryPromise = fetch(`${API_BASE_URL}/tickets/summary`, { headers })
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

  const handleLogin = (user: User, token: string) => {
    localStorage.setItem("oxetech-helpdesk:user", JSON.stringify(user));
    localStorage.setItem("oxetech-helpdesk:token", token);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("oxetech-helpdesk:user");
    localStorage.removeItem("oxetech-helpdesk:token");
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

  // Render Login or Register if no session
  if (!currentUser) {
    if (showRegister) {
      return <Register onBackToLogin={() => setShowRegister(false)} />;
    }
    return <Login onLogin={handleLogin} onNavigateToRegister={() => setShowRegister(true)} />;
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
              {theme === "dark" ? "☀️" : "🌙"} <span className="theme-toggle-text">{theme === "dark" ? "Claro" : "Escuro"}</span>
            </button>

            {/* User Profile Dropdown Menu */}
            <div className="user-profile-menu-container">
              <button 
                className={`profile-menu-trigger ${isProfileMenuOpen ? 'active' : ''}`} 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                title="Menu do Usuário"
              >
                <div className="avatar-circle">{getRoleIcon(currentUser.role)}</div>
                <div className="user-info-text">
                  <span className="user-name">{currentUser.name}</span>
                  <span className="role-name">{getRoleBadgeLabel(currentUser.role)}</span>
                </div>
                <span className="chevron-icon">{isProfileMenuOpen ? "▲" : "▼"}</span>
              </button>

              {isProfileMenuOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <span className="dropdown-user-name">{currentUser.name}</span>
                    <span className="dropdown-user-email">{currentUser.email}</span>
                    <span className="dropdown-user-role-badge">{getRoleBadgeLabel(currentUser.role)}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    🚪 Sair da Conta
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {!selectedTicketId && (
          <div className="tabs-container">
            <button
              className={`tab-button ${activeTab === "tickets" ? "active" : ""}`}
              onClick={() => setActiveTab("tickets")}
            >
              <span className="tab-icon">📋</span> Fila de Chamados
            </button>
            <button
              className={`tab-button ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <span className="tab-icon">📊</span> Painel Geral
            </button>
          </div>
        )}

        {selectedTicketId ? (
          <TicketDetails
            ticketId={selectedTicketId}
            currentUser={currentUser}
            onBack={() => {
              setSelectedTicketId(null);
              setRefreshTrigger((prev) => prev + 1); // reload stats and list
            }}
          />
        ) : activeTab === "dashboard" ? (
          <DashboardStats summary={summary} tickets={tickets} />
        ) : (
          <>
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
                <div className="tickets-header-actions">
                  <span className="tickets-count">
                    <span className="badge-icon">🎫</span>
                    {loading ? "Carregando..." : `${tickets.length} chamados encontrados`}
                  </span>
                  <button className="btn-create-ticket" onClick={() => setIsModalOpen(true)}>
                    <span className="btn-icon">+</span> Novo Chamado
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
