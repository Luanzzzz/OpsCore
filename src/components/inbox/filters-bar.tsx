"use client";

import React from "react";

import type { InboxPriority, InboxStatus } from "@/types/inbox";

export type WorkspaceFilters = {
  priority: InboxPriority | "all";
  sort: "priority" | "recent";
  status: InboxStatus | "all";
};

type FiltersBarProps = {
  filters: WorkspaceFilters;
  onChange: (filters: WorkspaceFilters) => void;
};

export function FiltersBar({ filters, onChange }: FiltersBarProps) {
  return (
    <div className="filters-bar">
      <label className="filters-bar__field">
        <span>Filtrar por status</span>
        <select
          aria-label="Filtrar por status"
          onChange={(event) =>
            onChange({ ...filters, status: event.target.value as WorkspaceFilters["status"] })
          }
          value={filters.status}
        >
          <option value="all">Todos</option>
          <option value="Nova">Nova</option>
          <option value="Em analise">Em analise</option>
          <option value="Aguardando resposta">Aguardando resposta</option>
          <option value="Concluida/Arquivada">Concluida/Arquivada</option>
        </select>
      </label>

      <label className="filters-bar__field">
        <span>Filtrar por prioridade</span>
        <select
          aria-label="Filtrar por prioridade"
          onChange={(event) =>
            onChange({
              ...filters,
              priority: event.target.value as WorkspaceFilters["priority"]
            })
          }
          value={filters.priority}
        >
          <option value="all">Todas</option>
          <option value="Baixa">Baixa</option>
          <option value="Media">Media</option>
          <option value="Alta">Alta</option>
          <option value="Critica">Critica</option>
        </select>
      </label>

      <label className="filters-bar__field">
        <span>Ordenar por prioridade</span>
        <select
          aria-label="Ordenar por prioridade"
          onChange={(event) =>
            onChange({ ...filters, sort: event.target.value as WorkspaceFilters["sort"] })
          }
          value={filters.sort}
        >
          <option value="priority">Prioridade e envelhecimento</option>
          <option value="recent">Ultima atividade</option>
        </select>
      </label>
    </div>
  );
}
