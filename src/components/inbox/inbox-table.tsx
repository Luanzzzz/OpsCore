"use client";

import React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";

import type { WorkspaceFilters } from "./filters-bar";

import type { InboxListItem } from "@/types/inbox";

const columnHelper = createColumnHelper<InboxListItem>();

const PRIORITY_WEIGHT = {
  Baixa: 0,
  Media: 1,
  Alta: 2,
  Critica: 3
} as const;

type InboxTableProps = {
  filters: WorkspaceFilters;
  items: InboxListItem[];
  onSelectItem: (id: number) => void;
  selectedId: number | null;
};

function sortItems(items: InboxListItem[], filters: WorkspaceFilters) {
  return [...items]
    .filter((item) => filters.status === "all" || item.status === filters.status)
    .filter(
      (item) => filters.priority === "all" || item.priorityReviewed === filters.priority
    )
    .sort((left, right) => {
      if (filters.sort === "recent") {
        return (
          new Date(right.lastActivityAt).getTime() -
          new Date(left.lastActivityAt).getTime()
        );
      }

      const priorityDelta =
        PRIORITY_WEIGHT[right.priorityReviewed] -
        PRIORITY_WEIGHT[left.priorityReviewed];

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return (
        new Date(left.lastActivityAt).getTime() -
        new Date(right.lastActivityAt).getTime()
      );
    });
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function InboxTable({
  filters,
  items,
  onSelectItem,
  selectedId
}: InboxTableProps) {
  const rows = sortItems(items, filters);
  const table = useReactTable({
    columns: [
      columnHelper.accessor("title", {
        header: "Titulo",
        cell: (info) => info.getValue()
      }),
      columnHelper.accessor("source", {
        header: "Origem",
        cell: (info) => info.getValue()
      }),
      columnHelper.accessor("summaryShort", {
        header: "Resumo curto",
        cell: (info) => info.getValue()
      }),
      columnHelper.accessor("priorityReviewed", {
        header: "Prioridade",
        cell: (info) => info.getValue()
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => info.getValue()
      }),
      columnHelper.accessor("waitingOnResponse", {
        header: "Aguardando resposta",
        cell: (info) => (info.getValue() ? "Sim" : "Nao")
      }),
      columnHelper.accessor("lastActivityAt", {
        header: "Ultima atividade",
        cell: (info) => formatDateLabel(info.getValue())
      })
    ],
    data: rows,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className="inbox-table">
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
                    {cell.column.id === "priorityReviewed" ? (
                      <span className={`priority-badge priority-badge--${item.priorityReviewed.toLowerCase()}`}>
                        {item.priorityReviewed}
                      </span>
                    ) : cell.column.id === "status" ? (
                      <span className="status-chip">{item.status}</span>
                    ) : flexRender(cell.column.columnDef.cell, cell.getContext())}
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
