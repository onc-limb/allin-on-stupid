import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer class="app-footer">
      <div class="footer-container">
        <p class="footer-text">
          &copy; {currentYear} onclimb(おんりむ)
        </p>
      </div>
    </footer>
  );
}
