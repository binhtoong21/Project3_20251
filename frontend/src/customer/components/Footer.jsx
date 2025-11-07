import './footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-col contact">
          <h3>Contact Us</h3>
          <p>Email: support@bookstores.com</p>
          <p>Phone: 123-456-7890</p>
          <p>Address: 123 Book St, Reading City, 45678</p>
        </div>

        <div className="footer-col support">
          <h3>Support</h3>
          <p><a href="/faq">FAQ</a></p>
          <p><a href="/shipping">Shipping & Returns</a></p>
          <p><a href="/privacy">Privacy Policy</a></p>
          <p><a href="/terms">Terms of Service</a></p>
        </div>
      </div>

      <div className="footer-bottom">
        <small>© {new Date().getFullYear()} Bookstores. All rights reserved.</small>
      </div>
    </footer>
  )
}
