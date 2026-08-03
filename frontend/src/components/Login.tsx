import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface LoginProps {
  onLogin: (user: User, token: string) => void;
  onNavigateToRegister: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export function Login({ onLogin, onNavigateToRegister }: LoginProps) {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Por favor, preencha o e-mail e a senha.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "E-mail ou senha incorretos.");
      }

      onLogin(data.user, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="auth-top-bar">
        <button className="auth-theme-toggle" onClick={toggleTheme} title="Alternar Tema">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      <div className="login-card">
        <header className="login-header">
          <div className="logo-container">
            <span className="logo">🚀</span>
          </div>
          <h1>Oxetech Helpdesk</h1>
          <p className="subtitle">Faça login para gerenciar seus chamados</p>
        </header>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {error && (
            <div className="modal-error-badge" style={{ margin: 0 }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              placeholder="Ex: ana@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Senha</label>
            <input
              id="login-password"
              type="password"
              className="form-control"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "0.85rem",
              borderRadius: "14px",
              fontWeight: 600,
              marginTop: "0.5rem",
              background: "var(--primary-gradient)",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
            }}
            disabled={loading}
          >
            {loading ? "Acessando..." : "Acessar Helpdesk"}
          </button>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
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
              disabled={loading}
            >
              Não tem uma conta? Cadastre-se
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
