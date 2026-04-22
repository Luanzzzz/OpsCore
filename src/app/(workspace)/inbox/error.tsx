"use client";

export default function InboxWorkspaceError({
  reset
}: {
  reset: () => void;
}) {
  return (
    <main className="workspace-page">
      <section className="workspace-error-panel">
        <p className="workspace-panel__eyebrow">OpsCore</p>
        <h1>Nao foi possivel carregar a fila operacional.</h1>
        <p>
          Tente atualizar a tela ou revise os dados da entrada mais recente.
        </p>
        <button className="button button--primary" onClick={() => reset()} type="button">
          Tentar novamente
        </button>
      </section>
    </main>
  );
}
