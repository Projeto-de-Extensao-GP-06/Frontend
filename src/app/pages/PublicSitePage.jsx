import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Menu, X, Instagram, MessageCircle, Linkedin, Phone, Mail, ChevronRight, CheckCircle, Send, FileText, Shield, Home, Briefcase, Users, Eye, Languages, Sun, Moon } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import siteLogoImage from "../../imports/Captura_de_tela_2026-05-29_235111-1.png";
import "../../styles/public-site-page.css";
const areas = [{
  icon: Briefcase,
  title: "Direito Trabalhista",
  desc: "Defesa de direitos nas relações de trabalho, demissões e verbas rescisórias."
}, {
  icon: Home,
  title: "Direito Imobiliário",
  desc: "Contratos, locações, compra e venda e regularização de imóveis."
}, {
  icon: Shield,
  title: "Direito Civil",
  desc: "Contratos, indenizações, família e sucessões."
}, {
  icon: FileText,
  title: "Direito Empresarial",
  desc: "Assessoria jurídica para empresas, contratos e disputas societárias."
}];
const steps = [{
  num: "01",
  title: "Envie seu caso",
  desc: "Preencha o formulário com sua situação e entraremos em contato."
}, {
  num: "02",
  title: "Analisamos sua situação",
  desc: "Nossa equipe analisa seu caso com sigilo e atenção especializada."
}, {
  num: "03",
  title: "Entramos em contato",
  desc: "Retornamos com orientações claras e próximos passos personalizados."
}];
export default function PublicSitePage() {
  useEffect(() => {
    document.title = "Thauany Bezerra Advogada";
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [accessibilityMenuOpen, setAccessibilityMenuOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [librasEnabled, setLibrasEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }
  }, [highContrast]);
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);
  const scrollTo = id => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth"
    });
    setMenuOpen(false);
  };
  return <div className={`public-site ${highContrast ? "accessibility-high-contrast" : ""}`}>

      <header className="site-header">
        <div className="site-header__inner">
          <div className="site-header__logo">
            <ImageWithFallback src={siteLogoImage} alt="Thauany Bezerra Advocacia" className="site-logo" />
          </div>
          <div className="site-header__actions">
            <button onClick={() => setMenuOpen(true)} className="site-header__menu-btn">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && <div className="site-nav-overlay">
          <div className="site-nav-overlay__backdrop" onClick={() => setMenuOpen(false)} />
          <div className="site-drawer">
            <div className="site-drawer__top">
              <span className="site-drawer__title">Menu</span>
              <button onClick={() => setMenuOpen(false)} className="site-drawer__close"><X size={20} /></button>
            </div>
            <nav className="site-drawer__nav">
              {["hero", "areas", "como-funciona", "sobre", "contato"].map(id => {
            const labels = { hero: "Início", areas: "Áreas de Atuação", "como-funciona": "Como Funciona", sobre: "Sobre", contato: "Entrar em Contato" };
            return <button key={id} onClick={() => scrollTo(id)} className="site-drawer__link">
                    {labels[id]}
                    <ChevronRight size={14} className="site-drawer__link-icon" />
                  </button>;
          })}
              <div className="site-drawer__cta">
                <Button onClick={() => { navigate("/"); setMenuOpen(false); }} className="site-drawer__cta-btn">
                  Área do Colaborador
                </Button>
              </div>
            </nav>
          </div>
        </div>}

      <section id="hero" className="site-hero">
        <div className="site-hero__bg" />
        <div className="site-hero__content">
          <div className="site-hero__badge">
            <div className="site-hero__badge-dot" />
            <span className="site-hero__badge-text">Advocacia especializada</span>
          </div>
          <h1 className="site-hero__title">Thauany<br /><span className="site-hero__title-accent">Bezerra</span></h1>
          <p className="site-hero__subtitle">Advocacia</p>
          <p className="site-hero__desc">Atendimento jurídico com segurança e confidencialidade. Seu direito, nossa prioridade.</p>
          <div className="site-hero__actions">
            <Button onClick={() => scrollTo("contato")} className="site-hero__cta">Entrar em contato</Button>
            <button onClick={() => scrollTo("como-funciona")} className="site-hero__link">Como funciona?</button>
          </div>
        </div>
      </section>

      <section id="areas" className="site-section site-section--gray">
        <div className="site-section__inner">
          <div className="site-section__head">
            <p className="site-section__kicker">Especialidades</p>
            <h2 className="site-section__title">Áreas de Atuação</h2>
          </div>
          <div className="site-areas-grid">
            {areas.map((area, i) => {
            const Icon = area.icon;
            return <div key={i} className="site-area-card">
                  <div className="site-area-card__icon-wrap"><Icon size={18} className="site-area-card__icon" /></div>
                  <h3 className="site-area-card__title">{area.title}</h3>
                  <p className="site-area-card__desc">{area.desc}</p>
                </div>;
          })}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="site-section site-section--white">
        <div className="site-section__inner">
          <div className="site-section__head">
            <p className="site-section__kicker">Processo</p>
            <h2 className="site-section__title">Como Funciona</h2>
          </div>
          <div className="site-steps">
            {steps.map((step, i) => <div key={i} className="site-step">
                <div className="site-step__track">
                  <div className="site-step__circle"><span className="site-step__num">{step.num}</span></div>
                  {i < steps.length - 1 && <div className="site-step__line" />}
                </div>
                <div className="site-step__copy">
                  <h3 className="site-step__title">{step.title}</h3>
                  <p className="site-step__desc">{step.desc}</p>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      <section id="sobre" className="site-section site-section--dark">
        <div className="site-section__inner site-section__inner--center">
          <p className="site-section__kicker">Quem sou eu</p>
          <h2 className="site-section__title site-section__title--light">Sobre</h2>
          <div className="site-about__avatar"><Users size={36} className="site-about__avatar-icon" /></div>
          <p className="site-about__text">Advogada com sólida formação e comprometimento com cada cliente. Atuo com foco em resultados concretos, sempre pautada pela ética, sigilo e transparência no atendimento.</p>
          <p className="site-about__text site-about__text--muted">Minha missão é garantir que cada pessoa tenha acesso a uma defesa jurídica de qualidade, independente da complexidade do caso.</p>
          <div className="site-about__oab"><CheckCircle size={16} className="site-about__oab-icon" /><span className="site-about__oab-text">OAB/SP 000.000</span></div>
        </div>
      </section>

      <section id="contato" className="site-section site-section--gray">
        <div className="site-section__inner">
          <div className="site-section__head">
            <p className="site-section__kicker">Fale conosco</p>
            <h2 className="site-section__title">Envie seu caso</h2>
            <p className="site-section__sub">Preencha o formulário e envie seu caso para nossa equipe</p>
          </div>
          <div className="site-contact-card">
            <form className="site-contact-form">
              <div className="site-contact-grid">
                <div className="site-contact-grid__full"><Label className="site-contact-label">Nome Completo *</Label><Input className="site-contact-input" placeholder="Seu nome" /></div>
                <div><Label className="site-contact-label">E-mail *</Label><Input type="email" className="site-contact-input" placeholder="seu@email.com" /></div>
                <div><Label className="site-contact-label">Telefone *</Label><Input className="site-contact-input" placeholder="(xx) 9xxxx-xxxx" /></div>
                <div><Label className="site-contact-label">Estado *</Label>
                  <select className="site-contact-select">
                    <option value="">Selecione...</option>
                    <option>SP</option><option>RJ</option><option>MG</option>
                    <option>RS</option><option>PR</option><option>BA</option>
                    <option>GO</option><option>DF</option>
                  </select>
                </div>
                <div><Label className="site-contact-label">N° do Processo (CNJ)</Label><Input className="site-contact-input site-contact-input--mono" placeholder="Opcional" /></div>
                <div className="site-contact-grid__full"><Label className="site-contact-label">Descreva sua Situação *</Label><Textarea className="site-contact-textarea" placeholder="Descreva brevemente o seu caso..." /></div>
              </div>
              <div className="site-contact-privacy">
                <Checkbox id="privacy" checked={accepted} onCheckedChange={v => setAccepted(!!v)} className="site-contact-checkbox" />
                <label htmlFor="privacy" className="site-contact-privacy__label">
                  Li e aceito as <Link to="/politica-de-privacidade" className="site-contact-privacy__link">Políticas de privacidade</Link> e <Link to="/termos-de-uso" className="site-contact-privacy__link">Termos de uso</Link>
                </label>
              </div>
              <Button type="submit" disabled={!accepted} className="site-contact-submit">
                <Send size={16} />Enviar caso
              </Button>
            </form>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div className="site-footer__logo"><ImageWithFallback src={siteLogoImage} alt="Thauany Bezerra Advocacia" className="site-logo" /></div>
          <div className="site-footer__contacts">
            <div className="site-footer__contact"><Phone size={16} className="site-footer__contact-icon" /><span className="site-footer__contact-text">(11) 91234-5678</span></div>
            <div className="site-footer__contact"><Mail size={16} className="site-footer__contact-icon" /><span className="site-footer__contact-text">thauany@thauanybezerra.adv.br</span></div>
          </div>
          <div className="site-footer__social">
            <a href="#" className="site-footer__social-link"><Instagram size={18} className="site-footer__social-icon" /></a>
            <a href="#" className="site-footer__social-link"><MessageCircle size={18} className="site-footer__social-icon" /></a>
            <a href="#" className="site-footer__social-link"><Linkedin size={18} className="site-footer__social-icon" /></a>
          </div>
          <div className="site-footer__legal">
            <div className="site-footer__legal-links">
              <Link to="/politica-de-privacidade" className="site-footer__legal-link">Políticas de privacidade</Link>
              <Link to="/termos-de-uso" className="site-footer__legal-link">Termos de uso</Link>
            </div>
            <p className="site-footer__copy">© 2026 Thauany Bezerra Advocacia. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      <div className="site-a11y">
        {accessibilityMenuOpen && <div className="site-a11y__menu">
            <div className="site-a11y__menu-header">
              <div className="site-a11y__menu-header-left">
                <div className="site-a11y__menu-icon-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle cx="12" cy="4.5" r="2.5" fill="white"/>
                    <line x1="12" y1="7.5" x2="12" y2="16" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                    <line x1="5" y1="11" x2="19" y2="11" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                    <line x1="12" y1="16" x2="8" y2="22" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                    <line x1="12" y1="16" x2="16" y2="22" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="site-a11y__menu-title">Acessibilidade</h3>
              </div>
              <button onClick={() => setAccessibilityMenuOpen(false)} className="site-a11y__menu-close"><X size={16} /></button>
            </div>

            <div className="site-a11y__section">
              <p className="site-a11y__section-label">Visão e Leitura</p>
              <button onClick={() => setHighContrast(!highContrast)} className={`site-a11y__option ${highContrast ? "site-a11y__option--on" : ""}`}>
                <div className="site-a11y__option-left">
                  <Eye size={17} />
                  <div>
                    <span className="site-a11y__option-label">Alto contraste</span>
                    <span className="site-a11y__option-hint">Aumenta o contraste visual</span>
                  </div>
                </div>
                <div className={`site-a11y__toggle ${highContrast ? "site-a11y__toggle--on" : ""}`}>
                  <div className={`site-a11y__toggle-knob ${highContrast ? "site-a11y__toggle-knob--on" : ""}`} />
                </div>
              </button>
              <button onClick={() => setLibrasEnabled(!librasEnabled)} className={`site-a11y__option ${librasEnabled ? "site-a11y__option--on" : ""}`}>
                <div className="site-a11y__option-left">
                  <Languages size={17} />
                  <div>
                    <span className="site-a11y__option-label">Intérprete de Libras</span>
                    <span className="site-a11y__option-hint">Ativa o widget VLibras</span>
                  </div>
                </div>
                <div className={`site-a11y__toggle ${librasEnabled ? "site-a11y__toggle--on" : ""}`}>
                  <div className={`site-a11y__toggle-knob ${librasEnabled ? "site-a11y__toggle-knob--on" : ""}`} />
                </div>
              </button>
            </div>
          </div>}

        <button onClick={() => setAccessibilityMenuOpen(!accessibilityMenuOpen)} className={`site-a11y__fab ${accessibilityMenuOpen ? "site-a11y__fab--open" : ""}`} title="Acessibilidade" aria-label="Menu de acessibilidade">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="12" cy="4.5" r="2.5" fill="currentColor"/>
            <line x1="12" y1="7.5" x2="12" y2="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            <line x1="5" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            <line x1="12" y1="16" x2="8" y2="22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            <line x1="12" y1="16" x2="16" y2="22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          {(librasEnabled || highContrast) && <div className="site-a11y__fab-indicator" />}
        </button>
      </div>

      {librasEnabled && <div className="site-libras">
          <div className="site-libras__widget">
            <div className="site-libras__header">
              <div className="site-libras__header-left"><div className="site-libras__dot" /><span className="site-libras__brand">VLibras</span></div>
              <button onClick={() => setLibrasEnabled(false)} className="site-libras__close"><X size={14} /></button>
            </div>
            <div className="site-libras__body">
              <div className="site-libras__avatar">
                <div className="site-libras__head">
                  <div className="site-libras__eye site-libras__eye--left" />
                  <div className="site-libras__eye site-libras__eye--right" />
                  <div className="site-libras__nose" />
                  <div className="site-libras__mouth" />
                </div>
                <div className="site-libras__neck" />
                <div className="site-libras__body-torso">
                  <div className="site-libras__arm site-libras__arm--left" />
                  <div className="site-libras__arm site-libras__arm--right" style={{animationDelay:'0.3s'}} />
                  <div className="site-libras__hand site-libras__hand--left" />
                  <div className="site-libras__hand site-libras__hand--right" />
                </div>
              </div>
              <p className="site-libras__caption">Interpretando...</p>
            </div>
          </div>
        </div>}
    </div>;
}