import { useEffect, useState } from "react";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";
import canadaFlag from "./assets/ca.svg";
import mexicoFlag from "./assets/mx.svg";
import usaFlag from "./assets/us.svg";

const routes = {
  "/": LeaderboardPage,
  "/results": ResultsPage,
};

const hostFlags = [
  { name: "Canada", src: canadaFlag },
  { name: "USA", src: usaFlag },
  { name: "Mexico", src: mexicoFlag },
];

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const Page = routes[path] || LeaderboardPage;

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  function navigate(event, nextPath) {
    event.preventDefault();
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="header-title">
          <div className="eyebrow-row">
            <p className="eyebrow">Canada • USA • Mexico 2026</p>
            <div className="host-flags" aria-label="2026 host countries">
              {hostFlags.map((flag) => (
                <img key={flag.name} src={flag.src} alt={flag.name} title={flag.name} />
              ))}
            </div>
          </div>
          <h1>League of Credgends Sweep League</h1>
        </div>
        <div className="header-actions">
          <div className="theme-toggle" aria-label="Theme">
            <button
              className={theme === "light" ? "active" : ""}
              type="button"
              onClick={() => setTheme("light")}
              aria-label="Use light theme"
            >
              ☀
            </button>
            <button
              className={theme === "league" ? "active league-mark" : "league-mark"}
              type="button"
              onClick={() => setTheme("league")}
              aria-label="Use League of Legends theme"
            >
              L
            </button>
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
        </div>
      </header>
      <main>
        <Page />
      </main>
    </div>
  );
}
