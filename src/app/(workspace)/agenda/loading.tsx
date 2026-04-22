export default function AgendaWorkspaceLoading() {
  return (
    <main className="workspace-page">
      <div className="workspace-loading" aria-label="Carregando agenda">
        <div className="workspace-loading__sidebar">
          <span>Agenda operacional</span>
        </div>
        <div className="workspace-loading__main">
          <span>Vencimentos e follow-ups</span>
        </div>
        <div className="workspace-loading__detail" />
      </div>
    </main>
  );
}
