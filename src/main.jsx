import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import './styles.css';

const PHOTO_SRC = '/nishant-photo.jpg';
const ENABLE_SMOOTH_SCROLL = false;
const ENABLE_CUSTOM_CURSOR = true;
const ENABLE_3D_SCENES = false;
const Hero3D = lazy(() => import('./Scenes.jsx').then((module) => ({ default: module.Hero3D })));
const RotatingOrb = lazy(() =>
  import('./Scenes.jsx').then((module) => ({ default: module.RotatingOrb })),
);
const GridPlane = lazy(() => import('./Scenes.jsx').then((module) => ({ default: module.GridPlane })));

const socials = [
  ['GitHub', 'https://github.com/nishant92005'],
  ['LinkedIn', 'https://linkedin.com/in/nishant-sh4rma'],
  ['Email', 'mailto:nishant92005@gmail.com'],
];

const skillGroups = [
  ['LANGUAGES', ['C / C++', 'Java', 'Python', 'JavaScript']],
  ['DEVELOPMENT', ['Node.js', 'React', 'Next.js', 'Flask', 'Django', 'FastAPI']],
  [
    'AI / ML',
    [
      'LangChain',
      'RAG',
      'LLMs',
      'Vector DB',
      'Transformers',
      'Prompt Engineering',
      'NLP',
      'Supervised Learning',
      'CNN',
      'RNN',
    ],
  ],
  ['DATABASES', ['MongoDB', 'SQL']],
];

const projects = [
  {
    size: 'project-large',
    tag: 'AI ASSISTANT · LOCAL-FIRST',
    title: 'Omni Copilot',
    description:
      'Local-first AI assistant with FastAPI backend and React/Vite frontend. Combines conversational UI, streaming responses, Google Workspace actions, desktop automation, and Ollama-powered multi-step agent workflows.',
    github: 'https://github.com/nishant92005/Omni-Copilot',
    stack: ['FastAPI', 'React', 'Ollama', 'Python'],
    accent: 'violet',
  },
  {
    size: 'project-medium',
    tag: 'AI OUTREACH · AUTOMATION',
    title: 'FireReach',
    description:
      'AI-powered outreach system that collects public company signals, summarizes them, generates personalized outreach emails, and lets users review and send — end to end automated.',
    github: 'https://github.com/nishant92005/Fire-Reach',
    stack: ['Python', 'AI', 'Email Automation'],
  },
  {
    size: 'project-medium',
    tag: 'AI · ENVIRONMENT · NLP',
    title: 'Green AI',
    description:
      'AI-powered system analyzing construction project descriptions to detect environmental risks — air pollution, dust, poor AQI. Uses retrieval-based evaluation to flag whether activities are environmentally safe.',
    github: 'https://github.com/nishant92005/Green-AI',
    stack: ['NLP', 'RAG', 'Python'],
  },
  {
    size: 'project-large',
    tag: '3D GAME · REACT · WEBGL',
    title: 'Cyber Runner',
    description:
      'Fast-paced endless runner built with React, Vite, and React Three Fiber. Neon sci-fi track, obstacle dodging, coin collection, power-ups, and a live top-3 online leaderboard.',
    github: 'https://github.com/nishant92005/Cyber-runner',
    stack: ['React Three Fiber', 'Vite', 'WebGL'],
    accent: 'scan',
  },
  {
    size: 'project-medium',
    tag: 'COMPUTER VISION · ML',
    title: 'Smart Attendance System',
    description:
      'Intelligent facial recognition attendance system using the LBPH algorithm. Automatically detects and records student presence in real-time, reducing manual effort and ensuring accuracy.',
    github:
      'https://github.com/nishant92005/Smart-Attendance-System/tree/main/Smart-Attendace-System--main',
    stack: ['OpenCV', 'Python', 'LBPH'],
  },
];

function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reduced;
}

function SmoothScroll() {
  useEffect(() => {
    let lenis;
    let frame = 0;
    let alive = true;
    const tick = (time) => {
      lenis?.raf(time);
      frame = requestAnimationFrame(tick);
    };
    import('@studio-freight/lenis').then(({ default: Lenis }) => {
      if (!alive) return;
      lenis = new Lenis({ lerp: 0.075, smoothWheel: true });
      frame = requestAnimationFrame(tick);
    });
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);
  return null;
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });
  return <motion.div className="scroll-progress" style={{ scaleX }} />;
}

function DeferredScene({ children, fallback }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ENABLE_3D_SCENES) return;
    if (window.innerWidth < 900) return;
    const loadWhenIdle = window.requestIdleCallback || ((callback) => setTimeout(callback, 350));
    const idleId = loadWhenIdle(() => setReady(true));
    return () => {
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId);
      }
    };
  }, []);

  if (!ready) return fallback;
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

