export default function ExecutionWorkspaceLoading() {
  return (
    <main className="workspace-page">
      <div
        className="workspace-loading"
        aria-label="Carregando backlog de execucao"
      >
        <div className="workspace-loading__sidebar">
          <span>Backlog de execucao</span>
        </div>
        <div className="workspace-loading__main">
          <span>Converter em tarefa</span>
        </div>
        <div className="workspace-loading__detail" />
      </div>
    </main>
  );
}
