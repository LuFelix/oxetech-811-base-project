import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface LoginProps {
  onLogin: (user: User) => void;
  onNavigateToRegister: () => void;
}

const API_BASE_URL = "http://localhost:3000/api";

export function Login({ onLogin, onNavigateToRegister }: LoginProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/users`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar os perfis de simulação");
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const getRoleBadgeLabel = (role: string) => {
    if (role === "student") return "Aluno";
    if (role === "teacher") return "Professor";
    return "Suporte";
  };

  const getRoleIcon = (role: string) => {
    if (role === "student") return "🎓";
    if (role === "teacher") return "👨‍🏫";
    return "🛠️";
  };

  return (
    <div className="login-wrapper">
      <div className="theme-toggle-container">
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Alternar Tema">
          {theme === "dark" ? "☀️ Modo Claro" : "🌙 Modo Escuro"}
        </button>
      </div>

      <div className="login-card">
        <header className="login-header">
          <div className="logo-container">
            <span className="logo">🚀</span>
          </div>
          <h1>Oxetech Helpdesk</h1>
          <p className="subtitle">Selecione um perfil para simular o acesso</p>
        </header>

        {loading && (
          <div className="loading-state" style={{ background: "transparent", border: "none" }}>
            <div className="spinner"></div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Buscando perfis...</p>
          </div>
        )}

        {error && (
          <div className="empty-state" style={{ background: "transparent", border: "none" }}>
            <span className="empty-icon">⚠️</span>
            <h3 style={{ fontSize: "1.1rem" }}>Erro ao carregar perfis</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              {error}. Certifique-se de que o backend está ativo na porta 3000.
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="profile-selection-grid">
              {users.map((user) => (
                <button
                  key={user.id}
                  className="profile-select-card"
                  onClick={() => onLogin(user)}
                >
                  <span className="profile-avatar">{getRoleIcon(user.role)}</span>
                  <div className="profile-info">
                    <span className="profile-name">{user.name}</span>
                    <span className="profile-email">{user.email}</span>
                  </div>
                  <span className={`badge badge-role-${user.role} profile-role-badge`}>
                    {getRoleBadgeLabel(user.role)}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <button
                type="button"
                className="btn-back-to-login"
                onClick={onNavigateToRegister}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  textDecoration: "underline",
                }}
              >
                Não tem uma conta? Cadastre-se
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
