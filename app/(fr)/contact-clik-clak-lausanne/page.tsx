import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import ContactForm from '@/components/contact/ContactForm'
import FAQAccordion, { type FaqItem } from '@/components/repair/FAQAccordion'
import { Button } from '@/components/ui/Button'
import FloatingContactActions from '@/components/home/FloatingContactActions'

/* ── SEO ────────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: 'Contact ClikClak Lausanne | Réparation smartphone, iPad, MacBook',
  description:
    'Contactez ClikClak à Lausanne pour une réparation smartphone, iPhone, Samsung, iPad, MacBook, récupération de données ou diagnostic. Envoyez votre demande avec photo de l\'appareil.',
  alternates: {
    canonical: `${SITE_URL}/contact-clik-clak-lausanne`,
    languages: {
      'fr-CH':    `${SITE_URL}/contact-clik-clak-lausanne`,
      'en-CH':    `${SITE_URL}/en/contact`,
      'x-default': `${SITE_URL}/contact-clik-clak-lausanne`,
    },
  },
  openGraph: {
    title: 'Contact ClikClak Lausanne | Réparation smartphone, iPad, MacBook',
    description: 'Contactez ClikClak à Lausanne pour une réparation ou un diagnostic. Envoyez votre demande avec photo.',
    url: `${SITE_URL}/contact-clik-clak-lausanne`,
    locale: 'fr_CH',
    type: 'website',
  },
}

/* ── Données ────────────────────────────────────────────────────────── */
const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Clik%20Clak%20Repair%20Rue%20du%20Petit-Ch%C3%AAne%209b%201003%20Lausanne'

const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Dois-je connaître le modèle exact avant de vous contacter ?',
    a: 'Non. Vous pouvez nous envoyer une photo ou une description générale. Nous pouvons vous aider à identifier le modèle et à trouver la réparation adaptée.',
  },
  {
    q: 'Puis-je envoyer une photo de mon appareil ?',
    a: 'Oui. Une photo peut aider à comprendre l\'état de l\'appareil ou la nature de la panne. Elle est automatiquement compressée avant l\'envoi.',
  },
  {
    q: 'Dois-je donner mon code ou mot de passe dans le formulaire ?',
    a: 'Non, jamais dans le formulaire. Si un code est nécessaire pour un test ou une réparation, cela se fait uniquement dans le cadre du diagnostic, en magasin.',
  },
  {
    q: 'Répondez-vous aux demandes de tarif ?',
    a: 'Oui, si le modèle et la panne sont identifiés. Consultez également notre page de tarifs en ligne pour iPhone, Samsung, iPad et MacBook. Si votre modèle n\'est pas listé, contactez-nous pour un devis.',
  },
  {
    q: 'Puis-je demander un transfert de données ?',
    a: 'Oui. ClikClak peut vous accompagner pour un transfert de données entre smartphones, iPhone, Android, Mac ou PC selon le cas. Précisez-le dans votre message.',
  },
]

/* ── Icône enveloppe inline ─────────────────────────────────────────── */
function IconEmail() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  )
}

function IconPhone() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

