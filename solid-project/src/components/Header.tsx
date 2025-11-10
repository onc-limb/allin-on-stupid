import { A } from "@solidjs/router";
import "./Header.css";

export default function Header() {
  return (
    <header class="app-header">
      <div class="header-container">
        <h1 class="header-title">
          <A href="/">All In On Stupid</A>
        </h1>
        <nav class="header-nav">
          <A href="/" class="nav-link" activeClass="active" end>
            ホーム
          </A>
          <A href="/scroll-trial" class="nav-link" activeClass="active">
            スクロールタイムアタック
          </A>
          <A href="/password-typing" class="nav-link" activeClass="active">
            パスワードタイピング
          </A>
          <A href="/binary-calc" class="nav-link" activeClass="active">
            バイナリ計算
          </A>
        </nav>
      </div>
    </header>
  );
}
