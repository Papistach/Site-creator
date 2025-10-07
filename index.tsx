import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

// Hook personnalisé pour le parallaxe souris
const useMouseParallax = (strength = 20) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * strength;
      const y = (e.clientY / window.innerHeight - 0.5) * strength;
      setPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [strength, prefersReducedMotion]);

  return position;
};

// Hook pour effet tilt 3D
const useTilt = () => {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return;

    const element = ref.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      setTilt({ rotateX, rotateY });
    };

    const handleMouseLeave = () => {
      setTilt({ rotateX: 0, rotateY: 0 });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [prefersReducedMotion]);

  return { ref, tilt };
};

// Curseur personnalisé
const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button, a')) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = () => {
      setIsHovering(false);
    };

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <motion.div
      className="hidden md:block fixed top-0 left-0 w-6 h-6 rounded-full border-2 border-emerald-500 pointer-events-none z-50 mix-blend-difference"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        scale: isHovering ? 1.5 : 1,
        backgroundColor: isHovering ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
      }}
      transition={{ duration: 0.2 }}
    />
  );
};

// Particules flottantes
const FloatingShapes = () => {
  const mousePos = useMouseParallax(30);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) return null;

  const shapes = [
    { size: 60, top: '10%', left: '10%', color: 'bg-emerald-500/10' },
    { size: 80, top: '60%', left: '80%', color: 'bg-orange-500/10' },
    { size: 50, top: '80%', left: '20%', color: 'bg-blue-500/10' },
    { size: 70, top: '30%', left: '70%', color: 'bg-purple-500/10' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${shape.color} blur-xl`}
          style={{
            width: shape.size,
            height: shape.size,
            top: shape.top,
            left: shape.left,
          }}
          animate={{
            x: mousePos.x * (i % 2 === 0 ? 1 : -1),
            y: mousePos.y * (i % 2 === 0 ? 1 : -1),
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        />
      ))}
    </div>
  );
};

// Hero Section
const Hero = () => {
  const parallax = useMouseParallax(15);

  return (
    <section className="relative min-h-screen bg-slate-900 overflow-hidden flex items-center justify-center">
      <FloatingShapes />
      
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          x: parallax.x * 0.5,
          y: parallax.y * 0.5,
        }}
      >
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          <circle cx="200" cy="200" r="100" fill="#10b981" opacity="0.3" />
          <circle cx="800" cy="600" r="150" fill="#f97316" opacity="0.3" />
          <rect x="600" y="100" width="120" height="120" fill="#3b82f6" opacity="0.3" />
        </svg>
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.h1
          className="text-5xl md:text-7xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            x: parallax.x * 0.3,
            y: parallax.y * 0.3,
          }}
        >
          Nous concevons des sites web qui convertissent
        </motion.h1>
        
        <motion.p
          className="text-xl md:text-2xl text-gray-300 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            x: parallax.x * 0.2,
            y: parallax.y * 0.2,
          }}
        >
          Sites vitrines, e-commerce et webapps — design, performance, impact.
        </motion.p>

        <motion.button
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Demander un devis
        </motion.button>
      </div>
    </section>
  );
};

// Service Card avec effet tilt
const ServiceCard = ({ title, description, icon }: { title: string; description: string; icon: string }) => {
  const { ref, tilt } = useTilt();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      className="relative bg-slate-800 rounded-2xl p-8 overflow-hidden cursor-pointer"
      style={{
        transformStyle: 'preserve-3d',
      }}
      animate={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative z-10">
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>

      <motion.div
        className="absolute -bottom-4 -right-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"
        animate={{
          scale: isHovered ? 1.5 : 1,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

// Services Section
const Services = () => {
  const services = [
    {
      title: 'Sites Vitrine',
      description: 'Présentez votre entreprise avec élégance et professionnalisme.',
      icon: '🎨',
    },
    {
      title: 'E-Commerce',
      description: 'Boutiques en ligne optimisées pour maximiser vos ventes.',
      icon: '🛒',
    },
    {
      title: 'Blogs',
      description: 'Plateformes de contenu performantes et SEO-friendly.',
      icon: '📝',
    },
    {
      title: 'WebApps',
      description: 'Applications web sur mesure pour vos besoins spécifiques.',
      icon: '⚡',
    },
  ];

  return (
    <section className="py-20 bg-slate-900" id="services">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Nos Services
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ServiceCard {...service} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Portfolio Item
const PortfolioItem = ({ title, category, image }: { title: string; category: string; image: string }) => {
  const { ref, tilt } = useTilt();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        transformStyle: 'preserve-3d',
        backgroundColor: image,
        height: '300px',
      }}
      animate={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent flex flex-col justify-end p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <span className="text-emerald-500 text-sm font-semibold uppercase tracking-wider">
                {category}
              </span>
              <h3 className="text-2xl font-bold text-white mt-2">{title}</h3>
              <button className="mt-4 text-white border border-white px-4 py-2 rounded-full text-sm hover:bg-white hover:text-slate-900 transition-colors">
                Voir le projet
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Portfolio Section
const Portfolio = () => {
  const projects = [
    { title: 'Restaurant La Maison', category: 'Site Vitrine', image: '#1e293b' },
    { title: 'Boutique Mode', category: 'E-Commerce', image: '#0f766e' },
    { title: 'Tech Blog', category: 'Blog', image: '#7c2d12' },
    { title: 'Dashboard Analytics', category: 'WebApp', image: '#1e40af' },
    { title: 'Agence Immobilière', category: 'Site Vitrine', image: '#581c87' },
    { title: 'Marketplace Art', category: 'E-Commerce', image: '#9a3412' },
  ];

  return (
    <section className="py-20 bg-slate-800" id="portfolio">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Portfolio
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <PortfolioItem {...project} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// About Section
const About = () => {
  return (
    <section className="py-20 bg-slate-900" id="about">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          À Propos
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-bold text-white mb-6">Notre Mission</h3>
            <p className="text-gray-400 mb-4">
              Nous créons des expériences web exceptionnelles qui allient design moderne, performance optimale et impact mesurable.
            </p>
            <p className="text-gray-400">
              Notre équipe passionnée transforme vos idées en solutions digitales innovantes qui font la différence.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-6"
          >
            {['Excellence', 'Innovation', 'Performance', 'Engagement'].map((value, i) => (
              <div key={i} className="bg-slate-800 p-6 rounded-xl text-center">
                <div className="text-4xl mb-2">✨</div>
                <h4 className="text-white font-semibold">{value}</h4>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Contact Section
const Contact = () => {
  return (
    <section className="py-20 bg-slate-800" id="contact">
      <div className="max-w-4xl mx-auto px-6">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Contact
        </motion.h2>

        <motion.form
          className="space-y-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="name">Nom</label>
            <input
              type="text"
              id="name"
              className="w-full bg-slate-900 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-emerald-500 focus:outline-none transition-colors"
              placeholder="Votre nom"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="w-full bg-slate-900 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-emerald-500 focus:outline-none transition-colors"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2" htmlFor="message">Message</label>
            <textarea
              id="message"
              rows={5}
              className="w-full bg-slate-900 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
              placeholder="Parlez-nous de votre projet..."
            />
          </div>

          <motion.button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Envoyer le message
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="bg-slate-900 py-12 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-xl mb-4">Agence Web</h3>
            <p className="text-gray-400">Excellence digitale depuis 2020</p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2">
              {['Services', 'Portfolio', 'À Propos', 'Contact'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="text-gray-400 hover:text-emerald-500 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Réseaux Sociaux</h4>
            <div className="flex gap-4">
              {['LinkedIn', 'Twitter', 'Instagram'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-gray-400 hover:text-emerald-500 hover:bg-slate-700 transition-colors"
                  aria-label={social}
                >
                  {social[0]}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Agence Web. Tous droits réservés. | <a href="#" className="hover:text-emerald-500">Mentions Légales</a></p>
        </div>
      </div>
    </footer>
  );
};

// Navigation
const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all ${
        isScrolled ? 'bg-slate-900/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <a href="#" className="text-white font-bold text-2xl">Agence Web</a>
        
        <ul className="hidden md:flex gap-8">
          {['Services', 'Portfolio', 'À Propos', 'Contact'].map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-gray-300 hover:text-emerald-500 transition-colors"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </motion.nav>
  );
};

// App principal
export default function App() {
  return (
    <div className="bg-slate-900 cursor-none md:cursor-auto">
      <CustomCursor />
      <Navigation />
      <Hero />
      <Services />
      <Portfolio />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}
