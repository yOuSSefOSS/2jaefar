import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, CheckCircle, CreditCard, Ban,
  Scale, AlertTriangle, Edit, ChevronRight,
  User, Mail, Cpu
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

// ── Bullet item ───────────────────────────────────────────────────────────────
const Bullet = ({ color = '#38bdf8', children }) => (
  <div className="flex items-start gap-3 py-2 border-b border-white/4 last:border-0">
    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: color }} />
    <p className="text-sm text-[var(--color-edu-text-muted)]">{children}</p>
  </div>
);

// ── Warning callout ───────────────────────────────────────────────────────────
const Callout = ({ color, icon: Icon, children }) => (
  <div
    className="flex items-start gap-3 p-4 rounded-xl"
    style={{ background: `${color}08`, border: `1px solid ${color}25` }}
  >
    <Icon size={16} className="mt-0.5 flex-shrink-0" style={{ color }} />
    <p className="text-sm text-[var(--color-edu-text-muted)]">{children}</p>
  </div>
);

// ── Tier badge ────────────────────────────────────────────────────────────────
const TierRow = ({ tier, color, features }) => (
  <div className="p-3 rounded-xl border border-white/5 bg-white/2">
    <div className="text-[10px] font-mono tracking-widest uppercase mb-2" style={{ color }}>
      {tier}
    </div>
    <ul className="space-y-1">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-2 text-xs text-[var(--color-edu-text-muted)]">
          <CheckCircle size={11} style={{ color }} className="flex-shrink-0" />
          {f}
        </li>
      ))}
    </ul>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
