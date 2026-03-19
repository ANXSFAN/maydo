import { useState, useEffect, useRef } from "react";

const COLORS = {
  maroon: "#7A4242",
  maroonDark: "#5C2E2E",
  maroonLight: "#8A5252",
  camel: "#C9A87C",
  camelLight: "#D4B896",
  white: "#FFFFFF",
  cream: "#FAF7F4",
  beige: "#E0D5CE",
  black: "#1A1A1A",
  gray: "#8A8A8A",
};

const IMAGES = {
  about: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=1000&fit=crop&q=80",
  food1: "https://images.unsplash.com/photo-1563612116625-3012372fccce?w=600&h=400&fit=crop&q=80",
  food2: "https://images.unsplash.com/photo-1582450871972-ab5ca641643d?w=600&h=400&fit=crop&q=80",
  food3: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&h=400&fit=crop&q=80",

  reserve: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&h=1000&fit=crop&q=80",
  gallery1: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=600&h=600&fit=crop&q=80",
  gallery2: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop&q=80",
  gallery3: "https://images.unsplash.com/photo-1540648639573-8c848de23f0a?w=600&h=400&fit=crop&q=80",
  gallery4: "https://images.unsplash.com/photo-1617196034183-421b4917c92d?w=600&h=600&fit=crop&q=80",
};

const LANG = {
  es: {
    nav: ["Inicio", "Carta", "Reservas", "Galería", "Contacto"],
    hero: {
      sub: "L'Hospitalet de Llobregat, Barcelona",
      title: "MAYDO",
      tagline: "日本料理の芸術",
      desc: "Donde la tradición japonesa se encuentra con la elegancia mediterránea",
      cta: "Reservar mesa",
      cta2: "Ver carta",
    },
    menu: {
      sub: "Nuestra carta",
      title: "Una experiencia culinaria",
      desc: "Cada plato es una obra de arte, preparado con los ingredientes más frescos y la técnica más refinada",
      items: [
        { title: "Menú de mediodía", desc: "Buffet libre con selección premium de sushi, sashimi y platos calientes", price: "17,90€", time: "13:00 - 16:30" },
        { title: "Menú de noche", desc: "Experiencia omakase completa con ingredientes de temporada", price: "29,90€", time: "20:30 - 23:30" },
        { title: "Menú del día", desc: "Selección especial del chef con sorpresas diarias", price: "14,90€", time: "13:00 - 16:30" },
      ],
    },
    gallery: {
      sub: "Galería",
      title: "Momentos MAYDO",
    },
    reserve: {
      sub: "Reservas",
      title: "Reserve su mesa",
      desc: "Permítanos preparar la mejor experiencia para usted. Elija su fecha y horario preferido.",
      name: "Nombre completo",
      email: "Correo electrónico",
      phone: "Teléfono",
      date: "Fecha",
      time: "Hora",
      guests: "Número de personas",
      btn: "Confirmar reserva",
      note: "Recibirá una confirmación por correo electrónico",
    },
    about: {
      sub: "Sobre nosotros",
      title: "La esencia de Japón en Barcelona",
      desc: "Inspirado en sabores tradicionales, MAYDO ofrece una interpretación fresca y creativa de la cocina japonesa. Cada visita es un viaje sensorial donde la precisión del arte culinario nipón se fusiona con la calidez del Mediterráneo.",
      stat1: "8+", stat1Label: "Años de experiencia",
      stat2: "50+", stat2Label: "Platos en carta",
      stat3: "★ 4.5", stat3Label: "Valoración media",
    },
    footer: {
      hours: "Horario",
      hoursDetail: ["Martes a Domingo", "13:00 - 16:30", "20:30 - 23:30", "Lunes cerrado"],
      contact: "Contacto",
      location: "Ubicación",
      address: "Pl. d'Europa, 102, 08902\nL'Hospitalet de Llobregat\nBarcelona",
    },
    langSwitch: "中文",
  },
  zh: {
    nav: ["首页", "菜单", "预订", "画廊", "联系"],
    hero: {
      sub: "巴塞罗那 L'Hospitalet de Llobregat",
      title: "MAYDO",
      tagline: "日本料理の芸術",
      desc: "日本传统与地中海优雅的邂逅",
      cta: "预订座位",
      cta2: "查看菜单",
    },
    menu: {
      sub: "我们的菜单",
      title: "一场美食体验",
      desc: "每道菜都是一件艺术品，以最新鲜的食材和最精湛的技艺呈现",
      items: [
        { title: "午间套餐", desc: "精选自助，含寿司、刺身及热菜", price: "17,90€", time: "13:00 - 16:30" },
        { title: "晚间套餐", desc: "完整Omakase体验，时令食材呈现", price: "29,90€", time: "20:30 - 23:30" },
        { title: "每日特选", desc: "主厨当日精选，每天都有惊喜", price: "14,90€", time: "13:00 - 16:30" },
      ],
    },
    gallery: {
      sub: "画廊",
      title: "MAYDO 时刻",
    },
    reserve: {
      sub: "预订",
      title: "预订您的座位",
      desc: "让我们为您准备最好的用餐体验。请选择您偏好的日期和时间。",
      name: "您的姓名",
      email: "电子邮箱",
      phone: "联系电话",
      date: "日期",
      time: "时间",
      guests: "用餐人数",
      btn: "确认预订",
      note: "您将收到一封确认邮件",
    },
    about: {
      sub: "关于我们",
      title: "巴塞罗那的日本精髓",
      desc: "受传统风味的启发，MAYDO以全新创意诠释日本料理。每一次到访都是一场感官之旅，日本料理的精准工艺与地中海的温暖在此完美融合。",
      stat1: "8+", stat1Label: "年经验",
      stat2: "50+", stat2Label: "道菜品",
      stat3: "★ 4.5", stat3Label: "平均评分",
    },
    footer: {
      hours: "营业时间",
      hoursDetail: ["周二至周日", "13:00 - 16:30", "20:30 - 23:30", "周一休息"],
      contact: "联系方式",
      location: "地址",
      address: "Pl. d'Europa, 102, 08902\nL'Hospitalet de Llobregat\n巴塞罗那",
    },
    langSwitch: "ES",
  },
};

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function FadeIn({ children, delay = 0, className = "", style = {} }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} className={className} style={{ ...style, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(36px)", transition: `opacity 1s ease ${delay}s, transform 1s ease ${delay}s` }}>
      {children}
    </div>
  );
}

