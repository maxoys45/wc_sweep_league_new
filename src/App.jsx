import { useEffect, useState } from "react";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";

const routes = {
  "/": LeaderboardPage,
  "/results": ResultsPage,
};

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const Page = routes[path] || LeaderboardPage;

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(event, nextPath) {
    event.preventDefault();
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  }

  return (
    <div className="app">
      <header className="site-header">
        <div>
          <p className="eyebrow">USA 2026 World Cup</p>
          <h1>Stars & Stripes Sweep</h1>
        </div>
        <nav aria-label="Main navigation">
          <a className={path === "/" ? "active" : ""} href="/" onClick={(event) => navigate(event, "/")}>
            Leaderboard
          </a>
          <a
            className={path === "/results" ? "active" : ""}
            href="/results"
            onClick={(event) => navigate(event, "/results")}
          >
            Results
          </a>
        </nav>
      </header>
      <main>
        <Page />
      </main>
    </div>
  );
}
