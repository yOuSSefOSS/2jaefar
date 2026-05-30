import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Database, CreditCard, Mail, Server,
  Eye, Trash2, Lock, Globe, ChevronRight, AlertTriangle
} from 'lucide-react';
import logoUrl from '../assets/logo.png';

// ── Animation helpers ──────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

// ── Section component ─────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, color = '#38bdf8', children, delay = 0 }) => (
  <motion.div {...fadeUp(delay)} className="theory-section mb-6" style={{ '--section-accent': color }}>
    <div className="flex items-center gap-3 mb-4">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
      >
        <Icon size={18} />
      </div>
      <h2 className="text-lg font-bold text-white">{title}</h2>
    </div>
    <div className="text-sm text-[var(--color-edu-text-muted)] leading-relaxed space-y-3">
      {children}
    </div>
  </motion.div>
);

// ── Data row ──────────────────────────────────────────────────────────────────
const DataRow = ({ label, detail }) => (
  <div className="flex items-start gap-3 py-2 border-b border-white/4 last:border-0">
    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-edu-sky)] mt-2 flex-shrink-0" />
    <div>
      <span className="text-white font-semibold text-sm">{label}:</span>{' '}
      <span className="text-[var(--color-edu-text-muted)] text-sm">{detail}</span>
    </div>
  </div>
);