function Cursor() {
  const dotRef = useRef(null);
  const trailRefs = useRef([]);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const coords = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const previous = { ...coords };
    let angle = 35;
    let speed = 0;
    const particles = Array.from({ length: 8 }, () => ({ ...coords }));

    const move = (event) => {
      coords.x = event.clientX;
      coords.y = event.clientY;
    };

    const hoverables = document.querySelectorAll('a, button, input, textarea, select, .tilt-card');
    const enter = () => dotRef.current?.classList.add('is-hovering');
    const leave = () => dotRef.current?.classList.remove('is-hovering');
    hoverables.forEach((node) => {
      node.addEventListener('mouseenter', enter);
      node.addEventListener('mouseleave', leave);
    });
    window.addEventListener('mousemove', move);

    let frame = 0;
    const animate = () => {
      const dx = coords.x - previous.x;
      const dy = coords.y - previous.y;
      speed = speed * 0.82 + Math.min(1, Math.sqrt(dx * dx + dy * dy) / 42) * 0.18;
      if (Math.abs(dx) + Math.abs(dy) > 0.2) {
        angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      }
      previous.x = coords.x;
      previous.y = coords.y;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${coords.x}px, ${coords.y}px, 0)`;
        dotRef.current.style.setProperty('--rocket-angle', `${angle}deg`);
      }

      let nextX = coords.x;
      let nextY = coords.y;
      particles.forEach((particle, index) => {
        particle.x += (nextX - particle.x) * 0.22;
        particle.y += (nextY - particle.y) * 0.22;
        nextX = particle.x;
        nextY = particle.y;
        const el = trailRefs.current[index];
        if (el) {
          el.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0) rotate(${angle}deg)`;
          el.style.opacity = `${Math.max(0, speed - index * 0.08)}`;
        }
      });
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', move);
      hoverables.forEach((node) => {
        node.removeEventListener('mouseenter', enter);
        node.removeEventListener('mouseleave', leave);
      });
    };
  }, []);

  return (
    <div className="cursor-layer" aria-hidden="true">
      <span ref={dotRef} className="cursor-dot">
        <span className="rocket-ship" />
      </span>
      {Array.from({ length: 8 }).map((_, index) => (
        <span
          key={index}
          ref={(el) => {
            trailRefs.current[index] = el;
          }}
          className="cursor-trail"
        />
      ))}
    </div>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const update = () => setCompact(window.scrollY > 60);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const links = ['Home', 'About', 'Projects', 'Skills', 'Contact'];

  return (
    <header className={`site-nav ${compact ? 'is-compact' : ''}`}>
      <a className="monogram" href="#home" aria-label="Nishant Sharma home">
        NS
      </a>
      <img className="nav-avatar" src={PHOTO_SRC} alt="Nishant Sharma" />
      <nav className={`nav-links ${open ? 'is-open' : ''}`} aria-label="Primary navigation">
        {links.map((link) => (
          <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setOpen(false)}>
            {link}
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <span className="work-badge">
          <span /> Open to Work
        </span>
        <a className="hire-button" href="#contact">
          Contact Me →
        </a>
        <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)}>
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

function PhotoFrame({ variant = 'hero' }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <figure className={`photo-frame ${variant}`}>
      <div className="photo-glow" />
      <img
        src={PHOTO_SRC}
        alt="Nishant Sharma"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(false)}
      />
      {!loaded && (
        <div className="photo-fallback">
          <strong>NS</strong>
          <span>public/nishant-photo.jpg</span>
        </div>
      )}
    </figure>
  );
}

function Sparkline() {
  return (
    <svg className="sparkline" viewBox="0 0 160 42" aria-hidden="true">
      <polyline points="0,35 20,22 36,28 52,12 70,17 91,6 116,19 136,10 160,3" />
    </svg>
  );
}

