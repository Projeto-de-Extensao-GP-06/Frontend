import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { Menu, X, Instagram, Linkedin, Phone, Mail, ChevronRight, CheckCircle, Send, Shield, Briefcase, Users, User, Building2, Check, HeartHandshake, Landmark, Loader2 } from "lucide-react";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Turnstile } from "@marsidev/react-turnstile";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { maskPhone, maskCNJ, maskCNPJ } from "../utils/masks";
import { isValidCNPJ, isValidEmail, isValidPhone, isValidCNJ } from "../utils/validators";
import { criarSolicitacao } from "../services/solicitacaoService";
import siteLogoImage from "../../imports/Captura_de_tela_2026-05-29_235111-1.png";
import "../../styles/public-site-page.css";
const areas = [{
  icon: Briefcase,
  title: "Direito Empresarial",
  desc: "Assessoria jurídica estratégica para empresas, com atuação voltada à prevenção e solução de conflitos, segurança nas relações comerciais e redução de riscos.",
  services: ["Negociação e elaboração de acordos", "Elaboração e revisão de contratos", "Recuperação de crédito", "Cobrança judicial e extrajudicial", "Análise e gestão de riscos jurídicos", "Assessoria em relações comerciais"]
}, {
  icon: Shield,
  title: "Direito Civil",
  desc: "Atuação na prevenção e resolução de conflitos envolvendo relações patrimoniais, contratuais e de consumo, buscando soluções jurídicas eficientes e adequadas a cada caso.",
  services: ["Responsabilidade civil", "Direito do consumidor", "Cobrança judicial e extrajudicial", "Contratos e obrigações", "Questões relacionadas a locação", "Indenizações e reparação de danos"]
}, {
  icon: Landmark,
  title: "Direito de Família e Sucessões",
  desc: "Atuação jurídica individualizada em questões familiares e sucessórias, com orientação técnica em momentos que exigem segurança jurídica e cuidado na condução do processo.",
  services: ["Inventário judicial e extrajudicial", "Partilha de bens", "Alimentos", "Revisão de alimentos", "Guarda e regularização de guarda", "Questões relacionadas à sucessão e patrimônio"]
}];
const whatsappUrl = "https://wa.me/5511987664030";
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
const COMO_CONHECEU_OPTIONS = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "SITE", label: "Site" },
  { value: "INDICACAO", label: "Indicação" },
  { value: "OUTROS", label: "Outros" },
];

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

const STORAGE_KEY_FORM = "public_site_contact_form";
const STORAGE_KEY_SCROLL = "public_site_scroll_pos";

