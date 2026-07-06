'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import B2BContactForm from './B2BContactForm'

/* ── GA4 helper ────────────────────────────────────────────────── */
function trackEvent(name: string, params?: Record<string, string>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  }
}

/* ── FAQ item ───────────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(242,242,242,0.1)' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full text-left py-5 flex justify-between items-start gap-6 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
        aria-expanded={open}
      >
        <span className="text-sm md:text-base font-light leading-snug" style={{ color: 'rgba(242,242,242,0.9)' }}>
          {q}
        </span>
        <span
          className="shrink-0 text-lg leading-none transition-transform"
          aria-hidden
          style={{ color: '#ccff33', transform: open ? 'rotate(45deg)' : 'none' }}
        >
          +
        </span>
      </button>
      {open && (
        <p className="pb-5 text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.55)' }}>
          {a}
        </p>
      )}
    </div>
  )
}

/* ── Check icon ─────────────────────────────────────────────────── */
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="8" fill="rgba(204,255,51,0.12)" />
      <path d="M5 8l2 2 4-4" stroke="#ccff33" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Step number badge ──────────────────────────────────────────── */
function StepBadge({ n }: { n: number }) {
  return (
    <div
      className="shrink-0 flex items-center justify-center rounded-full text-sm font-light"
      style={{
        width: 40, height: 40,
        border: '1px solid rgba(204,255,51,0.4)',
        color: '#ccff33',
      }}
    >
      {n}
    </div>
  )
}

