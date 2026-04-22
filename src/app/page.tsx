import Link from "next/link";

export default function HomePage() {
  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">OpsCore</p>
        <h1>Operacao organizada, rastreavel e pronta para decisao</h1>
        <p className="hero-copy">
          Consolide entradas, tarefas, agenda e panorama em um fluxo unico para
          entender pressao operacional, manter origem vinculada e decidir o
          proximo passo com base nos estados reais do sistema.
        </p>
        <div className="hero-actions">
          <Link className="button button--primary" href="/panorama">
            Abrir panorama
          </Link>
          <Link className="button button--secondary" href="/inbox">
            Ver inbox
          </Link>
        </div>
      </section>
    </main>
  );
}
