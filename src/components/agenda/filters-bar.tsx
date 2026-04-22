"use client";

import React from "react";

import type {
  AgendaKind,
  AgendaLinkedType,
  AgendaSort,
  AgendaStatus,
  AgendaUrgencyState
} from "@/types/agenda";

export type AgendaWorkspaceFilters = {
  kind: AgendaKind | "all";
  linkedType: AgendaLinkedType | "all";
  sort: AgendaSort;
  status: AgendaStatus | "all";
  urgencyState: AgendaUrgencyState | "all";
};

type FiltersBarProps = {
  filters: AgendaWorkspaceFilters;
  onChange: (filters: AgendaWorkspaceFilters) => void;
};

export function FiltersBar({ filters, onChange }: FiltersBarProps) {
  return (
    <div className="filters-bar agenda-filters">
      <label className="filters-bar__field">
        <span>Status</span>
        <select
          aria-label="Filtrar agenda por status"
          onChange={(event) =>
            onChange({
              ...filters,
              status: event.target.value as AgendaWorkspaceFilters["status"]
            })
          }
          value={filters.status}
        >
          <option value="all">Todos</option>
          <option value="Aberto">Aberto</option>
          <option value="Concluido">Concluido</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </label>

      <label className="filters-bar__field">
        <span>Tipo</span>
        <select
          aria-label="Filtrar agenda por tipo"
          onChange={(event) =>
            onChange({
              ...filters,
              kind: event.target.value as AgendaWorkspaceFilters["kind"]
            })
          }
          value={filters.kind}
        >
          <option value="all">Todos</option>
          <option value="follow_up">Follow-up</option>
          <option value="deadline">Prazo</option>
          <option value="commitment">Compromisso</option>
        </select>
      </label>

      <label className="filters-bar__field">
        <span>Origem</span>
        <select
          aria-label="Filtrar agenda por origem"
          onChange={(event) =>
            onChange({
              ...filters,
              linkedType:
                event.target.value as AgendaWorkspaceFilters["linkedType"]
            })
          }
          value={filters.linkedType}
        >
          <option value="all">Todas</option>
          <option value="inbox">Inbox</option>
          <option value="task">Tarefa</option>
        </select>
      </label>

      <label className="filters-bar__field">
        <span>Estado temporal</span>
        <select
          aria-label="Filtrar agenda por estado temporal"
          onChange={(event) =>
            onChange({
              ...filters,
              urgencyState:
                event.target.value as AgendaWorkspaceFilters["urgencyState"]
            })
          }
          value={filters.urgencyState}
        >
          <option value="all">Todos</option>
          <option value="vencido">Vencido</option>
          <option value="hoje">Hoje</option>
          <option value="proximo">Proximo</option>
          <option value="futuro">Futuro</option>
        </select>
      </label>

      <label className="filters-bar__field">
        <span>Ordenar</span>
        <select
          aria-label="Ordenar agenda"
          onChange={(event) =>
            onChange({
              ...filters,
              sort: event.target.value as AgendaWorkspaceFilters["sort"]
            })
          }
          value={filters.sort}
        >
          <option value="urgency">Risco temporal</option>
          <option value="dueAt">Vencimento</option>
          <option value="recent">Atualizacao recente</option>
        </select>
      </label>
    </div>
  );
}
