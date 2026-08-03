import React from "react";

interface SummaryData {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  urgent: number;
}

interface Ticket {
  id: string;
  category: "sistemas" | "infra" | "academico" | string;
  status: "open" | "in_progress" | "resolved" | "closed" | string;
}

interface DashboardStatsProps {
  summary: SummaryData;
  tickets: Ticket[];
}

export function DashboardStats({ summary, tickets }: DashboardStatsProps) {
  const total = summary.open + summary.in_progress + summary.resolved + summary.closed;
  const resolvedOrClosed = summary.resolved + summary.closed;

  // Calculate Category distribution from tickets array
  const categoryCounts = tickets.reduce(
    (acc, ticket) => {
      const cat = ticket.category as "sistemas" | "infra" | "academico";
      if (acc[cat] !== undefined) {
        acc[cat]++;
      }
      return acc;
    },
    { sistemas: 0, infra: 0, academico: 0 }
  );

  const getPercent = (value: number, max: number) => {
    if (max === 0) return 0;
    return Math.round((value / max) * 100);
  };

  const statusList = [
    { label: "Aberto", value: summary.open, color: "var(--status-open, #ef4444)" },
    { label: "Em Progresso", value: summary.in_progress, color: "var(--status-in-progress, #f59e0b)" },
    { label: "Resolvido", value: summary.resolved, color: "var(--status-resolved, #10b981)" },
    { label: "Fechado", value: summary.closed, color: "var(--status-closed, #64748b)" },
  ];

  const categoryList = [
    { label: "Sistemas", value: categoryCounts.sistemas, color: "#6366f1" },
    { label: "Infraestrutura", value: categoryCounts.infra, color: "#a855f7" },
    { label: "Acadêmico", value: categoryCounts.academico, color: "#ec4899" },
  ];

  const totalCategories = categoryCounts.sistemas + categoryCounts.infra + categoryCounts.academico;

  return (
    <div className="dashboard-stats-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2rem" }}>
      {/* Stat Cards */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <div className="stat-card" style={{ padding: "1.25rem", borderRadius: "12px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span className="label" style={{ fontSize: "0.85rem", opacity: 0.7, color: "var(--text-muted, #94a3b8)" }}>Total de Chamados</span>
          <span className="value" style={{ fontSize: "2rem", fontWeight: "bold" }}>{total}</span>
        </div>
        <div className="stat-card" style={{ padding: "1.25rem", borderRadius: "12px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span className="label" style={{ fontSize: "0.85rem", color: "var(--status-open, #ef4444)" }}>Abertos</span>
          <span className="value" style={{ fontSize: "2rem", fontWeight: "bold" }}>{summary.open}</span>
        </div>
        <div className="stat-card" style={{ padding: "1.25rem", borderRadius: "12px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span className="label" style={{ fontSize: "0.85rem", color: "var(--status-resolved, #10b981)" }}>Resolvidos / Fechados</span>
          <span className="value" style={{ fontSize: "2rem", fontWeight: "bold" }}>{resolvedOrClosed}</span>
        </div>
        <div className="stat-card" style={{ padding: "1.25rem", borderRadius: "12px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span className="label" style={{ fontSize: "0.85rem", color: "var(--priority-urgent, #ef4444)" }}>Prioridade Urgente</span>
          <span className="value" style={{ fontSize: "2rem", fontWeight: "bold" }}>{summary.urgent}</span>
        </div>
      </div>

      {/* Analytical Charts */}
      <div className="charts-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {/* Status Distribution */}
        <div className="chart-card" style={{ padding: "1.5rem", borderRadius: "16px", background: "var(--card-bg, rgba(255, 255, 255, 0.03))", border: "1px solid rgba(255, 255, 255, 0.08)", backdropFilter: "blur(8px)" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1.25rem", color: "var(--text-main, #f8fafc)" }}>📊 Distribuição por Status</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {statusList.map((status) => {
              const percent = getPercent(status.value, total);
              return (
                <div key={status.label} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <span>{status.label}</span>
                    <strong style={{ color: status.color }}>{status.value} ({percent}%)</strong>
                  </div>
                  <div style={{ width: "100%", height: "8px", borderRadius: "4px", background: "rgba(255, 255, 255, 0.08)", overflow: "hidden" }}>
                    <div style={{ width: `${percent}%`, height: "100%", borderRadius: "4px", background: status.color, transition: "width 0.4s ease-out" }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="chart-card" style={{ padding: "1.5rem", borderRadius: "16px", background: "var(--card-bg, rgba(255, 255, 255, 0.03))", border: "1px solid rgba(255, 255, 255, 0.08)", backdropFilter: "blur(8px)" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1.25rem", color: "var(--text-main, #f8fafc)" }}>🏷️ Distribuição por Categoria</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {categoryList.map((cat) => {
              const percent = getPercent(cat.value, totalCategories);
              return (
                <div key={cat.label} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <span>{cat.label}</span>
                    <strong style={{ color: cat.color }}>{cat.value} ({percent}%)</strong>
                  </div>
                  <div style={{ width: "100%", height: "8px", borderRadius: "4px", background: "rgba(255, 255, 255, 0.08)", overflow: "hidden" }}>
                    <div style={{ width: `${percent}%`, height: "100%", borderRadius: "4px", background: cat.color, transition: "width 0.4s ease-out" }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
