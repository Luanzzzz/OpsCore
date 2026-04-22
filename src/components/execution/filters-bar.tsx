"use client";

import React from "react";

import type {
  TaskAgeBucket,
  TaskPriority,
  TaskSort,
  TaskStatus
} from "@/types/tasks";

export type WorkspaceFilters = {
  ageBucket: TaskAgeBucket;
  owner: "all" | "unassigned" | "assigned";
  priority: TaskPriority | "all";
  sort: TaskSort;
  status: TaskStatus | "all";
};

type FiltersBarProps = {
  filters: WorkspaceFilters;
  onChange: (filters: WorkspaceFilters) => void;
};

export function FiltersBar({ filters, onChange }: FiltersBarProps) {
  return (
    <div className="filters-bar execution-filters">
      <label className="filters-bar__field">
        <span>Filtrar por status</span>
        <select
          aria-label="Filtrar por status"
          onChange={(event) =>
            onChange({
              ...filters,
              status: event.target.value as WorkspaceFilters["status"]
            })
          }
          value={filters.status}
        >
          <option value="all">Todos</option>
          <option value="Nao iniciada">Nao iniciada</option>
          <option value="Em andamento">Em andamento</option>
          <option value="Bloqueada">Bloqueada</option>
          <option value="Concluida">Concluida</option>
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
        <span>Responsavel</span>
        <select
          aria-label="Responsavel"
          onChange={(event) =>
            onChange({
              ...filters,
              owner: event.target.value as WorkspaceFilters["owner"]
            })
          }
          value={filters.owner}
        >
          <option value="all">Todos</option>
          <option value="unassigned">Sem responsavel</option>
          <option value="assigned">Com responsavel</option>
        </select>
      </label>

      <label className="filters-bar__field">
        <span>Envelhecimento</span>
        <select
          aria-label="Envelhecimento"
          onChange={(event) =>
            onChange({
              ...filters,
              ageBucket: event.target.value as WorkspaceFilters["ageBucket"]
            })
          }
          value={filters.ageBucket}
        >
          <option value="all">Todas</option>
          <option value="fresh">Menos de 24h</option>
          <option value="aging">24h a 48h</option>
          <option value="stale">48h ou mais</option>
        </select>
      </label>

      <label className="filters-bar__field">
        <span>Ordenar</span>
        <select
          aria-label="Ordenar"
          onChange={(event) =>
            onChange({
              ...filters,
              sort: event.target.value as WorkspaceFilters["sort"]
            })
          }
          value={filters.sort}
        >
          <option value="priority">Prioridade e envelhecimento</option>
          <option value="oldest">Mais antigas</option>
          <option value="recent">Mais recentes</option>
        </select>
      </label>
    </div>
  );
}