function Hero() {
  const { scrollYProgress } = useScroll();
  const bgY = useTransform(scrollYProgress, [0, 0.3], [0, 120]);
  const midY = useTransform(scrollYProgress, [0, 0.3], [0, 65]);

  return (
    <section id="home" className="hero section">
      <motion.div className="hero-bg" style={{ y: bgY }}>
        <DeferredScene fallback={<div className="scene-fallback hero-fallback" />}>
          <Hero3D />
        </DeferredScene>
      </motion.div>
      <div className="scanlines" />
      <div className="hero-grid">
        <motion.div className="hero-copy reveal-block" style={{ y: midY }}>
          <p className="ai-highlight">AI | ML</p>
          <h1 className="glitch-title" data-text="NISHANT SHARMA">
            NISHANT SHARMA
          </h1>
          <div className="hero-role-lines">
            <span>DEVELOPER</span>
            <em>& BUILDER</em>
          </div>
          <p className="hero-line">
            I build AI systems that think, interfaces that breathe, and software that matters.
          </p>
          <div className="availability">
            <span /> Available for Work
          </div>
          <div className="hero-buttons">
            <a className="button primary" href="#projects">
              View My Work ↓
            </a>
          </div>
          <div className="social-strip">
            {socials.map(([label, href]) => (
              <a key={label} href={href}>
                {label}
              </a>
            ))}
          </div>
        </motion.div>
        <motion.div className="hero-portrait reveal-block" style={{ y: useTransform(scrollYProgress, [0, 0.3], [0, 35]) }}>
          <div className="orb-layer">
            <DeferredScene fallback={<div className="scene-fallback orb-fallback" />}>
              <RotatingOrb />
            </DeferredScene>
          </div>
          <PhotoFrame />
          <aside className="info-card">
            <strong>5+ Projects · AI/ML · Open Source</strong>
            <Sparkline />
          </aside>
          <span className="version-label">v2.0 · 2025</span>
        </motion.div>
      </div>
    </section>
  );
}

function Marquee() {
  const text =
    'AI/ML Engineering · Full Stack Development · Computer Vision · NLP · LLM Fine-tuning · Open Source · RAG Systems · FastAPI · React · Python ·';
  return (
    <section className="marquee" aria-label="Capabilities ticker">
      <div className="marquee-track">
        {[0, 1].map((set) => (
          <span key={set}>
            {text.split(' · ').filter(Boolean).map((item) => (
              <React.Fragment key={`${set}-${item}`}>
                {item} <b>◆</b>
              </React.Fragment>
            ))}
          </span>
        ))}
      </div>
    </section>
  );
}

function SectionLabel({ number, label }) {
  return (
    <p className="section-label">
      <span>{number}</span> — {label}
    </p>
  );
}

function CountStat({ end, suffix, label }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    let count;
    import('countup.js').then(({ CountUp }) => {
      if (!ref.current) return;
      count = new CountUp(ref.current, end, {
        suffix,
        duration: 1.8,
        enableScrollSpy: true,
        scrollSpyOnce: true,
      });
      if (!count.error) count.start();
    });
    return () => count?.reset();
  }, [end, suffix]);

  return (
    <article className="stat-card reveal-card">
      <strong ref={ref}>0</strong>
      <span>{label}</span>
    </article>
  );
}

