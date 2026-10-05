import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function PageShell({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return (
    <div className="app-shell">
      <div className="sky-decor" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span></div>
      <header className={`site-header ${compact ? "site-header--compact" : ""}`}>
        <Link className="brand" to="/" aria-label="Mahirul Qur’an Kids home">
          <span className="brand-lantern" aria-hidden="true">☾</span>
          <span>Mahirul Qur’an</span>
        </Link>
      </header>
      <main className="page-content">{children}</main>
      <div className="garden-decor" aria-hidden="true"><span>✿</span><span>❋</span><span>✿</span><span>❋</span></div>
    </div>
  );
}
