"use client";

export default function PanoramaWorkspaceError({ reset }: { reset: () => void }) {
  return (
    <main className="workspace-page">
      <section className="workspace-error-panel">
        <p className="workspace-panel__eyebrow">Panorama operacional</p>
        <h1>Nao foi possivel carregar o panorama.</h1>
        <p>
          Atualize a tela para recompor a leitura operacional a partir dos
          estados atuais de inbox, tarefas e agenda.
        </p>
        <p>O panorama usa dados internos resumidos e pode ser refeito a qualquer momento.</p>
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