function FadeInScale({ children, delay = 0, style = {} }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} style={{ ...style, opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.92)", transition: `opacity 1s ease ${delay}s, transform 1s ease ${delay}s` }}>
      {children}
    </div>
  );
}

const DiamondDivider = ({ color = COLORS.camel }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, margin: "20px 0" }}>
    <div style={{ width: 40, height: 1, background: color, opacity: 0.5 }} />
    <div style={{ width: 8, height: 8, background: color, transform: "rotate(45deg)", opacity: 0.7 }} />
    <div style={{ width: 40, height: 1, background: color, opacity: 0.5 }} />
  </div>
);

export default function SushiMaydoHome() {
  const [lang, setLang] = useState("es");
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = LANG[lang];

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBg = scrollY > 60;

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', 'Noto Serif SC', Georgia, serif", color: COLORS.black, background: COLORS.cream, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Noto+Serif+SC:wght@300;400;500;600&family=Zen+Kaku+Gothic+New:wght@300;400;500&display=swap" rel="stylesheet" />

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::selection { background: ${COLORS.maroon}; color: ${COLORS.white}; }
        @keyframes fadeInDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
        @keyframes shimmer { 0%,100% { opacity:0.4; } 50% { opacity:1; } }
        @keyframes kenburns { 0% { transform:scale(1.0); } 100% { transform:scale(1.12); } }
        .hero-title { animation: scaleIn 1.2s ease forwards; }
        .hero-sub { animation: fadeInDown 1s ease 0.3s forwards; opacity:0; }
        .hero-desc { animation: fadeInUp 1s ease 0.6s forwards; opacity:0; }
        .hero-cta { animation: fadeInUp 1s ease 0.9s forwards; opacity:0; }
        .hero-bg-img { animation: kenburns 25s ease alternate infinite; }
        .nav-link { position:relative; color:${COLORS.white}; text-decoration:none; font-size:13px; letter-spacing:3px; text-transform:uppercase; font-family:'Zen Kaku Gothic New',sans-serif; font-weight:300; transition: opacity 0.3s; }
        .nav-link:hover { opacity:0.7; }
        .nav-link::after { content:''; position:absolute; bottom:-4px; left:0; width:0; height:1px; background:${COLORS.camel}; transition:width 0.3s; }
        .nav-link:hover::after { width:100%; }
        .menu-card { background:${COLORS.white}; border:1px solid ${COLORS.beige}; transition:all 0.5s ease; cursor:pointer; position:relative; overflow:hidden; }
        .menu-card::before { content:''; position:absolute; top:0; left:0; width:100%; height:3px; background:${COLORS.camel}; transform:scaleX(0); transition:transform 0.5s ease; transform-origin:left; z-index:2; }
        .menu-card:hover { transform:translateY(-8px); box-shadow:0 20px 60px rgba(122,66,66,0.12); }
        .menu-card:hover::before { transform:scaleX(1); }
        .menu-card:hover .menu-card-img { transform:scale(1.08); }
        .menu-card-img { transition: transform 0.7s ease; }
        .gallery-item { overflow:hidden; cursor:pointer; position:relative; }
        .gallery-item img { transition:transform 0.7s ease; }
        .gallery-item:hover img { transform:scale(1.06); }
        .gallery-item .gallery-overlay { position:absolute; inset:0; background:rgba(122,66,66,0.0); transition:background 0.5s ease; }
        .gallery-item:hover .gallery-overlay { background:rgba(122,66,66,0.25); }
        .form-input { width:100%; padding:16px 0; border:none; border-bottom:1px solid ${COLORS.beige}; background:transparent; font-family:'Zen Kaku Gothic New',sans-serif; font-size:15px; color:${COLORS.black}; outline:none; transition:border-color 0.3s; }
        .form-input:focus { border-bottom-color:${COLORS.maroon}; }
        .form-input::placeholder { color:${COLORS.gray}; }
        .btn-primary { display:inline-block; padding:18px 48px; background:${COLORS.maroon}; color:${COLORS.white}; border:none; font-family:'Cormorant Garamond',serif; font-size:16px; letter-spacing:3px; text-transform:uppercase; cursor:pointer; transition:all 0.4s ease; }
        .btn-primary:hover { background:${COLORS.maroonDark}; transform:translateY(-2px); box-shadow:0 8px 30px rgba(122,66,66,0.3); }
        .btn-outline { display:inline-block; padding:18px 48px; background:transparent; color:${COLORS.white}; border:1px solid rgba(255,255,255,0.4); font-family:'Cormorant Garamond',serif; font-size:16px; letter-spacing:3px; text-transform:uppercase; cursor:pointer; transition:all 0.4s ease; }
        .btn-outline:hover { background:rgba(255,255,255,0.1); border-color:${COLORS.white}; }
        .section-sub { font-family:'Zen Kaku Gothic New',sans-serif; font-size:12px; letter-spacing:5px; text-transform:uppercase; color:${COLORS.camel}; font-weight:400; }
        .section-title { font-size:clamp(32px,5vw,52px); font-weight:300; color:${COLORS.maroon}; line-height:1.2; margin:12px 0; }
        .section-desc { font-family:'Zen Kaku Gothic New',sans-serif; font-size:15px; color:${COLORS.gray}; line-height:1.9; font-weight:300; max-width:540px; }
        .hamburger { display:none; cursor:pointer; background:none; border:none; padding:8px; z-index:10; }
        .hamburger span { display:block; width:24px; height:1.5px; background:${COLORS.white}; margin:5px 0; transition:all 0.3s; }
        @media (max-width:768px) {
          .hamburger { display:block; }
          .nav-links { display:none !important; }
          .nav-links.open { display:flex !important; flex-direction:column; position:absolute; top:100%; left:0; right:0; background:rgba(92,46,46,0.98); padding:30px; gap:20px !important; backdrop-filter:blur(20px); }
          .menu-grid { grid-template-columns:1fr !important; }
          .reserve-layout { flex-direction:column !important; }
          .about-layout { flex-direction:column !important; }
          .footer-grid { grid-template-columns:1fr !important; text-align:center; }
          .gallery-grid { grid-template-columns:1fr 1fr !important; grid-template-rows:auto auto auto !important; }
          .gallery-tall { grid-row:span 1 !important; }
          .gallery-wide { grid-column:span 1 !important; }
        }
      `}</style>

      {/* Navigation */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: navBg ? "rgba(92,46,46,0.95)" : "transparent",
        backdropFilter: navBg ? "blur(20px)" : "none",
        transition: "all 0.5s ease",
        borderBottom: navBg ? "1px solid rgba(201,168,124,0.15)" : "1px solid transparent",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: navBg ? 70 : 90, transition: "height 0.5s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: COLORS.white, letterSpacing: 8 }}>MAYDO</span>
            <span style={{ fontSize: 14, color: COLORS.camel, fontWeight: 300, opacity: 0.8 }}>日式</span>
          </div>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span style={menuOpen ? { transform: "rotate(45deg) translate(4px,4px)" } : {}} />
            <span style={menuOpen ? { opacity: 0 } : {}} />
            <span style={menuOpen ? { transform: "rotate(-45deg) translate(4px,-4px)" } : {}} />
          </button>
          <div className={`nav-links ${menuOpen ? "open" : ""}`} style={{ display: "flex", alignItems: "center", gap: 36 }}>
            {t.nav.map((item, i) => <a key={i} href="#" className="nav-link" onClick={() => setMenuOpen(false)}>{item}</a>)}
            <button onClick={() => { setLang(lang === "es" ? "zh" : "es"); setMenuOpen(false); }} style={{
              background: "transparent", border: `1px solid ${COLORS.camel}`, color: COLORS.camel,
              padding: "6px 16px", fontSize: 12, letterSpacing: 2, cursor: "pointer",
              fontFamily: "'Zen Kaku Gothic New', sans-serif", transition: "all 0.3s",
            }}>
              {t.langSwitch}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ height: "100vh", minHeight: 700, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative", overflow: "hidden", background: `linear-gradient(160deg, ${COLORS.maroonDark} 0%, ${COLORS.maroon} 40%, ${COLORS.maroonLight} 100%)` }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div style={{ position: "absolute", top: "12%", right: "8%", fontSize: 220, fontWeight: 300, color: "rgba(255,255,255,0.035)", fontFamily: "'Noto Serif SC', serif", userSelect: "none", lineHeight: 1 }}>真</div>
        <div style={{ position: "absolute", bottom: "10%", left: "6%", fontSize: 180, fontWeight: 300, color: "rgba(255,255,255,0.035)", fontFamily: "'Noto Serif SC', serif", userSelect: "none" }}>味</div>

        <div style={{ position: "relative", zIndex: 2 }}>
          <p className="hero-sub" style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: 12, letterSpacing: 6, color: COLORS.camel, textTransform: "uppercase", fontWeight: 300, marginBottom: 32 }}>{t.hero.sub}</p>
          <h1 className="hero-title" style={{ fontSize: "clamp(64px, 12vw, 150px)", fontWeight: 300, color: COLORS.white, letterSpacing: "clamp(12px, 3vw, 30px)", lineHeight: 1, marginBottom: 8 }}>{t.hero.title}</h1>
          <p style={{ fontSize: "clamp(16px, 2.5vw, 24px)", color: "rgba(255,255,255,0.3)", fontWeight: 300, letterSpacing: 6, marginBottom: 32, fontFamily: "'Noto Serif SC', serif" }}>{t.hero.tagline}</p>
          <DiamondDivider color="rgba(201,168,124,0.5)" />
          <p className="hero-desc" style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.5)", fontWeight: 300, letterSpacing: 1, lineHeight: 1.8, maxWidth: 460, margin: "0 auto 48px", padding: "0 20px" }}>{t.hero.desc}</p>
          <div className="hero-cta" style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
            <button className="btn-primary">{t.hero.cta}</button>
            <button className="btn-outline">{t.hero.cta2}</button>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, animation: "shimmer 2.5s ease infinite", zIndex: 2 }}>
          <span style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 3 }}>SCROLL</span>
          <div style={{ width: 1, height: 30, background: "linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)" }} />
        </div>
      </section>

      {/* About with image */}
      <section style={{ padding: "clamp(80px,12vw,160px) 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div className="about-layout" style={{ display: "flex", gap: 80, alignItems: "center" }}>
          <FadeIn style={{ flex: 1, minWidth: 280 }}>
            <p className="section-sub">{t.about.sub}</p>
            <h2 className="section-title">{t.about.title}</h2>
            <DiamondDivider color={COLORS.camel} />
            <p className="section-desc">{t.about.desc}</p>
            <div style={{ display: "flex", gap: 48, marginTop: 48, flexWrap: "wrap" }}>
              {[
                { num: t.about.stat1, label: t.about.stat1Label },
                { num: t.about.stat2, label: t.about.stat2Label },
                { num: t.about.stat3, label: t.about.stat3Label },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36, fontWeight: 300, color: COLORS.maroon }}>{s.num}</div>
                  <div style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: 12, color: COLORS.gray, letterSpacing: 2, marginTop: 6, fontWeight: 300 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeInScale delay={0.2} style={{ flex: 1, minWidth: 280 }}>
            <div style={{ position: "relative", maxWidth: 420 }}>
              <div style={{ aspectRatio: "4/5", overflow: "hidden" }}>
                <img src={IMAGES.about} alt="Sushi preparation" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              <div style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 0 1px rgba(201,168,124,0.2)` }} />
              <div style={{ position: "absolute", top: -16, right: -16, width: 120, height: 120, border: `1px solid ${COLORS.camel}`, opacity: 0.25 }} />
              <div style={{ position: "absolute", bottom: -16, left: -16, width: 80, height: 80, background: COLORS.maroon, opacity: 0.08 }} />
            </div>
          </FadeInScale>
        </div>
      </section>

      {/* Menu with food images */}
      <section style={{ padding: "clamp(80px,10vw,120px) 40px", background: COLORS.white }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <p className="section-sub">{t.menu.sub}</p>
            <h2 className="section-title">{t.menu.title}</h2>
            <DiamondDivider color={COLORS.camel} />
            <p className="section-desc" style={{ margin: "0 auto 60px" }}>{t.menu.desc}</p>
          </FadeIn>
          <div className="menu-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            {t.menu.items.map((item, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="menu-card">
                  <div style={{ height: 220, overflow: "hidden" }}>
                    <img className="menu-card-img" src={[IMAGES.food1, IMAGES.food2, IMAGES.food3][i]} alt={item.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                  <div style={{ padding: "32px 28px 36px" }}>
                    <div style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: 11, color: COLORS.camel, letterSpacing: 3, marginBottom: 16 }}>{item.time}</div>
                    <h3 style={{ fontSize: 26, fontWeight: 400, color: COLORS.maroon, marginBottom: 12 }}>{item.title}</h3>
                    <p style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: 14, color: COLORS.gray, lineHeight: 1.7, fontWeight: 300, marginBottom: 24 }}>{item.desc}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                      <div style={{ width: 20, height: 1, background: COLORS.camel }} />
                      <span style={{ fontSize: 28, fontWeight: 300, color: COLORS.maroon }}>{item.price}</span>
                      <div style={{ width: 20, height: 1, background: COLORS.camel }} />
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Fullwidth image divider with quote */}
      <section style={{ height: 500, position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${COLORS.maroonDark}, ${COLORS.maroon})` }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "30px 30px" }} />
        <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
          <FadeIn>
            <div style={{ textAlign: "center", padding: "0 40px" }}>
              <p style={{ fontSize: "clamp(24px,3.5vw,42px)", fontWeight: 300, color: COLORS.white, lineHeight: 1.5, maxWidth: 700, fontStyle: "italic" }}>
                "Una comida japonesa bien preparada tiene sabores delicados que hay que retener en la boca para apreciarlos"
              </p>
              <DiamondDivider color="rgba(201,168,124,0.5)" />
              <p style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: 12, color: COLORS.camel, letterSpacing: 4, marginTop: 8 }}>— MAYDO</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Gallery */}
      <section style={{ padding: "clamp(80px,10vw,120px) 40px", background: COLORS.cream }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p className="section-sub">{t.gallery.sub}</p>
              <h2 className="section-title">{t.gallery.title}</h2>
              <DiamondDivider color={COLORS.camel} />
            </div>
          </FadeIn>
          <div className="gallery-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "240px 240px", gap: 16 }}>
            <FadeInScale delay={0} style={{ gridRow: "span 2" }}>
              <div className="gallery-item gallery-tall" style={{ height: "100%" }}>
                <img src={IMAGES.gallery1} alt="Gallery" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div className="gallery-overlay" />
              </div>
            </FadeInScale>
            <FadeInScale delay={0.1} style={{ height: "100%" }}>
              <div className="gallery-item" style={{ height: "100%" }}>
                <img src={IMAGES.gallery2} alt="Gallery" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div className="gallery-overlay" />
              </div>
            </FadeInScale>
            <FadeInScale delay={0.2} style={{ height: "100%" }}>
              <div className="gallery-item" style={{ height: "100%" }}>
                <img src={IMAGES.gallery3} alt="Gallery" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div className="gallery-overlay" />
              </div>
            </FadeInScale>
            <FadeInScale delay={0.15} style={{ gridColumn: "2 / 4", height: "100%" }}>
              <div className="gallery-item gallery-wide" style={{ height: "100%" }}>
                <img src={IMAGES.gallery4} alt="Gallery" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div className="gallery-overlay" />
              </div>
            </FadeInScale>
          </div>
        </div>
      </section>

      {/* Reservation with image */}
      <section style={{ padding: "clamp(80px,12vw,160px) 40px", background: COLORS.white }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="reserve-layout" style={{ display: "flex", gap: 60, alignItems: "stretch" }}>
            <FadeInScale style={{ flex: "0 0 380px", minHeight: 500 }}>
              <div style={{ height: "100%", minHeight: 500, position: "relative", overflow: "hidden" }}>
                <img src={IMAGES.reserve} alt="Restaurant ambiance" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: 500 }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(92,46,46,0.35), transparent 50%)" }} />
              </div>
            </FadeInScale>
            <FadeIn delay={0.2} style={{ flex: 1, minWidth: 300 }}>
              <p className="section-sub">{t.reserve.sub}</p>
              <h2 className="section-title">{t.reserve.title}</h2>
              <DiamondDivider color={COLORS.camel} />
              <p className="section-desc" style={{ marginBottom: 40 }}>{t.reserve.desc}</p>
              <div style={{ background: COLORS.cream, padding: "clamp(24px,4vw,48px)", border: `1px solid ${COLORS.beige}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 30px" }}>
                  <div style={{ gridColumn: "1 / -1" }}><input className="form-input" placeholder={t.reserve.name} /></div>
                  <div><input className="form-input" placeholder={t.reserve.email} /></div>
                  <div><input className="form-input" placeholder={t.reserve.phone} /></div>
                  <div><input className="form-input" type="date" /></div>
                  <div>
                    <select className="form-input" style={{ cursor: "pointer" }}>
                      <option>{t.reserve.time}</option>
                      <option>13:00</option><option>13:30</option><option>14:00</option><option>14:30</option>
                      <option>20:30</option><option>21:00</option><option>21:30</option><option>22:00</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <select className="form-input" style={{ cursor: "pointer" }}>
                      <option>{t.reserve.guests}</option>
                      <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6+</option>
                    </select>
                  </div>
                </div>
                <button className="btn-primary" style={{ width: "100%", marginTop: 36 }}>{t.reserve.btn}</button>
                <p style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: 12, color: COLORS.gray, textAlign: "center", marginTop: 16, fontWeight: 300 }}>{t.reserve.note}</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: COLORS.maroonDark, padding: "80px 40px 40px", color: COLORS.white }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 60, marginBottom: 60 }}>
            <div>
              <span style={{ fontSize: 36, fontWeight: 300, letterSpacing: 10, display: "block", marginBottom: 8 }}>MAYDO</span>
              <span style={{ fontSize: 16, color: COLORS.camel, fontWeight: 300 }}>日式</span>
              <DiamondDivider color="rgba(201,168,124,0.3)" />
              <p style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, fontWeight: 300, maxWidth: 300 }}>
                {lang === "es" ? "Donde la tradición japonesa se encuentra con la elegancia mediterránea." : "日本传统与地中海优雅的邂逅。"}
              </p>
            </div>
            <div>
              <h4 style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: 11, letterSpacing: 3, color: COLORS.camel, marginBottom: 24, fontWeight: 400 }}>{t.footer.hours}</h4>
              {t.footer.hoursDetail.map((line, i) => (
                <p key={i} style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 2, fontWeight: 300 }}>{line}</p>
              ))}
            </div>
            <div>
              <h4 style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: 11, letterSpacing: 3, color: COLORS.camel, marginBottom: 24, fontWeight: 400 }}>{t.footer.contact}</h4>
              <p style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 2, fontWeight: 300 }}>
                +34 936 844 036<br />sushimaydobcn<br />plazaeuropa@gmail.com
              </p>
            </div>
            <div>
              <h4 style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: 11, letterSpacing: 3, color: COLORS.camel, marginBottom: 24, fontWeight: 400 }}>{t.footer.location}</h4>
              <p style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 2, fontWeight: 300, whiteSpace: "pre-line" }}>{t.footer.address}</p>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 30, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <p style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.25)", fontWeight: 300 }}>© 2026 Sushi Maydo. All rights reserved.</p>
            <div style={{ display: "flex", gap: 24 }}>
              {["Instagram", "Facebook", "Google"].map((s) => (
                <a key={s} href="#" style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: 1, transition: "color 0.3s" }}
                  onMouseEnter={e => e.target.style.color = COLORS.camel}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.3)"}
                >{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