const TermsOfUse = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Terms of Use — Vortex-Gen';
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
          <span className="text-[var(--color-edu-sky)]">Terms of Use</span>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="pt-24 pb-20 px-6 lg:px-10 max-w-3xl mx-auto">

        {/* Hero Header */}
        <motion.div {...fadeUp(0)} className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-widest uppercase mb-5
            bg-[var(--color-edu-sky)]/10 border border-[var(--color-edu-sky)]/20 text-[var(--color-edu-sky)]">
            <FileText size={11} />
            Legal Document
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Terms of Use
          </h1>
          <p className="text-[var(--color-edu-text-muted)] text-base leading-relaxed max-w-xl">
            These Terms govern your access to and use of Vortex-Gen. Please read them carefully before
            using the platform. By accessing the Service, you agree to be bound by these Terms.
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

        {/* ── 1. Acceptance ── */}
        <Section icon={CheckCircle} title="1. Acceptance of Terms" delay={0.05}>
          <p>
            By visiting, registering for, or using the Vortex-Gen platform at{' '}
            <span className="text-[var(--color-edu-sky)]">vortex-gen.vercel.app</span> (the "Service"),
            you agree to be legally bound by these Terms of Use ("Terms"). If you do not agree with
            any part of these Terms, you must stop using the Service immediately.
          </p>
          <p>
            These Terms constitute the entire agreement between you and Vortex-Gen regarding your use
            of the Service and supersede any prior agreements.
          </p>
        </Section>

        {/* ── 2. About the Service ── */}
        <Section icon={Cpu} title="2. Description of the Service" color="#a78bfa" delay={0.1}>
          <p>
            Vortex-Gen is an <strong className="text-white">educational aerodynamic simulation platform</strong> designed
            for aerospace engineering students, researchers, and aviation enthusiasts. The Service includes:
          </p>
          <div className="space-y-1 mt-3">
            {[
              'An interactive Aircraft Explorer for learning about aircraft components.',
              'A Wind Tunnel Laboratory powered by the NeuralFoil machine-learning aerodynamic model.',
              'Real-time Cl/Cd coefficient prediction, drag polars, and stall analysis.',
              'Custom airfoil import (.dat / .csv) and Autotune optimization tools.',
              '3D STL export and multi-page analytical PDF report generation.',
              'An AI-powered aerodynamic simulation backend running on Railway.',
            ].map((item, i) => (
              <Bullet key={i} color="#a78bfa">{item}</Bullet>
            ))}
          </div>

          {/* Educational disclaimer */}
          <Callout icon={AlertTriangle} color="#f59e0b">
            <span>
              <strong className="text-white">Educational Use Disclaimer:</strong> Vortex-Gen is built for
              academic learning and experimentation. Simulation results produced by the NeuralFoil model
              are approximations intended for educational purposes. They are <strong className="text-white">not certified
              for real-world aerospace engineering, aircraft design, or safety-critical applications.</strong> Never
              use simulation data from this platform as the sole basis for any physical engineering decision.
            </span>
          </Callout>
        </Section>

        {/* ── 3. User Accounts ── */}
        <Section icon={User} title="3. User Accounts & Eligibility" color="#22c55e" delay={0.15}>
          <p>
            To access certain features of the Service (including the Wind Tunnel Laboratory and subscription
            features), you must create an account. By creating an account, you agree to:
          </p>
          <div className="space-y-1 mt-3">
            <Bullet color="#22c55e">Provide accurate, current, and complete information during registration.</Bullet>
            <Bullet color="#22c55e">Maintain the confidentiality of your password and account credentials.</Bullet>
            <Bullet color="#22c55e">Notify us immediately of any unauthorized access to your account at <a href="mailto:vortexgen@duck.com" className="text-[#22c55e] hover:underline">vortexgen@duck.com</a>.</Bullet>
            <Bullet color="#22c55e">Accept responsibility for all activities that occur under your account.</Bullet>
          </div>
          <p>
            We reserve the right to suspend or terminate accounts that violate these Terms, without prior
            notice where necessary to protect the security of the platform or other users.
          </p>
          <p>
            There is no minimum age requirement to use Vortex-Gen. However, if you are under the age of
            legal majority in your jurisdiction, you should ensure you have parental or guardian consent
            before creating a paid subscription.
          </p>
        </Section>

        {/* ── 4. Subscriptions ── */}
        <Section icon={CreditCard} title="4. Subscriptions, Billing & Payments" color="#fb923c" delay={0.2}>
          <p>
            Vortex-Gen offers a tiered subscription model. Access to premium features is governed by
            your active subscription tier:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <TierRow
              tier="Free"
              color="#94a3b8"
              features={[
                'Basic simulation (analytic model)',
                '1 custom airfoil import/month',
                'PDF & STL export',
                'Side-by-side Compare Mode',
              ]}
            />
            <TierRow
              tier="Pro"
              color="#38bdf8"
              features={[
                'NeuralFoil AI solver',
                '10 custom airfoil imports/month',
                'Fast Tune optimizer',
                'All Free features',
              ]}
            />
            <TierRow
              tier="Pro Max"
              color="#f59e0b"
              features={[
                'High-Fidelity WebGL particles',
                'Unlimited airfoil imports',
                'Deep Tune optimizer',
                'All Pro features',
              ]}
            />
          </div>

          <p className="mt-4">
            <strong className="text-white">Billing:</strong> Payments are processed securely by{' '}
            <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-[#fb923c] hover:underline">
              Stripe
            </a>. By subscribing, you authorize Stripe to charge your payment method on a recurring basis
            at the rate shown at the time of purchase.
          </p>
          <p>
            <strong className="text-white">Cancellation:</strong> You may cancel your subscription at any
            time. Cancellation takes effect at the end of your current billing period. We do not offer
            prorated refunds for partial billing periods.
          </p>
          <p>
            <strong className="text-white">Refunds:</strong> If you believe you were charged in error, contact
            us at{' '}
            <a href="mailto:vortexgen@duck.com" className="text-[#fb923c] hover:underline">
              vortexgen@duck.com
            </a>{' '}
            within 7 days of the charge. Refund decisions are made at our sole discretion.
          </p>
          <p>
            <strong className="text-white">Price changes:</strong> We reserve the right to modify subscription
            prices. We will provide at least 14 days' notice of any price increases via email before
            they take effect.
          </p>
        </Section>

        {/* ── 5. Acceptable Use ── */}
        <Section icon={Ban} title="5. Acceptable Use Policy" color="#fb7185" delay={0.25}>
          <p>
            You agree to use the Service in a lawful and respectful manner. The following activities
            are strictly prohibited:
          </p>
          <div className="space-y-1 mt-3">
            {[
              'Attempting to reverse-engineer, decompile, or extract the NeuralFoil AI model weights or backend source code.',
              'Sending automated requests (scraping, bots) to our API endpoints beyond normal interactive use.',
              'Circumventing tier limits, feature gates, or billing systems by any technical means.',
              'Uploading malicious files disguised as .dat airfoil coordinate files.',
              'Using the platform to produce simulation data you represent as certified engineering analysis.',
              'Sharing your account credentials with third parties to bypass subscription limits.',
              'Attempting to disrupt, overload, or gain unauthorized access to our servers or infrastructure.',
              'Using the Service for any purpose that violates applicable local, national, or international law.',
            ].map((item, i) => (
              <Bullet key={i} color="#fb7185">{item}</Bullet>
            ))}
          </div>
          <p>
            Violation of this policy may result in immediate account termination without refund and,
            where appropriate, legal action.
          </p>
        </Section>

        {/* ── 6. Intellectual Property ── */}
        <Section icon={Scale} title="6. Intellectual Property" color="#38bdf8" delay={0.3}>
          <p>
            <strong className="text-white">Vortex-Gen's IP:</strong> All content, design, code, graphics,
            branding, and the educational content of the Vortex-Gen platform are the intellectual property
            of the Vortex-Gen project. You may not copy, modify, distribute, or commercialize any part of
            the platform without our prior written consent.
          </p>
          <p>
            <strong className="text-white">Your Content:</strong> Any airfoil coordinate files (.dat / .csv)
            you upload to the platform remain your property. By uploading them, you grant us a limited,
            non-exclusive license to process them through our simulation engine for the purpose of
            delivering the Service to you. We do not store your uploaded files on our servers beyond
            the duration of your active simulation session.
          </p>
          <p>
            <strong className="text-white">NeuralFoil:</strong> The aerodynamic prediction backend is built
            on the open-source{' '}
            <a
              href="https://github.com/peterdsharpe/NeuralFoil"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-edu-sky)] hover:underline"
            >
              NeuralFoil
            </a>{' '}
            library (MIT License) by Peter D. Sharpe. We operate it as an infrastructure service;
            ownership of the model remains with its respective authors.
          </p>
        </Section>

        {/* ── 7. Disclaimer ── */}
        <Section icon={AlertTriangle} title="7. Disclaimers of Warranty" color="#f59e0b" delay={0.35}>
          <Callout icon={AlertTriangle} color="#f59e0b">
            The Service is provided <strong className="text-white">"AS IS"</strong> and{' '}
            <strong className="text-white">"AS AVAILABLE"</strong> without any warranties, express or implied,
            including but not limited to merchantability, fitness for a particular purpose, or non-infringement.
          </Callout>
          <p className="mt-3">We do not warrant that:</p>
          <div className="space-y-1">
            <Bullet color="#f59e0b">The Service will be available uninterrupted or error-free at all times.</Bullet>
            <Bullet color="#f59e0b">Simulation results will be accurate, complete, or suitable for engineering use.</Bullet>
            <Bullet color="#f59e0b">The NeuralFoil model will produce results equivalent to full Computational Fluid Dynamics (CFD) analysis.</Bullet>
            <Bullet color="#f59e0b">Any bugs or errors will be corrected within a specific timeframe.</Bullet>
          </div>
        </Section>

        {/* ── 8. Limitation of Liability ── */}
        <Section icon={Scale} title="8. Limitation of Liability" color="#a78bfa" delay={0.4}>
          <p>
            To the fullest extent permitted by law, Vortex-Gen shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising from:
          </p>
          <div className="space-y-1">
            <Bullet color="#a78bfa">Your use of or inability to use the Service.</Bullet>
            <Bullet color="#a78bfa">Any reliance on simulation data produced by the platform.</Bullet>
            <Bullet color="#a78bfa">Unauthorized access to or alteration of your data.</Bullet>
            <Bullet color="#a78bfa">Loss of revenue, profits, data, goodwill, or other intangible losses.</Bullet>
          </div>
          <p>
            In no event shall Vortex-Gen's total liability to you for all claims exceed the amount you
            paid to Vortex-Gen in the twelve (12) months preceding the event giving rise to the claim,
            or USD $10, whichever is greater.
          </p>
        </Section>

        {/* ── 9. Changes ── */}
        <Section icon={Edit} title="9. Changes to These Terms" color="#22c55e" delay={0.45}>
          <p>
            We reserve the right to update or modify these Terms at any time. Changes will be posted
            on this page with an updated "Last updated" date. Continued use of the Service after changes
            are posted constitutes acceptance of the revised Terms.
          </p>
          <p>
            For material changes affecting your rights or obligations, we will provide at least 14 days'
            advance notice via email where possible. We encourage you to review this page periodically.
          </p>
        </Section>

        {/* ── 10. Governing Law ── */}
        <Section icon={Scale} title="10. Governing Law & Dispute Resolution" color="#38bdf8" delay={0.5}>
          <p>
            These Terms are governed by and construed in accordance with the laws of the Arab Republic
            of Egypt, without regard to its conflict of law principles.
          </p>
          <p>
            Any dispute arising from these Terms or your use of the Service shall be subject to the
            exclusive jurisdiction of the competent courts of Cairo, Egypt. If you believe you have a
            dispute, we strongly encourage you to contact us first at{' '}
            <a href="mailto:vortexgen@duck.com" className="text-[var(--color-edu-sky)] hover:underline">
              vortexgen@duck.com
            </a>{' '}
            so that we can attempt to resolve it informally before any legal proceedings.
          </p>
        </Section>

        {/* ── 11. Contact ── */}
        <Section icon={Mail} title="11. Contact Us" color="#fb923c" delay={0.55}>
          <p>
            If you have any questions about these Terms of Use, please contact us:
          </p>
          <div className="mt-3 p-4 rounded-xl bg-white/2 border border-white/5">
            <div className="flex items-center gap-2 text-sm">
              <Mail size={14} className="text-[#fb923c]" />
              <a href="mailto:vortexgen@duck.com" className="text-[#fb923c] hover:underline font-semibold">
                vortexgen@duck.com
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm mt-2 text-[var(--color-edu-text-muted)]">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#fb923c]">Project:</span>
              Vortex-Gen · Cairo, Egypt
            </div>
          </div>
        </Section>

        {/* ── Contact Box ── */}
        <motion.div
          {...fadeUp(0.6)}
          className="mt-8 p-6 rounded-2xl text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(56,189,248,0.07) 0%, rgba(10,22,40,0.9) 100%)',
            border: '1px solid rgba(56,189,248,0.2)',
          }}
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--color-edu-sky)]/10 border border-[var(--color-edu-sky)]/20
            flex items-center justify-center mx-auto mb-3 text-[var(--color-edu-sky)]">
            <FileText size={20} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Questions About These Terms?</h3>
          <p className="text-sm text-[var(--color-edu-text-muted)] mb-4 max-w-sm mx-auto">
            We're a small independent project and we're happy to clarify anything in plain language.
          </p>
          <a
            href="mailto:vortexgen@duck.com"
            id="terms-contact-link"
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
        <motion.div {...fadeUp(0.65)} className="mt-10 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/5">
          <Link
            to="/"
            className="text-sm font-semibold text-[var(--color-edu-text-muted)] hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
          <Link
            to="/privacy"
            className="text-sm font-semibold text-[var(--color-edu-sky)] hover:underline transition-colors"
          >
            Read Privacy Policy →
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

export default TermsOfUse;