/* ════════════════════════════════════════════════════════════════════ */
export default function ContactPage() {
  return (
    <>
      <Header />

      <main>

        {/* ══ HERO ════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-20 border-t border-white/10"
          aria-label="Contact ClikClak"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">

            <div>
              <span
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-light"
                style={{ border: '1px solid rgba(204,255,51,0.4)', backgroundColor: 'rgba(204,255,51,0.06)', color: '#ccff33' }}
              >
                Contact
              </span>
            </div>

            <h1 className="text-[2rem] md:text-[2.75rem] font-light leading-tight max-w-3xl">
              Contactez ClikClak{' '}
              <span className="text-accent">à Lausanne</span>
            </h1>

            <p
              className="font-light leading-relaxed max-w-2xl"
              style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', color: 'rgba(242,242,242,0.65)' }}
            >
              Une question sur une réparation, un modèle, un prix ou une panne ? Envoyez-nous votre demande avec quelques informations sur votre appareil. Une photo peut nous aider à mieux comprendre le problème.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button href="#formulaire">
                Envoyer une demande
              </Button>
              <Button href="#localisation" variant="secondary">
                Voir l&apos;adresse
              </Button>
            </div>

          </div>
        </section>

        {/* ══ COORDONNÉES ═════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Coordonnées ClikClak"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Nos{' '}
              <span className="text-accent">coordonnées</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Téléphone */}
              <a
                href="tel:+41213204477"
                className="flex flex-col gap-4 p-5 rounded-xl group"
                style={{ border: '1px solid rgba(242,242,242,0.1)', background: 'rgba(255,255,255,0.02)' }}
                aria-label="Appeler ClikClak"
              >
                <span style={{ color: '#ccff33' }}><IconPhone /></span>
                <div>
                  <p className="text-xs font-light uppercase tracking-[0.12em] mb-2" style={{ color: 'rgba(242,242,242,0.35)' }}>Téléphone</p>
                  <p
                    className="text-base font-light group-hover:text-accent transition-colors duration-200"
                    style={{ color: 'rgba(242,242,242,0.85)' }}
                  >
                    021 320 44 77
                  </p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:info@clikclak.ch"
                className="flex flex-col gap-4 p-5 rounded-xl group"
                style={{ border: '1px solid rgba(242,242,242,0.1)', background: 'rgba(255,255,255,0.02)' }}
                aria-label="Envoyer un email à ClikClak"
              >
                <span style={{ color: '#ccff33' }}><IconEmail /></span>
                <div>
                  <p className="text-xs font-light uppercase tracking-[0.12em] mb-2" style={{ color: 'rgba(242,242,242,0.35)' }}>Email</p>
                  <p
                    className="text-base font-light group-hover:text-accent transition-colors duration-200"
                    style={{ color: 'rgba(242,242,242,0.85)' }}
                  >
                    info@clikclak.ch
                  </p>
                </div>
              </a>

              {/* Adresse */}
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-4 p-5 rounded-xl group"
                style={{ border: '1px solid rgba(242,242,242,0.1)', background: 'rgba(255,255,255,0.02)' }}
                aria-label="Voir l'adresse sur Google Maps"
              >
                <span style={{ color: '#ccff33' }}><IconPin /></span>
                <div>
                  <p className="text-xs font-light uppercase tracking-[0.12em] mb-2" style={{ color: 'rgba(242,242,242,0.35)' }}>Adresse</p>
                  <p className="text-sm font-light leading-snug" style={{ color: 'rgba(242,242,242,0.85)' }}>
                    Rue du Petit-Chêne 9b<br />
                    1003 Lausanne
                  </p>
                </div>
              </a>

              {/* Horaires */}
              <div
                className="flex flex-col gap-4 p-5 rounded-xl"
                style={{ border: '1px solid rgba(242,242,242,0.1)', background: 'rgba(255,255,255,0.02)' }}
              >
                <span style={{ color: '#ccff33' }}><IconClock /></span>
                <div>
                  <p className="text-xs font-light uppercase tracking-[0.12em] mb-2" style={{ color: 'rgba(242,242,242,0.35)' }}>Horaires</p>
                  <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.85)' }}>
                    Lu – Ve : 10h00 – 18h30<br />
                    Samedi : 10h00 – 17h30
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══ CONTACT RAPIDE ══════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Contact rapide"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">

            <div className="flex flex-col gap-3">
              <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
                Contact{' '}
                <span className="text-accent">rapide</span>
              </h2>
              <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.45)' }}>
                Besoin d&apos;une réponse rapide ? Choisissez le moyen de contact le plus adapté.
              </p>
            </div>

            <FloatingContactActions layout="section" />

          </div>
        </section>

        {/* ══ FORMULAIRE ══════════════════════════════════════════════ */}
        <section
          id="formulaire"
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Formulaire de contact"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">

            <div className="flex flex-col gap-3">
              <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
                Envoyer une{' '}
                <span className="text-accent">demande</span>
              </h2>
              <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.45)' }}>
                Les champs marqués <span style={{ color: '#ccff33' }}>*</span> sont obligatoires.
                Ne communiquez jamais vos mots de passe Apple, Google ou Samsung dans ce formulaire.
              </p>
            </div>

            <div className="max-w-2xl">
              <ContactForm />
            </div>

          </div>
        </section>

        {/* ══ AIDE ════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Comment nous aider à vous répondre"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Comment nous aider à vous répondre{' '}
              <span className="text-accent">plus vite ?</span>
            </h2>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Indiquez le modèle si vous le connaissez (iPhone 14, Galaxy S23…)',
                'Décrivez la panne précisément (écran noir, tactile inactif, ne démarre plus…)',
                'Indiquez si l\'appareil est tombé ou a été en contact avec un liquide',
                'Précisez depuis quand la panne est apparue',
                'Ajoutez une photo si cela peut aider au diagnostic',
                'Ne communiquez jamais vos mots de passe Apple, Google ou Samsung',
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span style={{ color: '#ccff33', flexShrink: 0, fontWeight: 300 }}>—</span>
                  <span className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.7)' }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>

          </div>
        </section>

        {/* ══ LOCALISATION ════════════════════════════════════════════ */}
        <section
          id="localisation"
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Localisation ClikClak Lausanne"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Nous trouver{' '}
              <span className="text-accent">à Lausanne</span>
            </h2>

            <div className="flex flex-col sm:flex-row gap-8 items-start">

              <div className="flex flex-col gap-5">
                <address className="not-italic flex flex-col gap-2">
                  <p className="text-base font-light" style={{ color: 'rgba(242,242,242,0.85)' }}>
                    Clik Clak Repair
                  </p>
                  <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.6)' }}>
                    Rue du Petit-Chêne 9b<br />
                    1003 Lausanne<br />
                    Suisse
                  </p>
                </address>

                <div className="flex flex-col gap-2 text-sm font-light" style={{ color: 'rgba(242,242,242,0.6)' }}>
                  <p>Lu – Ve : 10h00 – 18h30</p>
                  <p>Samedi : 10h00 – 17h30</p>
                </div>

                <Button href={MAPS_URL} variant="secondary" external>
                  Ouvrir dans Maps
                </Button>
              </div>

            </div>

          </div>
        </section>

        {/* ══ FAQ ═════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Questions fréquentes contact"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Questions{' '}
              <span className="text-accent">fréquentes</span>
            </h2>

            <div className="max-w-3xl">
              <FAQAccordion items={FAQ_ITEMS} />
            </div>

          </div>
        </section>

        {/* ══ CTA FINAL ═══════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Contacter ClikClak"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 text-center">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight max-w-xl">
              Prêt à nous envoyer votre{' '}
              <span className="text-accent">demande ?</span>
            </h2>

            <p
              className="font-light max-w-xl"
              style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.6)' }}
            >
              Utilisez le formulaire ci-dessus ou contactez-nous directement par téléphone ou email.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button href="#formulaire">Envoyer une demande</Button>
              <Button href="tel:+41213204477" variant="secondary">021 320 44 77</Button>
            </div>

          </div>
        </section>

      </main>

      <SiteFooter />
      <SectionPinning />
    </>
  )
}
