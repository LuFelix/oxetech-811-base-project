import React from "react";

interface SummaryData {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  urgent: number;
}

interface DashboardStatsProps {
  summary: SummaryData;
}

export function DashboardStats({ summary }: DashboardStatsProps) {
  const total = summary.open + summary.in_progress + summary.resolved + summary.closed;
  const resolvedOrClosed = summary.resolved + summary.closed;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <span className="label">Total de Chamados</span>
        <span className="value">{total}</span>
      </div>
      <div className="stat-card">
        <span className="label" style={{ color: "var(--status-open)" }}>Abertos</span>
        <span className="value">{summary.open}</span>
      </div>
      <div className="stat-card">
        <span className="label" style={{ color: "var(--status-resolved)" }}>Resolvidos / Fechados</span>
        <span className="value">{resolvedOrClosed}</span>
      </div>
      <div className="stat-card">
        <span className="label" style={{ color: "var(--priority-urgent)" }}>Prioridade Urgente</span>
        <span className="value">{summary.urgent}</span>
      </div>
    </div>
  );
}
