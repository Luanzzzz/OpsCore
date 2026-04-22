"use client";

export default function AgendaWorkspaceError({ reset }: { reset: () => void }) {
  return (
    <main className="workspace-page">
      <section className="workspace-error-panel">
        <p className="workspace-panel__eyebrow">Agenda operacional</p>
        <h1>Nao foi possivel carregar a agenda.</h1>
        <p>
          Atualize a tela ou revise a ultima alteracao de prazo antes de tentar
          novamente.
        </p>
        <p>Follow-ups e vencimentos permanecem vinculados a entradas e tarefas.</p>
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