/* ── Content ─────────────────────────────────────────────────────── */
const CONTENT = {
  fr: {
    audienceBanner: {
      text: 'Vous êtes un particulier ?',
      link: 'Découvrez nos services grand public',
      href: '/reparation',
    },
    hero: {
      h1a: 'ClikClak pour votre',
      h1b: 'entreprise',
      subtitle:
        'Réparation de smartphones, tablettes et ordinateurs pour les professionnels et PME de la région lausannoise. Prise en charge rapide, suivi sérieux.',
      cta1: 'Nous contacter',
      cta2: '021 320 44 77',
    },
    problem: {
      title: "Un appareil en panne, c’est de la productivité en moins",
      points: [
        'Chaque panne mobilise vos équipes et interrompt le travail.',
        'Les données de votre entreprise méritent une gestion confidentielle.',
        "Trouver un prestataire réactif et de confiance n’est pas toujours simple.",
      ],
    },
    solutions: {
      title: 'Ce que nous proposons',
      items: [
        { title: "Réparation d’appareils", desc: 'Écran, batterie, connecteurs — toutes marques (smartphones, tablettes, MacBook, PC).' },
        { title: 'Récupération de données', desc: 'Urgence, disque dur, smartphone, SSD — diagnostic et intervention sur mesure.' },
        { title: 'Dépannage sur site 7j/7', desc: 'Déplacement à votre bureau ou domicile dans la région lausannoise.' },
        { title: 'Service de coursier', desc: 'Collecte et livraison de vos appareils — pratique pour les équipes.' },
        { title: 'Reprise de matériel', desc: 'Estimation et rachat de vos appareils usagés en fin de cycle.' },
      ],
    },
    howItWorks: {
      title: 'Comment ça fonctionne',
      steps: [
        { title: 'Contactez-nous', desc: 'Par téléphone, formulaire ou directement en boutique.' },
        { title: 'Prise en charge', desc: 'Dépôt en boutique, coursier, ou déplacement sur site — selon votre convenance.' },
        { title: 'Restitution', desc: "Appareil réparé, avec garantie sur l’intervention." },
      ],
    },
    modes: {
      title: "Modes d’intervention",
      items: [
        {
          title: 'Ponctuel',
          desc: 'Une réparation à la demande, quand vous en avez besoin. Aucun engagement.',
        },
        {
          title: 'Régulier',
          desc: 'Pour les entreprises avec plusieurs appareils à entretenir. Contactez-nous pour discuter de vos besoins.',
        },
      ],
    },
    why: {
      title: 'Pourquoi ClikClak',
      points: [
        { label: 'Basé à Lausanne', desc: 'Rue du Petit-Chêne 9b, 1003 Lausanne' },
        { label: 'Garantie 2 ans', desc: 'Sur les réparations effectuées' },
        { label: 'Pièces de qualité', desc: 'Originales ou équivalentes' },
        { label: 'Disponible 7j/7', desc: 'Pour les urgences dépannage' },
        { label: 'Discrétion assurée', desc: 'Vos appareils et données traités avec confidentialité' },
        { label: 'Rapport clair', desc: 'Diagnostic transparent avant toute intervention' },
      ],
    },
    privacy: {
      title: 'Vos données, entre de bonnes mains',
      intro:
        'Nous comprenons que les appareils professionnels contiennent des informations sensibles.',
      points: [
        "Accès aux données limité au strict nécessaire lors de l’intervention",
        'Effacement sécurisé disponible sur demande',
        'Traitement conforme à la loi fédérale sur la protection des données (LPD)',
        'Aucune donnée transmise à des tiers',
      ],
    },
    faq: {
      title: 'Questions fréquentes',
      items: [
        {
          q: "Quels types d’appareils prenez-vous en charge ?",
          a: 'Smartphones (toutes marques), tablettes, MacBook et PC Windows. Pour les équipements réseau ou serveurs, contactez-nous pour évaluer la faisabilité.',
        },
        {
          q: 'Proposez-vous des tarifs particuliers pour les entreprises ?',
          a: 'Nous étudions chaque demande individuellement. Contactez-nous pour discuter de votre situation — nous ferons le point sur les options disponibles.',
        },
        {
          q: "Comment se déroule la prise en charge d’un parc d’appareils ?",
          a: 'Contactez-nous pour planifier une intervention adaptée à votre volume : dépôt en boutique, passage de notre coursier, ou déplacement sur site.',
        },
        {
          q: "Que se passe-t-il si un appareil n’est pas réparable ?",
          a: "Nous vous transmettons un diagnostic clair. Nous pouvons reprendre l’appareil ou procéder à un effacement sécurisé avant mise au rebut.",
        },
        {
          q: 'La confidentialité des données est-elle assurée ?',
          a: "Oui. Nous n’accédons aux données qu’en cas de nécessité stricte liée à l’intervention. Un effacement sécurisé peut être réalisé sur demande avant tout retour ou mise au rebut.",
        },
      ],
    },
    form: {
      title: 'Parlons de votre projet',
      subtitle: 'Remplissez le formulaire ou appelez-nous directement au ',
      phone: '021 320 44 77',
    },
  },
  en: {
    audienceBanner: {
      text: 'Looking for personal device repair?',
      link: 'Discover our individual services',
      href: '/en/repair',
    },
    hero: {
      h1a: 'ClikClak for your',
      h1b: 'business',
      subtitle:
        'Smartphone, tablet, and laptop repair for professionals and SMEs in the Lausanne area. Fast, reliable, and discreet.',
      cta1: 'Get in touch',
      cta2: '021 320 44 77',
    },
    problem: {
      title: 'A broken device means lost productivity',
      points: [
        "Every breakdown disrupts your team’s workflow.",
        'Business data must be handled with care and confidentiality.',
        'Finding a reliable, responsive repair partner takes time.',
      ],
    },
    solutions: {
      title: 'What we offer',
      items: [
        { title: 'Device repair', desc: 'Screen, battery, connectors — all brands (smartphones, tablets, MacBook, PC).' },
        { title: 'Data recovery', desc: 'Emergency recovery for smartphones, hard drives, and SSDs — tailored intervention.' },
        { title: 'On-site repair 7 days/week', desc: 'We come to your office or home in the Lausanne area.' },
        { title: 'Courier service', desc: 'Device pickup and delivery — convenient for teams.' },
        { title: 'Device buyback', desc: 'Estimation and buyback of your end-of-life business devices.' },
      ],
    },
    howItWorks: {
      title: 'How it works',
      steps: [
        { title: 'Contact us', desc: 'By phone, form, or directly in-store.' },
        { title: 'Pickup', desc: 'Drop off in-store, courier pickup, or on-site visit — whatever suits you.' },
        { title: 'Return', desc: 'Device repaired, with warranty on the service.' },
      ],
    },
    modes: {
      title: 'Service options',
      items: [
        {
          title: 'On-demand',
          desc: 'A single repair when you need it. No commitment.',
        },
        {
          title: 'Regular',
          desc: 'For businesses with multiple devices to maintain. Contact us to discuss your needs.',
        },
      ],
    },
    why: {
      title: 'Why ClikClak',
      points: [
        { label: 'Based in Lausanne', desc: 'Rue du Petit-Chêne 9b, 1003 Lausanne' },
        { label: '2-year warranty', desc: 'On all repairs performed' },
        { label: 'Quality parts', desc: 'Original or equivalent quality' },
        { label: 'Available 7 days/week', desc: 'For emergency on-site repairs' },
        { label: 'Full discretion', desc: 'Your devices and data handled confidentially' },
        { label: 'Clear reporting', desc: 'Transparent diagnostic before any intervention' },
      ],
    },
    privacy: {
      title: 'Your data, in safe hands',
      intro: 'We understand that business devices contain sensitive information.',
      points: [
        'Data access limited to what is strictly required for the repair',
        'Secure data wipe available on request',
        'Compliant with Swiss data protection law (nFADP)',
        'No data shared with third parties',
      ],
    },
    faq: {
      title: 'Frequently asked questions',
      items: [
        {
          q: 'Which devices do you repair for businesses?',
          a: 'Smartphones (all brands), tablets, MacBooks, and Windows PCs. For network equipment or servers, contact us to assess feasibility.',
        },
        {
          q: 'Do you offer special rates for businesses?',
          a: "We assess each request individually. Contact us to discuss your situation — we'll review available options together.",
        },
        {
          q: 'How does servicing multiple devices work?',
          a: 'Contact us to plan an intervention suited to your volume: drop-off in-store, courier pickup, or on-site visit.',
        },
        {
          q: "What happens if a device can't be repaired?",
          a: 'We provide a clear diagnostic report. We can take the device back or perform a secure data wipe before disposal.',
        },
        {
          q: 'Is data confidentiality guaranteed?',
          a: 'Yes. We only access data when strictly necessary for the repair. A secure wipe can be performed on request before any return or disposal.',
        },
      ],
    },
    form: {
      title: 'Tell us about your needs',
      subtitle: 'Fill in the form or call us directly at ',
      phone: '021 320 44 77',
    },
  },
} as const

