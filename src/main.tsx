import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Support deep links on static hosting (paired with public/404.html)
const redirectPath = sessionStorage.getItem('lovable_redirect_path');
if (redirectPath) {
  sessionStorage.removeItem('lovable_redirect_path');
  window.history.replaceState(null, '', redirectPath);
}

createRoot(document.getElementById("root")!).render(<App />);

