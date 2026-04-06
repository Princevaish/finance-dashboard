"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const router = useRouter();
  
  // Navbar refs
  const navRef = useRef<HTMLDivElement>(null);
  
  // Hero section refs
  const heroTagRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroButtonsRef = useRef<HTMLDivElement>(null);
  
  // Stats section refs
  const statsRef = useRef<HTMLDivElement>(null);
  
  // Feature cards refs
  const featureCardsRef = useRef<HTMLDivElement>(null);
  const featureItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // Role cards refs
  const roleCardsRef = useRef<HTMLDivElement>(null);
  const roleItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // CTA section refs
  const ctaSectionRef = useRef<HTMLDivElement>(null);
  const ctaHeadingRef = useRef<HTMLHeadingElement>(null);
  const ctaButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // ============================================
    // 1. NAVBAR ANIMATION (Fade down from top)
    // ============================================
    if (navRef.current) {
      tl.from(navRef.current, {
        opacity: 0,
        y: -50,
        duration: 0.8,
        ease: "power3.out",
      }, 0);
    }

    // ============================================
    // 2. HERO SECTION ANIMATIONS
    // ============================================
    // Hero tag (fade in + slide up)
    if (heroTagRef.current) {
      tl.from(
        heroTagRef.current,
        {
          opacity: 0,
          y: 20,
          duration: 0.7,
          ease: "power3.out",
        },
        0.1
      );
    }

    // Hero title (fade in + slide up)
    if (heroTitleRef.current) {
      tl.from(
        heroTitleRef.current,
        {
          opacity: 0,
          y: 40,
          duration: 0.9,
          ease: "power3.out",
        },
        0.2
      );
    }

    // Hero subtitle (fade in + slide up with delay)
    if (heroSubtitleRef.current) {
      tl.from(
        heroSubtitleRef.current,
        {
          opacity: 0,
          y: 20,
          duration: 0.7,
          ease: "power3.out",
        },
        0.4
      );
    }

    // Hero buttons (stagger animation)
    if (heroButtonsRef.current) {
      const buttons = heroButtonsRef.current.querySelectorAll("button");
      tl.from(
        buttons,
        {
          opacity: 0,
          y: 20,
          duration: 0.6,
          stagger: 0.15,
          ease: "power3.out",
        },
        0.55
      );
    }

    // ============================================
    // 3. STATS SECTION ANIMATION
    // ============================================
    if (statsRef.current) {
      gsap.from(statsRef.current.querySelectorAll("div"), {
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 80%",
          end: "top 50%",
          scrub: false,
          markers: false,
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
      });
    }

    // ============================================
    // 4. FEATURE CARDS SCROLL ANIMATION
    // ============================================
    if (featureCardsRef.current) {
      const cards = featureCardsRef.current.querySelectorAll("[data-feature-card]");
      cards.forEach((card, index) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            end: "top 55%",
            scrub: false,
            markers: false,
          },
          opacity: 0,
          y: 50,
          duration: 0.8,
          ease: "power3.out",
          delay: index * 0.1,
        });
      });
    }

    // ============================================
    // 5. ROLE CARDS SCROLL ANIMATION
    // ============================================
    if (roleCardsRef.current) {
      const cards = roleCardsRef.current.querySelectorAll("[data-role-card]");
      cards.forEach((card, index) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            end: "top 55%",
            scrub: false,
            markers: false,
          },
          opacity: 0,
          y: 50,
          duration: 0.8,
          ease: "power3.out",
          delay: index * 0.1,
        });
      });
    }

    // ============================================
    // 6. CTA SECTION ANIMATION
    // ============================================
    if (ctaSectionRef.current) {
      const ctaTl = gsap.timeline({
        scrollTrigger: {
          trigger: ctaSectionRef.current,
          start: "top 80%",
          end: "top 50%",
          scrub: false,
          markers: false,
        },
      });

      if (ctaHeadingRef.current) {
        ctaTl.from(ctaHeadingRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: "power3.out",
        }, 0);
      }

      if (ctaButtonRef.current) {
        ctaTl.from(
          ctaButtonRef.current,
          {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: "power3.out",
          },
          0.2
        );
      }
    }

    // ============================================
    // 7. BUTTON HOVER EFFECTS
    // ============================================
    const buttons = document.querySelectorAll("button");
    buttons.forEach((button) => {
      button.addEventListener("mouseenter", () => {
        gsap.to(button, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      });

      button.addEventListener("mouseleave", () => {
        gsap.to(button, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav ref={navRef} className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-semibold">F</span>
            </div>
            <span className="font-semibold text-gray-900">FinanceDash</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/login")} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">Login</button>
            <button onClick={() => router.push("/signup")} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">Get Started</button>
          </div>
        </div>
      </nav>

      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <div ref={heroTagRef} className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">✦ Trusted by 1,000+ users</div>
        <h1 ref={heroTitleRef} className="text-5xl font-bold text-gray-900 leading-tight mb-5">
          Manage Your Finances <span className="text-blue-600">Smartly</span>
        </h1>
        <p ref={heroSubtitleRef} className="text-lg text-gray-500 leading-relaxed mb-8 max-w-xl mx-auto">Track income and expenses, view analytics, and get insights — all in one clean dashboard built for individuals and teams.</p>
        <div ref={heroButtonsRef} className="flex gap-3 justify-center">
          <button onClick={() => router.push("/signup")} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm">Get Started →</button>
          <button onClick={() => router.push("/login")} className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-medium rounded-xl transition-colors text-sm">Login</button>
        </div>
      </section>

      <div ref={statsRef} className="border-y border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-6 flex justify-around">
          {[{value:"₹2.4Cr+",label:"Tracked"},{value:"1,000+",label:"Users"},{value:"99.9%",label:"Uptime"},{value:"3 Roles",label:"Admin · Analyst · Viewer"}].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <section ref={featureCardsRef} className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-8">Everything you need</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {icon:"💰",bg:"bg-blue-50",title:"Income tracking",desc:"Log salary, freelance, and other income with categories and dates."},
            {icon:"📉",bg:"bg-red-50",title:"Expense management",desc:"Categorise expenses, filter by date range, and spot where money goes."},
            {icon:"📊",bg:"bg-green-50",title:"Smart analytics",desc:"Monthly trends, category breakdowns, and net balance — always live."},
          ].map(f => (
            <div key={f.title} data-feature-card className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center text-lg mb-4`}>{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section ref={roleCardsRef} className="max-w-5xl mx-auto px-6 pb-16">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-8">Role-based access</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {role:"Admin",desc:"Full access — create, update, and delete all records.",color:"bg-blue-50 text-blue-700",border:"border-blue-100"},
            {role:"Analyst",desc:"View dashboard analytics and browse financial records.",color:"bg-green-50 text-green-700",border:"border-green-100"},
            {role:"Viewer",desc:"Read-only access to financial records.",color:"bg-purple-50 text-purple-700",border:"border-purple-100"},
          ].map(r => (
            <div key={r.role} data-role-card className={`bg-white border ${r.border} rounded-2xl p-6`}>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${r.color} mb-3`}>{r.role}</span>
              <p className="text-sm text-gray-500 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section ref={ctaSectionRef} className="bg-blue-600 py-16 text-center">
        <h2 ref={ctaHeadingRef} className="text-3xl font-bold text-white mb-4">Ready to take control?</h2>
        <p className="text-blue-100 text-sm mb-8">Create a free account and start tracking today.</p>
        <button ref={ctaButtonRef} onClick={() => router.push("/signup")} className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm">Create Free Account →</button>
      </section>

      <footer className="bg-white border-t border-gray-200 py-6 text-center">
        <p className="text-xs text-gray-400">© 2026 FinanceDash · Built with FastAPI + Next.js</p>
      </footer>
    </div>
  );
}