// ── Third-party badge ─────────────────────────────────────────────────────────
const ThirdParty = ({ name, role, url, color }) => (
  <div
    className="flex items-start gap-3 p-3 rounded-xl border"
    style={{ background: `${color}08`, borderColor: `${color}20` }}
  >
    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
    <div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-sm hover:underline"
        style={{ color }}
      >
        {name} ↗
      </a>
      <p className="text-xs text-[var(--color-edu-text-muted)] mt-0.5">{role}</p>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Privacy Policy — Vortex-Gen';
  }, []);

  const lastUpdated = 'May 30, 2026';

  return (
    <div className="min-h-screen bg-[var(--color-edu-navy)] text-[var(--color-edu-text)] overflow-x-hidden">

      {/* ── Top Nav ── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 lg:px-10 bg-[var(--color-edu-navy)]/90 backdrop-blur-xl border-b border-white/5">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoUrl} alt="Vortex-Gen" className="h-7 w-auto object-contain" />
          <span className="font-bold text-base tracking-wide text-white">Vortex-Gen</span>
        </Link>
        <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-wider text-[var(--color-edu-text-muted)]">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={10} />
          <span className="text-[var(--color-edu-sky)]">Privacy Policy</span>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="pt-24 pb-20 px-6 lg:px-10 max-w-3xl mx-auto">

        {/* Hero Header */}
        <motion.div {...fadeUp(0)} className="mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-widest uppercase mb-5
            bg-[var(--color-edu-sky)]/10 border border-[var(--color-edu-sky)]/20 text-[var(--color-edu-sky)]">
            <Shield size={11} />
            Legal Document
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-[var(--color-edu-text-muted)] text-base leading-relaxed max-w-xl">
            This policy explains what personal information Vortex-Gen collects, how we use it,
            and the rights you have over your data. We believe in full transparency.
          </p>

          {/* Meta strip */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-[11px] font-mono text-[var(--color-edu-text-muted)]/70">
            <span>Last updated: <span className="text-[var(--color-edu-text-muted)]">{lastUpdated}</span></span>
            <span className="w-px h-4 bg-white/10" />
            <span>Effective immediately</span>
            <span className="w-px h-4 bg-white/10" />
            <span>Jurisdiction: <span className="text-[var(--color-edu-text-muted)]">Cairo, Egypt</span></span>
          </div>
        </motion.div>

        {/* ── 1. Introduction ── */}
        <Section icon={Shield} title="1. Introduction & Who We Are" delay={0.05}>
          <p>
            Vortex-Gen ("we", "us", "our") is an aerodynamic simulation and aviation education platform
            available at <span className="text-[var(--color-edu-sky)]">vortex-gen.vercel.app</span>. The platform
            is operated independently and is not a registered legal entity. Vortex-Gen is based in Cairo, Egypt.
          </p>
          <p>
            This Privacy Policy describes how we collect, use, store, and protect information about you
            when you use our website, simulation tools, and related services (collectively, the "Service").
            By using the Service, you agree to the practices described in this policy.
          </p>
          <p>
            For any privacy-related questions, contact us at:{' '}
            <a href="mailto:vortexgen@duck.com" className="text-[var(--color-edu-sky)] hover:underline font-semibold">
              vortexgen@duck.com
            </a>
          </p>
        </Section>

        {/* ── 2. Information We Collect ── */}
        <Section icon={Database} title="2. Information We Collect" color="#a78bfa" delay={0.1}>
          <p>We only collect information that is necessary to provide and improve the Service.</p>

          <div className="mt-4 space-y-1 rounded-xl bg-white/2 border border-white/5 p-4">
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#a78bfa] mb-3">Account & Identity Data</p>
            <DataRow label="Email address" detail="Collected during sign-up via email/password or Google OAuth. Used to identify your account and send transactional notifications." />
            <DataRow label="Display name" detail="Your name or username as provided during registration or via your Google profile." />
            <DataRow label="Password (hashed)" detail="Stored securely by Supabase using bcrypt hashing. We never see or store your plain-text password." />
          </div>

          <div className="mt-3 space-y-1 rounded-xl bg-white/2 border border-white/5 p-4">
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#a78bfa] mb-3">Usage & Subscription Data</p>
            <DataRow label="Subscription tier" detail="Free, Pro, or Pro Max — stored in your profile to gate access to NeuralFoil AI, Autotune, and other premium features." />
            <DataRow label="Airfoil import count" detail="A running counter of how many custom .dat airfoil files you have imported this billing period. Used to enforce tier limits." />
            <DataRow label="Stripe Customer ID" detail="A reference token linking your Vortex-Gen account to your Stripe billing profile. We do not store card numbers." />
          </div>

          <div className="mt-3 space-y-1 rounded-xl bg-white/2 border border-white/5 p-4">
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#a78bfa] mb-3">Technical & Log Data</p>
            <DataRow label="Browser error logs" detail="If a critical error occurs in your session, an anonymized error report may be sent to our backend for debugging (via /api/log). No personal data is included." />
            <DataRow label="Session tokens" detail="Supabase issues a JWT (JSON Web Token) stored in your browser's local storage to keep you logged in. This token expires automatically." />
          </div>

          <p className="mt-3">
            <strong className="text-white">We do not collect:</strong> IP addresses for tracking, browser fingerprints,
            advertising identifiers, or the content of your airfoil simulation results. We do not sell data.
          </p>
        </Section>

        {/* ── 3. How We Use Your Information ── */}
        <Section icon={Eye} title="3. How We Use Your Information" color="#f59e0b" delay={0.15}>
          <p>We use your information for the following purposes only:</p>
          <div className="space-y-2 mt-3">
            {[
              { title: 'Authentication', desc: 'To verify your identity and maintain your login session across visits.' },
              { title: 'Feature gating', desc: 'To determine which simulation features (NeuralFoil, Autotune, high-fidelity WebGL) are available to you based on your subscription tier.' },
              { title: 'Billing & payments', desc: 'To create Stripe checkout sessions, process subscription upgrades, and send payment confirmation emails via Resend.' },
              { title: 'Usage enforcement', desc: 'To track your monthly airfoil import count and enforce the limits defined in your tier.' },
              { title: 'Transactional email', desc: 'To send you account confirmation and subscription upgrade notifications. We do not send marketing emails.' },
              { title: 'Platform reliability', desc: 'To diagnose and fix technical errors through anonymized browser error reports.' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3 py-2 border-b border-white/4 last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] mt-2 flex-shrink-0" />
                <div>
                  <span className="text-white font-semibold text-sm">{item.title}:</span>{' '}
                  <span className="text-[var(--color-edu-text-muted)] text-sm">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 4. Third-Party Services ── */}
        <Section icon={Server} title="4. Third-Party Services & Data Sharing" color="#22c55e" delay={0.2}>
          <p>
            We integrate the following third-party services. Each service has its own privacy policy
            governing how they handle data passed to them. We share only what is necessary for each
            service to function.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <ThirdParty
              name="Supabase"
              role="Authentication (email/password, Google OAuth), user profile database (PostgreSQL), and JWT session management."
              url="https://supabase.com/privacy"
              color="#3ecf8e"
            />
            <ThirdParty
              name="Stripe"
              role="Payment processing, subscription lifecycle management, and webhook event delivery. We never handle raw card data."
              url="https://stripe.com/privacy"
              color="#635bff"
            />
            <ThirdParty
              name="Resend"
              role="Transactional email delivery for account events (registration confirmation, subscription upgrade notices)."
              url="https://resend.com/privacy"
              color="#ff6b6b"
            />
            <ThirdParty
              name="Railway"
              role="Backend server hosting (Node.js API + Python NeuralFoil daemon). Your simulation requests are processed here."
              url="https://railway.app/legal/privacy"
              color="#7c3aed"
            />
            <ThirdParty
              name="Vercel"
              role="Frontend CDN and static hosting for the React application. Handles HTTPS, caching, and edge delivery."
              url="https://vercel.com/legal/privacy-policy"
              color="#ffffff"
            />
          </div>
          <p className="mt-4">
            We do <strong className="text-white">not</strong> share your data with advertisers, data brokers,
            or any party not listed above.
          </p>
        </Section>

        {/* ── 5. Data Retention ── */}
        <Section icon={Trash2} title="5. Data Retention & Deletion" color="#fb7185" delay={0.25}>
          <p>
            Your account data is retained for as long as your account is active. If you request account
            deletion, we will remove your profile data from our Supabase database within{' '}
            <strong className="text-white">30 days</strong> of receiving your request.
          </p>
          <p>
            Some data may be retained for a limited period after deletion for legal, tax, or fraud
            prevention purposes (for example, Stripe retains billing records as required by financial
            regulations, independently of our actions).
          </p>
          <p>
            To request deletion of your account and data, email us at{' '}
            <a href="mailto:vortexgen@duck.com" className="text-[#fb7185] hover:underline font-semibold">
              vortexgen@duck.com
            </a>{' '}
            with the subject line "Account Deletion Request".
          </p>
        </Section>

        {/* ── 6. Cookies & Storage ── */}
        <Section icon={Lock} title="6. Cookies & Local Storage" color="#38bdf8" delay={0.3}>
          <p>
            Vortex-Gen does <strong className="text-white">not</strong> use traditional advertising or
            tracking cookies. We use the following browser storage mechanisms only:
          </p>
          <div className="mt-3 space-y-1 rounded-xl bg-white/2 border border-white/5 p-4">
            <DataRow
              label="Supabase session token (localStorage)"
              detail="A JWT that keeps you logged in between page refreshes. It expires automatically and is cleared when you sign out."
            />
            <DataRow
              label="Theme / UI preferences (localStorage)"
              detail="Local preferences such as language or UI state — stored only in your browser, never sent to our servers."
            />
          </div>
          <p className="mt-3">
            You can clear all locally stored data at any time by clearing your browser's site data for
            vortex-gen.vercel.app. Doing so will sign you out.
          </p>
        </Section>

        {/* ── 7. Your Rights ── */}
        <Section icon={Shield} title="7. Your Rights" color="#a78bfa" delay={0.35}>
          <p>Regardless of your location, you have the following rights over your personal data:</p>
          <div className="space-y-2 mt-3">
            {[
              { right: 'Access', desc: 'You may request a summary of the personal data we hold about you.' },
              { right: 'Correction', desc: 'You may update your display name and email via your account settings.' },
              { right: 'Deletion', desc: 'You may request permanent deletion of your account and all associated data.' },
              { right: 'Portability', desc: 'You may request a copy of your data in a portable format.' },
              { right: 'Withdraw consent', desc: 'You may stop using the Service at any time. Subscription cancellation does not automatically delete your account.' },
            ].map(item => (
              <div key={item.right} className="flex items-start gap-3 py-2 border-b border-white/4 last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] mt-2 flex-shrink-0" />
                <div>
                  <span className="text-white font-semibold text-sm">{item.right}:</span>{' '}
                  <span className="text-[var(--color-edu-text-muted)] text-sm">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3">
            To exercise any of these rights, contact us at{' '}
            <a href="mailto:vortexgen@duck.com" className="text-[#a78bfa] hover:underline font-semibold">
              vortexgen@duck.com
            </a>.
            We will respond within 14 business days.
          </p>
        </Section>

        {/* ── 8. Security ── */}
        <Section icon={Lock} title="8. Data Security" color="#22c55e" delay={0.4}>
          <p>
            We take the security of your data seriously and implement the following measures:
          </p>
          <div className="space-y-2 mt-3">
            {[
              'All data in transit is encrypted via HTTPS/TLS.',
              'Passwords are hashed using bcrypt via Supabase\'s authentication system — we never store or access plain-text passwords.',
              'Database access is governed by Supabase Row Level Security (RLS), ensuring users can only access their own records.',
              'Backend API routes validate Supabase JWTs server-side before processing any privileged request.',
              'Stripe payments are handled entirely by Stripe\'s PCI-DSS compliant infrastructure. Card data never touches our servers.',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-white/4 last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] mt-2 flex-shrink-0" />
                <p className="text-sm text-[var(--color-edu-text-muted)]">{item}</p>
              </div>
            ))}
          </div>
          <p className="mt-3">
            No system is perfectly secure. If you discover a security vulnerability, please disclose it
            responsibly to{' '}
            <a href="mailto:vortexgen@duck.com" className="text-[#22c55e] hover:underline font-semibold">
              vortexgen@duck.com
            </a>.
          </p>
        </Section>

        {/* ── 9. International Transfers ── */}
        <Section icon={Globe} title="9. International Data Transfers" color="#f59e0b" delay={0.45}>
          <p>
            Vortex-Gen is operated from Cairo, Egypt. Our infrastructure providers (Supabase, Railway, Vercel,
            Stripe, Resend) are primarily based in the United States and the European Union. By using
            the Service, you acknowledge that your data may be processed in these jurisdictions.
          </p>
          <p>
            We rely on the standard contractual clauses and privacy frameworks established by each
            third-party provider for cross-border data transfers.
          </p>
        </Section>

        {/* ── 10. Policy Changes ── */}
        <Section icon={AlertTriangle} title="10. Changes to This Policy" color="#fb923c" delay={0.5}>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices,
            technology, legal requirements, or other factors. When we do, we will update the "Last updated"
            date at the top of this page.
          </p>
          <p>
            We encourage you to review this policy periodically. Continued use of the Service after
            changes are posted constitutes your acceptance of those changes.
          </p>
          <p>
            For significant changes that materially affect your rights, we will notify you via the email
            address associated with your account (where applicable).
          </p>
        </Section>

        {/* ── Contact Box ── */}
        <motion.div
          {...fadeUp(0.55)}
          className="mt-8 p-6 rounded-2xl text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(56,189,248,0.07) 0%, rgba(10,22,40,0.9) 100%)',
            border: '1px solid rgba(56,189,248,0.2)',
          }}
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--color-edu-sky)]/10 border border-[var(--color-edu-sky)]/20
            flex items-center justify-center mx-auto mb-3 text-[var(--color-edu-sky)]">
            <Mail size={20} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Privacy Questions?</h3>
          <p className="text-sm text-[var(--color-edu-text-muted)] mb-4 max-w-sm mx-auto">
            If you have any questions about this Privacy Policy or how we handle your data, we're here to help.
          </p>
          <a
            href="mailto:vortexgen@duck.com"
            id="privacy-contact-link"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
              color: '#020617',
              boxShadow: '0 4px 20px rgba(56,189,248,0.25)',
            }}
          >
            <Mail size={15} />
            vortexgen@duck.com
          </a>
        </motion.div>

        {/* ── Bottom navigation ── */}
        <motion.div {...fadeUp(0.6)} className="mt-10 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/5">
          <Link
            to="/"
            className="text-sm font-semibold text-[var(--color-edu-text-muted)] hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
          <Link
            to="/terms"
            className="text-sm font-semibold text-[var(--color-edu-sky)] hover:underline transition-colors"
          >
            Read Terms of Use →
          </Link>
        </motion.div>
      </main>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-white/5 text-center">
        <p className="text-xs text-[var(--color-edu-text-muted)]/50">
          © {new Date().getFullYear()} Vortex-Gen. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
