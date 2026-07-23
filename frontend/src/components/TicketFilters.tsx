import React from "react";

interface TicketFiltersProps {
  search: string;
  category: string;
  status: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function TicketFilters({
  search,
  category,
  status,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
}: TicketFiltersProps) {
  return (
    <div className="filter-bar">
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Buscar chamados por título ou descrição..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="category-select">Categoria:</label>
        <select
          id="category-select"
          className="select-input"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">Todas</option>
          <option value="sistemas">Sistemas</option>
          <option value="infra">Infraestrutura</option>
          <option value="academico">Acadêmico</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="status-select">Status:</label>
        <select
          id="status-select"
          className="select-input"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="open">Aberto</option>
          <option value="in_progress">Em Progresso</option>
          <option value="resolved">Resolvido</option>
          <option value="closed">Fechado</option>
        </select>
      </div>
    </div>
  );
}
