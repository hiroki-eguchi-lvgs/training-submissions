export default function Footer() {
  return (
    <footer>
      <div className="main-inner">
        <div className="footer-container">
          <div className="footer-Column first-Column">
            <h3>PT. Travel Everyday Indonesia</h3>
            <p>
              Grand Floor Zaidin L-Walk,<br />
              Jl. Maju Jaya No. 2,<br />
              Daerah Istimewa Yogyakarta,<br />
              Indonesia 55281
            </p>
            <hr className="footer-line" />
            <div className="company-links">
              <a href="#">About</a>
              <a href="#">Privacy policy</a>
            </div>
            <div className="company-links">
              <a href="#">Terms & Conditions</a>
              <a href="#">Contact</a>
            </div>
          </div>

          <div className="footer-Column">
            <h3>Informations</h3>
            <ul className="footer-links">
              <li><a href="#">How to register as a user</a></li>
              <li><a href="#">Guide to creating travel review</a></li>
              <li><a href="#">Tutorial for making culinary reviews</a></li>
            </ul>
          </div>

          <div className="footer-Column">
            <h3>Follow us</h3>
            <ul className="footer-links">
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Facebook</a></li>
              <li><a href="#">Twitter</a></li>
              <li><a href="#">Youtube</a></li>
            </ul>
          </div>

          <div className="footer-Column app-Column">
            <h3>Download app</h3>
            <div className="app-badges">
              <a href="#"><img src="/img/icon/app-store.png" alt="App Store" /></a>
              <a href="#"><img src="/img/icon/play-store.png" alt="Google Play" /></a>
            </div>
          </div>
        </div>
        <p className="footer-copyright">© 2023 PT. Travel Everyday Indonesia</p>
      </div>
    </footer>
  );
}