function About() {
  return (
    <section id="about" className="section about-section">
      <div className="section-inner two-col">
        <div className="about-copy reveal-block">
          <SectionLabel number="01" label="ABOUT" />
          <h2>Something About Me</h2>
          <p>
            I'm Nishant Sharma — a passionate developer, AI enthusiast, and creative problem solver
            who loves building technology that feels modern, impactful, and visually powerful. With a
            strong foundation in Python, C++, Java, AI/ML, and frontend design, I focus on creating
            real-world projects that combine performance with user experience. From developing
            AI-powered product recommendation systems and bank loan optimization platforms to
            building interactive web applications with attractive UI/UX, I enjoy turning ambitious
            ideas into functional digital products.
          </p>
          <div className="contact-row">
            <a href="mailto:nishant92005@gmail.com">📧 nishant92005@gmail.com</a>
            <a href="tel:+919350916776">📞 +91 9350916776</a>
          </div>
          <div className="icon-row">
            <a href="https://github.com/nishant92005">GitHub</a>
            <a href="https://linkedin.com/in/nishant-sh4rma">LinkedIn</a>
          </div>
        </div>
        <div className="stats-zone reveal-block">
          <div className="stats-grid-bg">
            <DeferredScene fallback={<div className="scene-fallback grid-fallback" />}>
              <GridPlane />
            </DeferredScene>
          </div>
          <CountStat end={5} suffix="+" label="Projects Shipped" />
          <CountStat end={3} suffix="+" label="AI Systems Built" />
          <CountStat end={100} suffix="%" label="Commitment" />
        </div>
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section id="skills" className="section skills-section">
      <div className="section-inner">
        <SectionLabel number="02" label="SKILLS" />
        <h2 className="stacked-heading">Weapons of Choice</h2>
        <div className="skills-layout">
          <div className="skill-orbit" aria-hidden="true">
            <div className="css-orbit" />
            {['RAG', 'NLP', 'LLM', 'CV', 'API', 'UI'].map((label, index) => (
              <span key={label} style={{ '--i': index }}>
                {label}
              </span>
            ))}
          </div>
          <div className="skill-groups">
            {skillGroups.map(([group, skills], groupIndex) => (
              <div className="skill-group reveal-block" key={group} style={{ '--delay': `${groupIndex * 90}ms` }}>
                <h3>{group}</h3>
                <div>
                  {skills.map((skill, index) => (
                    <span className="skill-pill" key={skill} style={{ '--delay': `${index * 42}ms` }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Projects() {
  useEffect(() => {
    if (window.innerWidth < 900 || window.matchMedia('(pointer: coarse)').matches) return;
    const cards = document.querySelectorAll('.tilt-card');
    let mounted = true;
    import('vanilla-tilt').then(({ default: VanillaTilt }) => {
      if (!mounted) return;
      VanillaTilt.init(cards, {
        max: 8,
        speed: 550,
        glare: true,
        'max-glare': 0.18,
        perspective: 900,
      });
    });
    return () => {
      mounted = false;
      cards.forEach((card) => card.vanillaTilt?.destroy());
    };
  }, []);

  return (
    <section id="projects" className="section projects-section">
      <div className="section-inner">
        <SectionLabel number="03" label="PROJECTS" />
        <h2 className="stacked-heading">Things I've Built</h2>
        <div className="project-grid">
          {projects.map((project, index) => (
            <article
              className={`project-card tilt-card reveal-card ${project.size} ${project.accent || ''}`}
              key={project.title}
              style={{ '--delay': `${index * 80}ms` }}
            >
              <a className="github-link" href={project.github} aria-label={`${project.title} GitHub`}>
                GH
              </a>
              <p>{project.tag}</p>
              <h3>{project.title}</h3>
              <span className="project-rule" />
              <p className="project-description">{project.description}</p>
              <div className="stack-badges">
                {project.stack.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="section contact-section">
      <div className="contact-grid-bg">
        <DeferredScene fallback={<div className="scene-fallback grid-fallback" />}>
          <GridPlane />
        </DeferredScene>
      </div>
      <div className="section-inner contact-grid">
        <div className="contact-photo reveal-block">
          <SectionLabel number="04" label="CONTACT" />
          <PhotoFrame variant="contact" />
          <span className="contact-watermark">
            OPEN TO WORK
          </span>
        </div>
        <div className="contact-panel reveal-block">
          <h2>Let's Build Something Insane Together</h2>
          <p className="contact-copy">
            AI/ML Project · Web App · Collaboration · Other
          </p>
          <a className="button primary contact-mail-button" href="mailto:nishant92005@gmail.com">
            Send Message →
          </a>
          <div className="contact-details">
            <a href="mailto:nishant92005@gmail.com">📧 nishant92005@gmail.com</a>
            <a href="tel:+919350916776">📞 +91 9350916776</a>
            <a href="https://github.com/nishant92005">GitHub: github.com/nishant92005</a>
            <a href="https://linkedin.com/in/nishant-sh4rma">
              LinkedIn: linkedin.com/in/nishant-sh4rma
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <span>© 2025 Nishant Sharma.</span>
      <a href="#home">↑ Back to top</a>
      <span>Crafted with obsession by NS</span>
    </footer>
  );
}

function App() {
  const reduced = useReducedMotionPreference();

  useEffect(() => {
    if (reduced) return;
    if (window.innerWidth < 760) return;
    let cleanup = () => {};
    const loadWhenIdle = window.requestIdleCallback || ((callback) => setTimeout(callback, 250));
    const idleId = loadWhenIdle(() => {
      Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
        ([{ default: gsap }, { ScrollTrigger }]) => {
          gsap.registerPlugin(ScrollTrigger);
          gsap.from('.site-nav', { y: -14, duration: 0.45, ease: 'power3.out' });
          gsap.utils.toArray('.section:not(.hero)').forEach((section) => {
            gsap.from(section.querySelectorAll('.reveal-block, .reveal-card'), {
              y: 36,
              opacity: 0,
              duration: 0.5,
              ease: 'power3.out',
              stagger: 0.06,
              scrollTrigger: {
                trigger: section,
                start: 'top 78%',
              },
            });
          });
          cleanup = () => ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        },
      );
    });

    return () => {
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId);
      }
      cleanup();
    };
  }, [reduced]);

  return (
    <>
      {!reduced && ENABLE_SMOOTH_SCROLL && <SmoothScroll />}
      <ScrollProgress />
      {ENABLE_CUSTOM_CURSOR && <Cursor />}
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
