import { Headphones, Mail, Utensils } from 'lucide-react'
import { Link } from 'react-router-dom'

const socialLinks = [
  ['Facebook', 'https://facebook.com/bitelinkapp', 'f'],
  ['Instagram', 'https://instagram.com/bitelinkapp', '◎'],
  ['LinkedIn', 'https://linkedin.com/company/bitelinkapp', 'in'],
]

export default function SiteFooter() {
  return <>
    <footer className="site-footer">
      <div className="site-footer-grid">
        <section className="site-footer-intro">
          <Link className="saas-brand" to="/"><Utensils size={20}/> Bite<span>Link</span></Link>
          <p>Modern ordering and restaurant operations, connected in one dependable platform.</p>
          <div className="footer-socials" aria-label="Follow BiteLink">
            {socialLinks.map(([name, href, mark]) => <a href={href} target="_blank" rel="noreferrer" aria-label={`Follow BiteLink on ${name}`} key={name}>{mark}</a>)}
          </div>
        </section>
        <section><h3>Product</h3><a href="/#templates">Templates</a><a href="/#features">Features</a><a href="/#pricing">Plans</a><Link to="/register">Start free</Link></section>
        <section><h3>Company</h3><Link to="/about">About us</Link><Link to="/contact">Contact</Link><a href="mailto:support@bitelink.app">Help center</a><Link to="/login">Portal login</Link></section>
        <section><h3>Legal</h3><Link to="/terms">Terms & conditions</Link><Link to="/privacy">Privacy policy</Link><Link to="/cookies">Cookie policy</Link></section>
        <section className="footer-contact"><h3>Talk to our team</h3><p>Questions about setup, pricing, or your account?</p><a href="mailto:support@bitelink.app"><Mail size={16}/> support@bitelink.app</a></section>
      </div>
      <div className="site-footer-bottom"><span>© {new Date().getFullYear()} BiteLink. All rights reserved.</span><span>Built for modern restaurant teams.</span></div>
    </footer>
    <a className="platform-help-button" href="mailto:support@bitelink.app?subject=BiteLink%20platform%20help" aria-label="Contact the BiteLink platform team"><Headphones size={20}/><span><small>Need help?</small>Talk to our team</span></a>
  </>
}
