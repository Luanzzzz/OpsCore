export default function InboxWorkspaceLoading() {
  return (
    <main className="workspace-page">
      <div className="workspace-loading" aria-label="Carregando fila operacional">
        <div className="workspace-loading__sidebar" />
        <div className="workspace-loading__main" />
        <div className="workspace-loading__detail" />
      </div>
    </main>
  );
}
