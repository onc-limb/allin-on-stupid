import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer class="app-footer">
      <div class="footer-container">
        <p class="footer-text">
          &copy; {currentYear} All In On Stupid - くだらないゲームで技術を学ぶ
        </p>
      </div>
    </footer>
  );
}
