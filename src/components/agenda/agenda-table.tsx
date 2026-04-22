"use client";

import React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";

import type { AgendaWorkspaceFilters } from "./filters-bar";

import type { AgendaListItem, AgendaUrgencyState } from "@/types/agenda";

const columnHelper = createColumnHelper<AgendaListItem>();

const URGENCY_WEIGHT: Record<AgendaUrgencyState, number> = {
  vencido: 0,
  hoje: 1,
  proximo: 2,
  futuro: 3
};

type AgendaTableProps = {
  filters: AgendaWorkspaceFilters;
  items: AgendaListItem[];
  onSelectItem: (id: number) => void;
  selectedId: number | null;
};

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function kindLabel(kind: AgendaListItem["kind"]) {
  const labels = {
    commitment: "Compromisso",
    deadline: "Prazo",
    follow_up: "Follow-up"
  };

  return labels[kind];
}

function urgencyLabel(state: AgendaUrgencyState) {
  const labels = {
    futuro: "Futuro",
    hoje: "Hoje",
    proximo: "Proximo",
    vencido: "Vencido"
  };

  return labels[state];
}

function urgencyClass(state: AgendaUrgencyState) {
  return `status-chip agenda-urgency agenda-urgency--${state}`;
}

function filterItems(items: AgendaListItem[], filters: AgendaWorkspaceFilters) {
  return items
    .filter((item) => filters.status === "all" || item.status === filters.status)
    .filter((item) => filters.kind === "all" || item.kind === filters.kind)
    .filter(
      (item) =>
        filters.linkedType === "all" || item.linkedType === filters.linkedType
    )
    .filter(
      (item) =>
        filters.urgencyState === "all" ||
        item.urgencyState === filters.urgencyState
    );
}

function sortItems(items: AgendaListItem[], filters: AgendaWorkspaceFilters) {
  return [...filterItems(items, filters)].sort((left, right) => {
    if (filters.sort === "recent") {
      return (
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
      );
    }

    if (filters.sort === "dueAt") {
      return new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime();
    }

    const urgencyDelta =
      URGENCY_WEIGHT[left.urgencyState] - URGENCY_WEIGHT[right.urgencyState];

    if (urgencyDelta !== 0) {
      return urgencyDelta;
    }

    return new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime();
  });
}

export function AgendaTable({
  filters,
  items,
  onSelectItem,
  selectedId
}: AgendaTableProps) {
  const rows = sortItems(items, filters);
  const table = useReactTable({
    columns: [
      columnHelper.accessor("kind", {
        header: "Tipo",
        cell: (info) => kindLabel(info.getValue())
      }),
      columnHelper.accessor("title", {
        header: "Agenda",
        cell: (info) => info.getValue()
      }),
      columnHelper.accessor("originTitle", {
        header: "Origem",
        cell: (info) => info.getValue()
      }),
      columnHelper.accessor("ownerName", {
        header: "Responsavel",
        cell: (info) => info.getValue() ?? "Sem responsavel"
      }),
      columnHelper.accessor("dueAt", {
        header: "Vencimento",
        cell: (info) => formatDateLabel(info.getValue())
      }),
      columnHelper.accessor("urgencyState", {
        header: "Estado",
        cell: (info) => urgencyLabel(info.getValue())
      })
    ],
    data: rows,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className="inbox-table agenda-table">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            const item = row.original;
            const isSelected = item.id === selectedId;

            return (
              <tr
                aria-selected={isSelected}
                className={isSelected ? "is-selected" : undefined}
                key={row.id}
                onClick={() => onSelectItem(item.id)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {cell.column.id === "kind" ? (
                      <span className="agenda-kind">
                        {kindLabel(item.kind)}
                      </span>
                    ) : cell.column.id === "urgencyState" ? (
                      <span className={urgencyClass(item.urgencyState)}>
                        {urgencyLabel(item.urgencyState)}
                      </span>
                    ) : cell.column.id === "ownerName" && !item.ownerName ? (
                      <span className="task-owner task-owner--missing">
                        Sem responsavel
                      </span>
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