const getSavedFormData = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY_FORM);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export default function PublicSitePage() {
  const savedData = getSavedFormData();

  useEffect(() => {
    document.title = "SGPJ | Início";
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [accepted, setAccepted] = useState(savedData?.accepted ?? false);
  const [clientType, setClientType] = useState(savedData?.clientType ?? "PF");
  const [submitted, setSubmitted] = useState(false);

  // Form states
  const [name, setName] = useState(savedData?.name ?? "");
  const [companyName, setCompanyName] = useState(savedData?.companyName ?? "");
  const [cnpj, setCnpj] = useState(savedData?.cnpj ?? "");
  const [contactName, setContactName] = useState(savedData?.contactName ?? "");
  const [profession, setProfession] = useState(savedData?.profession ?? "");
  const [email, setEmail] = useState(savedData?.email ?? "");
  const [phone, setPhone] = useState(savedData?.phone ?? "");
  const [processNumber, setProcessNumber] = useState(savedData?.processNumber ?? "");
  const [comoConheceu, setComoConheceu] = useState(savedData?.comoConheceu ?? "");
  const [description, setDescription] = useState(savedData?.description ?? "");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const turnstileRef = useRef(null);

  const navigate = useNavigate();

  // Scroll restoration & tracking
  useEffect(() => {
    try {
      const savedScroll = sessionStorage.getItem(STORAGE_KEY_SCROLL);
      if (savedScroll !== null) {
        const scrollY = parseFloat(savedScroll);
        if (!isNaN(scrollY) && scrollY > 0) {
          requestAnimationFrame(() => {
            window.scrollTo({ top: scrollY, behavior: "instant" });
          });
          const t = setTimeout(() => {
            window.scrollTo({ top: scrollY, behavior: "instant" });
          }, 50);
          return () => clearTimeout(t);
        }
      }
    } catch {}

    const saveScroll = () => {
      try {
        sessionStorage.setItem(STORAGE_KEY_SCROLL, String(window.scrollY));
      } catch {}
    };

    window.addEventListener("scroll", saveScroll, { passive: true });
    window.addEventListener("beforeunload", saveScroll);

    return () => {
      saveScroll();
      window.removeEventListener("scroll", saveScroll);
      window.removeEventListener("beforeunload", saveScroll);
    };
  }, []);

  // Save form data continuously
  useEffect(() => {
    if (!submitted) {
      const formData = {
        clientType,
        name,
        companyName,
        cnpj,
        contactName,
        profession,
        email,
        phone,
        processNumber,
        comoConheceu,
        description,
        accepted,
      };
      try {
        sessionStorage.setItem(STORAGE_KEY_FORM, JSON.stringify(formData));
      } catch {}
    }
  }, [clientType, name, companyName, cnpj, contactName, profession, email, phone, processNumber, comoConheceu, description, accepted, submitted]);

  const scrollTo = id => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth"
    });
    setMenuOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (honeypot) {
      // Descarte silencioso de envio automatizado de bot (honeypot)
      return;
    }

    const isPF = clientType === "PF";
    const nomeCompletoValor = (isPF ? name : contactName).trim();
    const profissaoValor = profession.trim();
    const emailValor = email.trim();
    const telefoneValor = phone.trim();
    const descricaoValor = description.trim();
    const razaoSocialValor = companyName.trim();

    // 1. Validações de Identificação (PF / PJ)
    if (isPF) {
      if (!nomeCompletoValor) {
        toast.warning("Por favor, preencha o seu nome completo.");
        return;
      }
      if (nomeCompletoValor.length > 150) {
        toast.warning("O nome completo deve ter no máximo 150 caracteres.");
        return;
      }
      if (nomeCompletoValor.split(/\s+/).length < 2) {
        toast.warning("Por favor, informe seu nome completo (nome e sobrenome).");
        return;
      }
      if (!profissaoValor) {
        toast.warning("Por favor, informe sua profissão ou ocupação.");
        return;
      }
      if (profissaoValor.length > 100) {
        toast.warning("A profissão deve ter no máximo 100 caracteres.");
        return;
      }
    } else {
      if (!razaoSocialValor) {
        toast.warning("Por favor, informe a razão social ou nome da empresa.");
        return;
      }
      if (razaoSocialValor.length > 150) {
        toast.warning("A razão social deve ter no máximo 150 caracteres.");
        return;
      }
      if (!cnpj.trim()) {
        toast.warning("Por favor, informe o CNPJ da empresa.");
        return;
      }
      if (!isValidCNPJ(cnpj)) {
        toast.warning("O CNPJ informado é inválido. Verifique os dígitos informados.");
        return;
      }
      if (!nomeCompletoValor) {
        toast.warning("Por favor, informe o nome do contato principal.");
        return;
      }
      if (nomeCompletoValor.length > 150) {
        toast.warning("O nome do contato principal deve ter no máximo 150 caracteres.");
        return;
      }
      if (!profissaoValor) {
        toast.warning("Por favor, informe o cargo do contato principal.");
        return;
      }
      if (profissaoValor.length > 100) {
        toast.warning("O cargo deve ter no máximo 100 caracteres.");
        return;
      }
    }

    // 2. Validações de Contato (E-mail e Telefone)
    if (!emailValor) {
      toast.warning("Por favor, informe o endereço de e-mail.");
      return;
    }
    if (emailValor.length > 255) {
      toast.warning("O e-mail deve ter no máximo 255 caracteres.");
      return;
    }
    if (!isValidEmail(emailValor)) {
      toast.warning("Por favor, informe um endereço de e-mail válido (ex: seu@email.com).");
      return;
    }

    if (!telefoneValor) {
      toast.warning("Por favor, informe o telefone / WhatsApp para contato.");
      return;
    }
    if (!isValidPhone(telefoneValor)) {
      toast.warning("Por favor, informe um telefone válido com DDD (ex: (11) 98765-4321).");
      return;
    }

    // 3. Validação do Número do Processo (CNJ) - se informado
    if (processNumber && processNumber.trim()) {
      if (!isValidCNJ(processNumber)) {
        toast.warning("O número do processo (CNJ) deve conter os 20 dígitos completos ou ser deixado em branco.");
        return;
      }
    }

    // 4. Como conheceu
    if (!comoConheceu || !COMO_CONHECEU_OPTIONS.some((o) => o.value === comoConheceu)) {
      toast.warning("Por favor, selecione como você conheceu o escritório.");
      return;
    }

    // 5. Descrição do caso
    if (!descricaoValor) {
      toast.warning("Por favor, descreva sua situação ou dúvida.");
      return;
    }
    if (descricaoValor.length < 10) {
      toast.warning("Por favor, forneça mais detalhes sobre o seu caso (mínimo de 10 caracteres).");
      return;
    }
    if (descricaoValor.length > 2000) {
      toast.warning("A descrição deve ter no máximo 2000 caracteres.");
      return;
    }

    // 6. Aceite dos termos
    if (!accepted) {
      toast.warning("É necessário aceitar as Políticas de Privacidade e os Termos de Uso.");
      return;
    }

    // 7. Verificação Cloudflare Turnstile
    if (!turnstileToken) {
      toast.warning("Por favor, resolva a verificação anti-robô antes de enviar.");
      return;
    }

    const payload = {
      isPF,
      nomeCompleto: nomeCompletoValor,
      email: emailValor,
      telefone: telefoneValor.replace(/\D/g, ""),
      descricao: descricaoValor,
      comoConheceu,
      aceitouTermos: accepted,
      numeroProcesso: processNumber?.trim() ? processNumber.replace(/\D/g, "") : null,
      razaoSocial: !isPF ? razaoSocialValor : null,
      cnpj: !isPF && cnpj ? cnpj.replace(/[^0-9A-Za-z]/g, "").toUpperCase() : null,
      turnstileToken,
    };

    setIsSubmitting(true);
    try {
      await criarSolicitacao(payload);
      setSubmitted(true);
      toast.success("Solicitação enviada com sucesso!");
      try {
        sessionStorage.removeItem(STORAGE_KEY_FORM);
        sessionStorage.removeItem(STORAGE_KEY_SCROLL);
      } catch {}
    } catch (err) {
      let mensagemErro = "Não foi possível enviar sua solicitação. Tente novamente mais tarde.";
      if (err.response?.data?.errors && typeof err.response.data.errors === "object") {
        const errorList = Object.values(err.response.data.errors);
        if (errorList.length > 0) {
          mensagemErro = errorList[0];
        }
      } else if (err.response?.data?.message) {
        mensagemErro = err.response.data.message;
      } else if (err.response?.data?.mensagem) {
        mensagemErro = err.response.data.mensagem;
      } else if (err.message) {
        mensagemErro = err.message;
      }
      toast.error(mensagemErro);
      setTurnstileToken("");
      turnstileRef.current?.reset?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setCompanyName("");
    setCnpj("");
    setContactName("");
    setProfession("");
    setEmail("");
    setPhone("");
    setProcessNumber("");
    setComoConheceu("");
    setDescription("");
    setAccepted(false);
    setTurnstileToken("");
    setHoneypot("");
    turnstileRef.current?.reset?.();
    setSubmitted(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY_FORM);
      sessionStorage.removeItem(STORAGE_KEY_SCROLL);
    } catch {}
  };
  return <div className="public-site">

      <header className="site-header">
        <div className="site-header__inner">
          <div className="site-header__logo" onClick={() => scrollTo("hero")} style={{ cursor: "pointer" }}>
            <ImageWithFallback src={siteLogoImage} alt="Thauany Bezerra Advocacia" className="site-logo" />
          </div>

          {/* ── Desktop Navigation ── */}
          <nav className="site-header__desktop-nav" aria-label="Navegação do site">
            {[
              { id: "hero", label: "Início" },
              { id: "areas", label: "Áreas de Atuação" },
              { id: "como-funciona", label: "Como Funciona" },
              { id: "sobre", label: "Sobre" },
              { id: "contato", label: "Contato" }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="site-header__desktop-link"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="site-header__actions">
            {/* Desktop CTA */}
            <Button
              onClick={() => navigate("/login")}
              className="site-header__colaborador-btn"
            >
              Área do Colaborador
            </Button>

            {/* Mobile menu button */}
            <button onClick={() => setMenuOpen(true)} className="site-header__menu-btn" aria-label="Abrir menu">
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
                <Button onClick={() => { navigate("/login"); setMenuOpen(false); }} className="site-drawer__cta-btn">
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
          <p className="site-hero__desc">Orientação jurídica segura para decisões importantes da sua vida e do seu negócio.</p>
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
                  <ul className="site-area-card__services">
                    {area.services.map(service => <li key={service}>{service}</li>)}
                  </ul>
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
          <p className="site-about__text">Sou advogada, especializada em Direito Contratual pela PUC Campinas, com sólida experiência na área de recuperação de crédito e ativos.</p>
          <p className="site-about__text site-about__text--muted">Minha atuação é pautada pela busca de soluções jurídicas estratégicas, personalizadas e eficientes, sempre com foco nas necessidades e objetivos de cada cliente.</p>
          <p className="site-about__text site-about__text--muted">Acredito em uma advocacia baseada em ética, transparência, responsabilidade e sigilo, construída por meio de relações de confiança e de um atendimento próximo e humanizado.</p>
        </div>
      </section>

      <section className="site-section site-section--white">
        <div className="site-section__inner">
          <div className="site-section__head">
            <p className="site-section__kicker">Compromisso</p>
            <h2 className="site-section__title">Missão, Visão e Valores</h2>
          </div>
          <div className="site-principles">
            <article className="site-principle-card"><HeartHandshake size={22} className="site-principle-card__icon" /><h3>Missão</h3><p>Oferecer soluções jurídicas estratégicas e personalizadas, unindo conhecimento técnico, ética e atendimento próximo para proporcionar segurança e resultados aos meus clientes.</p></article>
            <article className="site-principle-card"><Building2 size={22} className="site-principle-card__icon" /><h3>Visão</h3><p>Ser referência em uma advocacia estratégica, reconhecida pela excelência técnica, confiança e qualidade na prestação dos serviços jurídicos.</p></article>
            <article className="site-principle-card"><Shield size={22} className="site-principle-card__icon" /><h3>Valores</h3><p><strong>Ética:</strong> atuar com integridade, responsabilidade e respeito.</p><p><strong>Transparência:</strong> manter uma comunicação clara e objetiva em todas as etapas da atuação.</p><p><strong>Confiança:</strong> construir relações profissionais pautadas pelo respeito e pela credibilidade.</p></article>
          </div>
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
            {submitted ? (
              <div className="site-contact-success">
                <CheckCircle size={48} className="site-contact-success__icon" />
                <h3 className="site-contact-success__title">Solicitação Enviada!</h3>
                <p className="site-contact-success__desc">
                  Recebemos seu caso com sucesso. Nossa equipe jurídica analisará todas as informações e entrará em contato em breve através do e-mail ou telefone informado.
                </p>
                <Button onClick={handleReset} className="site-contact-submit" style={{ marginTop: "1rem" }}>
                  Enviar outro caso
                </Button>
              </div>
            ) : (
              <form className="site-contact-form" onSubmit={handleSubmit}>
                {/* Switcher PF / PJ */}
                <div className="site-contact-type-wrap">
                  <span className="site-contact-type-label">Tipo de solicitante:</span>
                  <div className="site-contact-type-grid">
                    <button
                      type="button"
                      className={`site-contact-type-btn ${
                        clientType === "PF" ? "site-contact-type-btn--active" : ""
                      }`}
                      onClick={() => setClientType("PF")}
                    >
                      <div className="site-contact-type-badge">PF</div>
                      <div className="site-contact-type-copy">
                        <p className="site-contact-type-title">Pessoa Física</p>
                        <p className="site-contact-type-desc">Atendimento individual</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`site-contact-type-btn ${
                        clientType === "PJ" ? "site-contact-type-btn--active" : ""
                      }`}
                      onClick={() => setClientType("PJ")}
                    >
                      <div className="site-contact-type-badge">PJ</div>
                      <div className="site-contact-type-copy">
                        <p className="site-contact-type-title">Pessoa Jurídica</p>
                        <p className="site-contact-type-desc">Empresas e negócios</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="site-contact-grid">
                  {clientType === "PF" ? (
                    <>
                      <div>
                        <Label className="site-contact-label">Nome Completo *</Label>
                        <Input
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="site-contact-input"
                          placeholder="Seu nome completo"
                          maxLength={150}
                        />
                      </div>

                      <div>
                        <Label className="site-contact-label">Profissão / Ocupação *</Label>
                        <Input
                          required
                          value={profession}
                          onChange={(e) => setProfession(e.target.value)}
                          className="site-contact-input"
                          placeholder="Ex: Engenheiro, Professor, Autônomo"
                          maxLength={100}
                        />
                      </div>

                      <div>
                        <Label className="site-contact-label">E-mail *</Label>
                        <Input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="site-contact-input"
                          placeholder="seu@email.com"
                          maxLength={255}
                        />
                      </div>

                      <div>
                        <Label className="site-contact-label">Telefone / WhatsApp *</Label>
                        <Input
                          required
                          value={phone}
                          onChange={(e) => setPhone(maskPhone(e.target.value))}
                          className="site-contact-input"
                          placeholder="(xx) 9xxxx-xxxx"
                          maxLength={15}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label className="site-contact-label">Razão Social / Nome da Empresa *</Label>
                        <Input
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="site-contact-input"
                          placeholder="Ex: Construtech Soluções e Engenharia LTDA"
                          maxLength={150}
                        />
                      </div>

                      <div>
                        <Label className="site-contact-label">CNPJ *</Label>
                        <Input
                          required
                          value={cnpj}
                          onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                          className="site-contact-input site-contact-input--mono"
                          placeholder="00.000.000/0000-00"
                          maxLength={18}
                        />
                      </div>

                      <div className="site-contact-pj-box">
                        <div className="site-contact-pj-header">
                          <div className="site-contact-pj-title-wrap">
                            <User size={16} style={{ color: "#0f2357" }} />
                            <h4 className="site-contact-pj-title">Contato Principal da Empresa</h4>
                          </div>
                        </div>
                        <p className="site-contact-pj-notice">
                          Informe abaixo o responsável que será registrado como o <strong>contato principal</strong> para o acompanhamento deste caso.
                        </p>

                        <div className="site-contact-pj-grid">
                          <div>
                            <Label className="site-contact-label">Nome do Contato Principal *</Label>
                            <Input
                              required
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              className="site-contact-input"
                              placeholder="Ex: Carlos Mendes"
                              maxLength={150}
                            />
                          </div>

                          <div>
                            <Label className="site-contact-label">Cargo *</Label>
                            <Input
                              required
                              value={profession}
                              onChange={(e) => setProfession(e.target.value)}
                              className="site-contact-input"
                              placeholder="Ex: Diretor Executivo, Gerente Jurídico"
                              maxLength={100}
                            />
                          </div>

                          <div>
                            <Label className="site-contact-label">E-mail do Contato *</Label>
                            <Input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="site-contact-input"
                              placeholder="carlos@empresa.com.br"
                              maxLength={255}
                            />
                          </div>

                          <div>
                            <Label className="site-contact-label">Telefone / WhatsApp do Contato *</Label>
                            <Input
                              required
                              value={phone}
                              onChange={(e) => setPhone(maskPhone(e.target.value))}
                              className="site-contact-input"
                              placeholder="(xx) 9xxxx-xxxx"
                              maxLength={15}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <Label className="site-contact-label">N° do Processo (CNJ)</Label>
                    <Input
                      value={processNumber}
                      onChange={(e) => setProcessNumber(maskCNJ(e.target.value))}
                      className="site-contact-input site-contact-input--mono"
                      placeholder="Opcional"
                      maxLength={25}
                    />
                  </div>

                  <div>
                    <Label htmlFor="comoConheceu" className="site-contact-label">
                      Como conheceu? *
                    </Label>
                    <select
                      id="comoConheceu"
                      name="comoConheceu"
                      required
                      value={comoConheceu}
                      onChange={(e) => setComoConheceu(e.target.value)}
                      className="site-contact-select"
                    >
                      <option value="" disabled>
                        Selecione uma opção
                      </option>
                      {COMO_CONHECEU_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="site-contact-grid__full">
                    <div className="site-contact-label-wrap">
                      <Label className="site-contact-label" style={{ marginBottom: 0 }}>
                        {clientType === "PF" ? "Descreva sua Situação *" : "Descreva a Necessidade da Empresa *"}
                      </Label>
                      <span className="site-contact-char-count">
                        {description.length}/2000 caracteres
                      </span>
                    </div>
                    <Textarea
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="site-contact-textarea"
                      maxLength={2000}
                      placeholder={
                        clientType === "PF"
                          ? "Descreva brevemente o seu caso..."
                          : "Descreva a situação jurídica, contrato ou litígio envolvendo a empresa..."
                      }
                    />
                  </div>
                </div>

                <div className="site-contact-privacy">
                  <Checkbox
                    id="privacy"
                    checked={accepted}
                    onCheckedChange={(v) => setAccepted(!!v)}
                    className="site-contact-checkbox"
                  />
                  <label htmlFor="privacy" className="site-contact-privacy__label">
                    Li e aceito as{" "}
                    <Link to="/politica-de-privacidade" className="site-contact-privacy__link">
                      Políticas de privacidade
                    </Link>{" "}
                    e{" "}
                    <Link to="/termos-de-uso" className="site-contact-privacy__link">
                      Termos de uso
                    </Link>
                  </label>
                </div>

                {/* Honeypot field (proteção silenciosa contra bots) */}
                <div style={{ display: "none" }} aria-hidden="true">
                  <input
                    type="text"
                    name="website_url_hp"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                {/* Ações: Desafio Cloudflare Turnstile + Botão Enviar caso */}
                <div className="site-contact-actions">
                  <div className="site-contact-turnstile">
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={TURNSTILE_SITE_KEY}
                      onSuccess={(token) => setTurnstileToken(token)}
                      onError={() => setTurnstileToken("")}
                      onExpire={() => setTurnstileToken("")}
                      options={{
                        theme: "light",
                        language: "pt-br",
                        appearance: "always",
                      }}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!accepted || !turnstileToken || isSubmitting}
                    className="site-contact-submit"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Enviar caso
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div className="site-footer__logo"><ImageWithFallback src={siteLogoImage} alt="Thauany Bezerra Advocacia" style={{ width: '13rem', height: 'auto', marginTop: '1.2rem' }} className="site-logo" /></div>
          <div className="site-footer__contacts">
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="site-footer__contact"><Phone size={16} className="site-footer__contact-icon" /><span className="site-footer__contact-text">(11) 98766-4030</span></a>
            <a href="mailto:tthauany.bezerra@gmail.com" className="site-footer__contact"><Mail size={16} className="site-footer__contact-icon" /><span className="site-footer__contact-text">tthauany.bezerra@gmail.com</span></a>
          </div>
          <div className="site-footer__social">
            <a href="https://www.instagram.com/thauanybezerra.adv/" target="_blank" rel="noreferrer" aria-label="Instagram" className="site-footer__social-link"><Instagram size={18} className="site-footer__social-icon" /></a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="site-footer__social-link"><WhatsAppIcon className="site-footer__social-icon" /></a>
            <a href="https://www.linkedin.com/in/thauany-santos-8521911a1/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="site-footer__social-link"><Linkedin size={18} className="site-footer__social-icon" /></a>
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

      <a href={whatsappUrl} target="_blank" rel="noreferrer" className="site-whatsapp-float" aria-label="Conversar pelo WhatsApp" title="Conversar pelo WhatsApp">
        <WhatsAppIcon />
      </a>

    </div>;
}
