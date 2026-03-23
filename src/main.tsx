import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Adicionar estrelas cadentes ao body (apenas 3 para efeito sutil)
const shootingStarsContainer = document.createElement('div');
shootingStarsContainer.id = 'shooting-stars-container';
for (let i = 0; i < 3; i++) {
  const star = document.createElement('div');
  star.className = 'shooting-star';
  shootingStarsContainer.appendChild(star);
}
document.body.appendChild(shootingStarsContainer);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
