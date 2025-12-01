import { A } from "@solidjs/router";
import "./Header.css";

export default function Header() {
  return (
    <header class="app-header">
      <div class="header-container">
        <h1 class="header-title">
          <A href="/">All In On Stupid</A>
        </h1>
      </div>
    </header>
  );
}
