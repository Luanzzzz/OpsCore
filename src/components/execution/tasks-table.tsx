"use client";

import React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";

import type { WorkspaceFilters } from "./filters-bar";

import type { TaskListItem, TaskPriority } from "@/types/tasks";

const columnHelper = createColumnHelper<TaskListItem>();

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  Baixa: 0,
  Media: 1,
  Alta: 2,
  Critica: 3
};

type TasksTableProps = {
  filters: WorkspaceFilters;
  items: TaskListItem[];
  onSelectItem: (id: number) => void;
  selectedId: number | null;
};

function filterItems(items: TaskListItem[], filters: WorkspaceFilters) {
  return items
    .filter((item) => filters.status === "all" || item.status === filters.status)
    .filter(
      (item) => filters.priority === "all" || item.priority === filters.priority
    )
    .filter((item) => {
      if (filters.owner === "all") {
        return true;
      }

      if (filters.owner === "unassigned") {
        return !item.ownerName;
      }

      return Boolean(item.ownerName);
    })
    .filter((item) => {
      if (filters.ageBucket === "all") {
        return true;
      }

      if (filters.ageBucket === "fresh") {
        return item.ageHours < 24;
      }

      if (filters.ageBucket === "aging") {
        return item.ageHours >= 24 && item.ageHours < 48;
      }

      return item.ageHours >= 48;
    });
}

function sortItems(items: TaskListItem[], filters: WorkspaceFilters) {
  return [...filterItems(items, filters)].sort((left, right) => {
    if (filters.sort === "oldest") {
      return right.ageHours - left.ageHours;
    }

    if (filters.sort === "recent") {
      return left.ageHours - right.ageHours;
    }

    const priorityDelta =
      PRIORITY_WEIGHT[right.priority] - PRIORITY_WEIGHT[left.priority];

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return right.ageHours - left.ageHours;
  });
}

function priorityClass(priority: TaskPriority) {
  return `priority-badge priority-badge--${priority.toLowerCase()}`;
}

function statusClass(status: TaskListItem["status"]) {
  return `status-chip task-status-chip task-status-chip--${status
    .toLowerCase()
    .replace(/\s+/g, "-")}`;
}

export function TasksTable({
  filters,
  items,
  onSelectItem,
  selectedId
}: TasksTableProps) {
  const rows = sortItems(items, filters);
  const table = useReactTable({
    columns: [
      columnHelper.accessor("title", {
        header: "Tarefa",
        cell: (info) => info.getValue()
      }),
      columnHelper.accessor("ownerName", {
        header: "Responsavel",
        cell: (info) => info.getValue() ?? "Sem responsavel"
      }),
      columnHelper.accessor("priority", {
        header: "Prioridade",
        cell: (info) => info.getValue()
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => info.getValue()
      }),
      columnHelper.accessor("originTitle", {
        header: "Origem",
        cell: (info) => info.getValue()
      }),
      columnHelper.accessor("ageHours", {
        header: "Envelhecimento",
        cell: (info) => `${info.getValue()}h`
      })
    ],
    data: rows,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className="inbox-table execution-table">
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
                    {cell.column.id === "priority" ? (
                      <span className={priorityClass(item.priority)}>
                        {item.priority}
                      </span>
                    ) : cell.column.id === "status" ? (
                      <span className={statusClass(item.status)}>
                        {item.status}
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
