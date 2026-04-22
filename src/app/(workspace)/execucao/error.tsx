"use client";

export default function ExecutionWorkspaceError({
  reset
}: {
  reset: () => void;
}) {
  return (
    <main className="workspace-page">
      <section className="workspace-error-panel">
        <p className="workspace-panel__eyebrow">Backlog de execucao</p>
        <h1>Nao foi possivel carregar o backlog de execucao.</h1>
        <p>
          Atualize a tela ou revise a ultima conversao realizada antes de
          tentar novamente.
        </p>
        <p>Converter em tarefa continua disponivel para entradas revisadas.</p>
        <button
          className="button button--primary"
          onClick={() => reset()}
          type="button"
        >
          Tentar novamente
        </button>
      </section>
    </main>
  );
}