/* ════════════════════════════════════════════════════════════════
   Main component
════════════════════════════════════════════════════════════════ */
export default function B2BPage({ locale = 'fr' }: { locale?: 'fr' | 'en' }) {
  const c = CONTENT[locale]

  /* GA4 — page view B2B au montage */
  useEffect(() => {
    trackEvent('b2b_page_view', { locale })
  }, [locale])

  function handleCta(label: string) {
    trackEvent('b2b_cta_click', { cta_label: label })
  }

  function handlePhoneClick() {
    trackEvent('b2b_phone_click')
  }

  function handleConsumerExit() {
    trackEvent('b2b_consumer_exit_click')
  }

  function scrollToForm(e: React.MouseEvent) {
    e.preventDefault()
    handleCta('hero_contact')
    document.getElementById('b2b-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main>

      {/* ══ AUDIENCE SELECTOR ════════════════════════════════════════════ */}
      <div
        className="px-6 md:px-14 lg:px-20 py-3 flex items-center justify-center gap-2 text-sm font-light"
        style={{ background: 'rgba(204,255,51,0.06)', borderBottom: '1px solid rgba(204,255,51,0.12)' }}
      >
        <span style={{ color: 'rgba(242,242,242,0.5)' }}>{c.audienceBanner.text}</span>
        <Link
          href={c.audienceBanner.href}
          className="underline underline-offset-2 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
          style={{ color: 'rgba(242,242,242,0.75)' }}
          onClick={handleConsumerExit}
        >
          {c.audienceBanner.link} →
        </Link>
      </div>

      {/* ══ HERO ═════════════════════════════════════════════════════════ */}
      <section
        className="px-6 md:px-14 lg:px-20 py-20 border-t border-white/10"
        aria-labelledby="b2b-hero-title"
      >
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 max-w-3xl">
          <h1
            id="b2b-hero-title"
            className="font-light leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            {c.hero.h1a}{' '}
            <span style={{ color: '#ccff33' }}>{c.hero.h1b}</span>
          </h1>
          <p
            className="font-light leading-relaxed max-w-2xl"
            style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', color: 'rgba(242,242,242,0.65)' }}
          >
            {c.hero.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#b2b-form"
              onClick={scrollToForm}
              className="inline-flex items-center px-7 py-3 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              style={{ background: '#ccff33', color: '#191919' }}
            >
              {c.hero.cta1}
            </a>
            <a
              href="tel:+41213204477"
              onClick={handlePhoneClick}
              className="inline-flex items-center gap-2 text-sm font-light px-5 py-3 rounded-lg transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              style={{ border: '1px solid rgba(242,242,242,0.2)', color: 'rgba(242,242,242,0.75)' }}
            >
              {c.hero.cta2}
            </a>
          </div>
        </div>
      </section>

      {/* ══ PROBLÈME ═════════════════════════════════════════════════════ */}
      <section
        className="px-6 md:px-14 lg:px-20 py-16"
        style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(242,242,242,0.06)' }}
        aria-labelledby="b2b-problem-title"
      >
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
          <h2
            id="b2b-problem-title"
            className="font-light leading-tight"
            style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'rgba(242,242,242,0.9)' }}
          >
            {c.problem.title}
          </h2>
          <ul className="flex flex-col gap-4" role="list">
            {c.problem.points.map((pt, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckIcon />
                <span className="text-sm md:text-base font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.65)' }}>
                  {pt}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ══ SOLUTIONS ════════════════════════════════════════════════════ */}
      <section
        className="px-6 md:px-14 lg:px-20 py-16"
        style={{ borderTop: '1px solid rgba(242,242,242,0.06)' }}
        aria-labelledby="b2b-solutions-title"
      >
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
          <h2
            id="b2b-solutions-title"
            className="font-light"
            style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'rgba(242,242,242,0.9)' }}
          >
            {c.solutions.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {c.solutions.items.map((item, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 p-6 rounded-xl"
                style={{ border: '1px solid rgba(242,242,242,0.1)', background: 'rgba(255,255,255,0.02)' }}
              >
                <h3 className="text-base font-light" style={{ color: '#ccff33' }}>{item.title}</h3>
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.55)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          <div>
            <a
              href="#b2b-form"
              onClick={e => { e.preventDefault(); handleCta('solutions_cta'); document.getElementById('b2b-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
              className="inline-flex items-center gap-2 text-sm font-light px-5 py-2.5 rounded-lg transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              style={{ border: '1px solid rgba(204,255,51,0.4)', color: '#ccff33' }}
            >
              {locale === 'fr' ? 'Discuter de votre projet →' : 'Discuss your project →'}
            </a>
          </div>
        </div>
      </section>

      {/* ══ COMMENT ÇA FONCTIONNE ════════════════════════════════════════ */}
      <section
        className="px-6 md:px-14 lg:px-20 py-16"
        style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(242,242,242,0.06)' }}
        aria-labelledby="b2b-how-title"
      >
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
          <h2
            id="b2b-how-title"
            className="font-light"
            style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'rgba(242,242,242,0.9)' }}
          >
            {c.howItWorks.title}
          </h2>
          <div className="flex flex-col md:flex-row gap-8">
            {c.howItWorks.steps.map((step, i) => (
              <div key={i} className="flex-1 flex flex-col gap-4">
                <StepBadge n={i + 1} />
                <h3 className="text-base font-light" style={{ color: 'rgba(242,242,242,0.9)' }}>{step.title}</h3>
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.55)' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MODES D'INTERVENTION ═════════════════════════════════════════ */}
      <section
        className="px-6 md:px-14 lg:px-20 py-16"
        style={{ borderTop: '1px solid rgba(242,242,242,0.06)' }}
        aria-labelledby="b2b-modes-title"
      >
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
          <h2
            id="b2b-modes-title"
            className="font-light"
            style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'rgba(242,242,242,0.9)' }}
          >
            {c.modes.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {c.modes.items.map((item, i) => (
              <div
                key={i}
                className="flex flex-col gap-4 p-8 rounded-xl"
                style={{ border: '1px solid rgba(242,242,242,0.1)', background: 'rgba(255,255,255,0.02)' }}
              >
                <h3 className="text-lg font-light" style={{ color: 'rgba(242,242,242,0.9)' }}>{item.title}</h3>
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.55)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ POURQUOI CLIKCLAK ════════════════════════════════════════════ */}
      <section
        className="px-6 md:px-14 lg:px-20 py-16"
        style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(242,242,242,0.06)' }}
        aria-labelledby="b2b-why-title"
      >
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
          <h2
            id="b2b-why-title"
            className="font-light"
            style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'rgba(242,242,242,0.9)' }}
          >
            {c.why.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {c.why.points.map((pt, i) => (
              <div key={i} className="flex flex-col gap-2">
                <span className="text-sm font-light" style={{ color: '#ccff33' }}>{pt.label}</span>
                <span className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.5)' }}>{pt.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DONNÉES & CONFIDENTIALITÉ ════════════════════════════════════ */}
      <section
        className="px-6 md:px-14 lg:px-20 py-16"
        style={{ borderTop: '1px solid rgba(242,242,242,0.06)' }}
        aria-labelledby="b2b-privacy-title"
      >
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
          <div className="flex-1 flex flex-col gap-6">
            <h2
              id="b2b-privacy-title"
              className="font-light"
              style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'rgba(242,242,242,0.9)' }}
            >
              {c.privacy.title}
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.55)' }}>
              {c.privacy.intro}
            </p>
          </div>
          <ul className="flex-1 flex flex-col gap-3" role="list">
            {c.privacy.points.map((pt, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckIcon />
                <span className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.65)' }}>
                  {pt}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ══ FAQ ══════════════════════════════════════════════════════════ */}
      <section
        className="px-6 md:px-14 lg:px-20 py-16"
        style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(242,242,242,0.06)' }}
        aria-labelledby="b2b-faq-title"
      >
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 max-w-3xl">
          <h2
            id="b2b-faq-title"
            className="font-light"
            style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'rgba(242,242,242,0.9)' }}
          >
            {c.faq.title}
          </h2>
          <div>
            {c.faq.items.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ FORMULAIRE ═══════════════════════════════════════════════════ */}
      <section
        id="b2b-form"
        className="px-6 md:px-14 lg:px-20 py-20"
        style={{ borderTop: '1px solid rgba(242,242,242,0.06)' }}
        aria-labelledby="b2b-form-title"
      >
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20">

          {/* Intro */}
          <div className="lg:w-2/5 flex flex-col gap-6 lg:pt-2">
            <h2
              id="b2b-form-title"
              className="font-light"
              style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'rgba(242,242,242,0.9)' }}
            >
              {c.form.title}
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.55)' }}>
              {c.form.subtitle}
              <a
                href="tel:+41213204477"
                onClick={handlePhoneClick}
                className="text-accent hover:brightness-110 transition-[filter] focus-visible:outline-none"
              >
                {c.form.phone}
              </a>
              .
            </p>
            <address
              className="not-italic text-sm font-light leading-relaxed"
              style={{ color: 'rgba(242,242,242,0.4)' }}
            >
              Clik Clak Repair<br />
              Rue du Petit-Chêne 9b<br />
              1003 Lausanne<br />
              <a
                href="mailto:info@clikclak.ch"
                className="hover:text-accent transition-colors focus-visible:outline-none"
                style={{ color: 'rgba(242,242,242,0.4)' }}
              >
                info@clikclak.ch
              </a>
            </address>
          </div>

          {/* Form */}
          <div className="lg:flex-1">
            <B2BContactForm locale={locale} />
          </div>

        </div>
      </section>

    </main>
  )
}
