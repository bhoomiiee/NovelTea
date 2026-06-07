import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Users, Coffee, ArrowRight, Quote } from 'lucide-react';
import heroVintage from '../assets/hero_vintage.png';

const Home = () => {
  return (
    <div className="min-h-screen bg-[var(--color-tea-50)] relative overflow-hidden selection:bg-[var(--color-tea-200)]">
      {/* Warm background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(186,129,83,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-2.5 text-[var(--color-tea-950)] bg-white/40 px-4 py-2 rounded-full border border-[var(--color-tea-200)]/60 backdrop-blur-md">
          <div className="w-9 h-9 rounded-full bg-[var(--color-tea-800)] flex items-center justify-center text-white shadow-md">
            <Coffee size={18} />
          </div>
          <span className="text-2xl font-extrabold tracking-tight font-serif">NovelTea</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/login" className="px-5 py-2 rounded-full font-bold text-[var(--color-tea-800)] hover:text-[var(--color-tea-950)] hover:bg-white/50 transition-all text-sm">
            Sign In
          </Link>
          <Link to="/register" className="px-6 py-2.5 rounded-full font-bold bg-[var(--color-tea-800)] text-white hover:bg-[var(--color-tea-900)] shadow-md hover:shadow-lg transition-all text-sm border-b-2 border-[var(--color-tea-950)]">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-10 pb-32 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & Details */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 text-left space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-tea-100)] text-[var(--color-tea-800)] font-bold text-xs border border-[var(--color-tea-200)] tracking-wide uppercase">
              <Sparkles size={12} />
              The Smart Reading Oasis
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[var(--color-tea-950)] leading-[1.08] tracking-tight">
              Brew Stories,<br />
              <span className="text-[var(--color-tea-600)] relative inline-block">
                One Page
                <span className="absolute left-0 bottom-1 w-full h-[6px] bg-[var(--color-tea-300)]/40 -z-10 rounded-full" />
              </span> at a Time.
            </h1>

            <p className="text-lg md:text-xl text-[var(--color-tea-700)] leading-relaxed max-w-2xl font-sans">
              A smart reading ecosystem for modern bookworms. Upload your PDFs, build a personalised vocabulary vault, highlight favourite quotes, track your reading streaks, and join a cozy tea-inspired community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/register" className="inline-flex items-center justify-center gap-2.5 px-8 py-4.5 bg-[var(--color-tea-800)] text-white rounded-2xl text-lg font-bold shadow-xl hover:bg-[var(--color-tea-900)] border-b-4 border-[var(--color-tea-950)] transition-all w-full text-center">
                  <BookOpen size={22} />
                  Start Reading Free
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
              
              <Link to="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4.5 bg-white/80 hover:bg-white text-[var(--color-tea-900)] border border-[var(--color-tea-200)] rounded-2xl text-lg font-bold shadow-sm hover:shadow-md transition-all">
                Explore Dashboard
              </Link>
            </div>

            {/* Coffee Quote banner */}
            <div className="pt-6 border-t border-[var(--color-tea-200)]/80 flex gap-4 items-start max-w-xl">
              <Quote className="text-[var(--color-tea-400)] shrink-0" size={32} />
              <p className="italic text-[var(--color-tea-600)] text-sm">
                "A cup of tea and a leather-bound book is the perfect key to unlocking worlds unexplored. NovelTea pairs that timeless magic with smart AI insights."
              </p>
            </div>
          </motion.div>

          {/* Right Column: Beautiful Vintage Image Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-5 relative"
          >
            {/* Elegant Golden Picture Frame container */}
            <div className="relative p-4 md:p-6 bg-[#eedfc5] border-8 border-double border-[#855e34] rounded-[2rem] shadow-2xl overflow-hidden max-w-md mx-auto group">
              <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.15)_0%,transparent_100%)] pointer-events-none" />
              
              {/* Inner card with image */}
              <div className="relative aspect-[4/5] rounded-[1.2rem] overflow-hidden border border-[#5c3e21] shadow-inner bg-[var(--color-tea-950)]">
                <img
                  src={heroVintage}
                  alt="Cozy Library Cafe"
                  className="w-full h-full object-cover filter brightness-[0.95] contrast-[1.05] group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Vintage vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_20%,rgba(0,0,0,0.45)_100%)] mix-blend-multiply pointer-events-none" />
                
                {/* Steaming overlay indicator */}
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-white text-xs font-serif italic tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-amber-gold)] animate-pulse" />
                  NovelTea Reading Lounge
                </div>
              </div>
            </div>

            {/* Floating decorative elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 bg-white border border-[var(--color-tea-200)] shadow-lg rounded-2xl p-4 hidden sm:flex items-center gap-3 max-w-[200px]"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-tea-100)] text-[var(--color-tea-800)] flex items-center justify-center shrink-0">
                <Sparkles size={20} className="animate-spin-slow" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[var(--color-tea-950)]">Mood Picks</h4>
                <p className="text-[10px] text-[var(--color-tea-600)]">Books for your vibe</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 4, delay: 2, ease: "easeInOut" }}
              className="absolute -bottom-6 -right-6 bg-white border border-[var(--color-tea-200)] shadow-lg rounded-2xl p-4 hidden sm:flex items-center gap-3 max-w-[200px]"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-tea-100)] text-[var(--color-tea-800)] flex items-center justify-center shrink-0">
                <BookOpen size={20} />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[var(--color-tea-950)]">Vocab Vault</h4>
                <p className="text-[10px] text-[var(--color-tea-600)]">Click to define instantly</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-36 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-tea-200)]/20 to-transparent h-[1px] top-[-30px]" />
          
          {[
            {
              title: "Mood-Based Picks",
              desc: "Tell us how you're feeling and get personalised book recommendations for your mood — from motivated and curious to relaxed and inspired.",
              icon: Sparkles,
              delay: 0,
            },
            {
              title: "Smart PDF Reader",
              desc: "Highlight lines, double-click words to look them up and save to your Vocabulary Vault, bookmark pages with notes, and pick up exactly where you left off.",
              icon: BookOpen,
              delay: 0.1,
            },
            {
              title: "Cozy Book Exchange",
              desc: "Share quotes, post reviews, celebrate reading milestones, list books for exchange, and connect with a warm-hearted community of fellow readers.",
              icon: Users,
              delay: 0.2,
            },
          ].map((feat, index) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: feat.delay, duration: 0.6 }}
              className="vintage-glass p-8 rounded-3xl vintage-shadow hover:translate-y-[-4px] hover:border-[var(--color-tea-400)] transition-all text-left group"
            >
              <div className="w-12 h-12 bg-[var(--color-tea-100)] group-hover:bg-[var(--color-tea-800)] text-[var(--color-tea-800)] group-hover:text-white rounded-2xl flex items-center justify-center mb-6 transition-all shadow-inner">
                <feat.icon size={22} />
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-tea-950)] mb-3">{feat.title}</h3>
              <p className="text-[var(--color-tea-700)] text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
