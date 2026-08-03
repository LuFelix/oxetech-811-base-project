import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";

interface RegisterProps {
  onBackToLogin: () => void;
}

const API_BASE_URL = "http://localhost:3000/api";

export function Register({ onBackToLogin }: RegisterProps) {
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Todos os campos obrigatórios (Nome, E-mail e Senha) devem ser preenchidos.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve conter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          inviteCode: inviteCode.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao realizar o cadastro");
      }

      setSuccess(true);
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
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
            <span className="logo">📝</span>
          </div>
          <h1>Criar Conta</h1>
          <p className="subtitle">Cadastre-se para acessar o helpdesk</p>
        </header>

        {success ? (
          <div className="success-state" style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <span style={{ fontSize: "3rem" }}>✅</span>
            <h3 style={{ marginTop: "1rem", color: "var(--text-primary)" }}>Cadastro realizado!</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
              Redirecionando para a tela de login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {error && (
              <div className="modal-error-badge" style={{ margin: 0 }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="reg-name">Nome Completo *</label>
              <input
                id="reg-name"
                type="text"
                className="form-control"
                placeholder="Ex: Ana Beatriz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">E-mail *</label>
              <input
                id="reg-email"
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
              <label htmlFor="reg-password">Senha (mín. 6 caracteres) *</label>
              <input
                id="reg-password"
                type="password"
                className="form-control"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-invite">Código de Convite (Opcional)</label>
              <input
                id="reg-invite"
                type="text"
                className="form-control"
                placeholder="Código para Suporte ou Professor"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                disabled={loading}
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
              {loading ? "Cadastrando..." : "Cadastrar Conta"}
            </button>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button
                type="button"
                className="btn-back-to-login"
                onClick={onBackToLogin}
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
                Já tem uma conta? Faça Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
