import React, { type ReactNode } from "react";

type StatusBlockProps = {
  emphasis?: "accent" | "default" | "warning";
  label: string;
  value: ReactNode;
};

export function StatusBlock({
  emphasis = "default",
  label,
  value
}: StatusBlockProps) {
  return (
    <article className={`status-block status-block--${emphasis}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
