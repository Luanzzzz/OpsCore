export default function PanoramaWorkspaceLoading() {
  return (
    <main className="workspace-page">
      <div className="workspace-loading" aria-label="Carregando panorama">
        <div className="workspace-loading__sidebar">
          <span>Panorama operacional</span>
        </div>
        <div className="workspace-loading__main">
          <span>Modulos, sinais e prontidao</span>
        </div>
        <div className="workspace-loading__detail" />
      </div>
    </main>
  );
}
