import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import ContactForm from '@/components/contact/ContactForm'
import FAQAccordion, { type FaqItem } from '@/components/repair/FAQAccordion'
import { Button } from '@/components/ui/Button'
import FloatingContactActions from '@/components/home/FloatingContactActions'

export const metadata: Metadata = {
  title: 'Contact ClikClak Lausanne | Smartphone, iPad, MacBook Repair',
  description:
    'Contact ClikClak in Lausanne for smartphone, iPhone, Samsung, iPad, MacBook repair, data recovery or diagnostic. Send your request with a photo.',
  alternates: {
    canonical: `${SITE_URL}/en/contact/`,
    languages: {
      'fr-CH':    `${SITE_URL}/contact-clik-clak-lausanne/`,
      'en-CH':    `${SITE_URL}/en/contact/`,
      'x-default': `${SITE_URL}/contact-clik-clak-lausanne/`,
    },
  },
  openGraph: {
    title: 'Contact ClikClak Lausanne | Smartphone, iPad, MacBook Repair',
    description: 'Contact ClikClak in Lausanne for repairs or diagnostics. Send your request with a photo.',
    url: `${SITE_URL}/en/contact/`,
    locale: 'en_CH',
    type: 'website',
  },
}

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Clik%20Clak%20Repair%20Rue%20du%20Petit-Ch%C3%AAne%209b%201003%20Lausanne'

const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Do I need to know the exact model before contacting you?',
    a: 'No. You can send us a photo or a general description. We can help identify the model and find the right repair.',
  },
  {
    q: 'Can I send a photo of my device?',
    a: 'Yes. A photo can help us understand the condition of the device or the nature of the problem. It is automatically compressed before sending.',
  },
  {
    q: 'Do I need to provide my PIN or password in the form?',
    a: 'Never in the form. If a code is needed for testing or repair, this is done only during the diagnostic, in-store.',
  },
  {
    q: 'Do you respond to pricing requests?',
    a: 'Yes, if the model and the issue are identified. You can also check our online pricing pages for iPhone, Samsung, iPad and MacBook. If your model is not listed, contact us for a quote.',
  },
  {
    q: 'Can I request a data transfer?',
    a: 'Yes. ClikClak can assist with data transfers between smartphones, iPhone, Android, Mac or PC depending on the case. Please mention it in your message.',
  },
]

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

export default function EnContactPage() {
  return (
    <>
      <Header locale="en" />

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
              Contact ClikClak{' '}
              <span className="text-accent">in Lausanne</span>
            </h1>

            <p
              className="font-light leading-relaxed max-w-2xl"
              style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', color: 'rgba(242,242,242,0.65)' }}
            >
              A question about a repair, a model, a price or a problem? Send us your request with a few details about your device. A photo can help us better understand the issue.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button href="#formulaire">Send a request</Button>
              <Button href="#localisation" variant="secondary">View address</Button>
            </div>
          </div>
        </section>

        {/* ══ COORDONNÉES ═════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Contact details"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Our{' '}
              <span className="text-accent">contact details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Phone */}
              <a
                href="tel:+41213204477"
                className="flex flex-col gap-4 p-5 rounded-xl group"
                style={{ border: '1px solid rgba(242,242,242,0.1)', background: 'rgba(255,255,255,0.02)' }}
                aria-label="Call ClikClak"
              >
                <span style={{ color: '#ccff33' }}><IconPhone /></span>
                <div>
                  <p className="text-xs font-light uppercase tracking-[0.12em] mb-2" style={{ color: 'rgba(242,242,242,0.35)' }}>Phone</p>
                  <p className="text-base font-light group-hover:text-accent transition-colors duration-200" style={{ color: 'rgba(242,242,242,0.85)' }}>
                    021 320 44 77
                  </p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:info@clikclak.ch"
                className="flex flex-col gap-4 p-5 rounded-xl group"
                style={{ border: '1px solid rgba(242,242,242,0.1)', background: 'rgba(255,255,255,0.02)' }}
                aria-label="Send an email to ClikClak"
              >
                <span style={{ color: '#ccff33' }}><IconEmail /></span>
                <div>
                  <p className="text-xs font-light uppercase tracking-[0.12em] mb-2" style={{ color: 'rgba(242,242,242,0.35)' }}>Email</p>
                  <p className="text-base font-light group-hover:text-accent transition-colors duration-200" style={{ color: 'rgba(242,242,242,0.85)' }}>
                    info@clikclak.ch
                  </p>
                </div>
              </a>

              {/* Address */}
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-4 p-5 rounded-xl group"
                style={{ border: '1px solid rgba(242,242,242,0.1)', background: 'rgba(255,255,255,0.02)' }}
                aria-label="View address on Google Maps"
              >
                <span style={{ color: '#ccff33' }}><IconPin /></span>
                <div>
                  <p className="text-xs font-light uppercase tracking-[0.12em] mb-2" style={{ color: 'rgba(242,242,242,0.35)' }}>Address</p>
                  <p className="text-sm font-light leading-snug" style={{ color: 'rgba(242,242,242,0.85)' }}>
                    Rue du Petit-Chêne 9b<br />
                    1003 Lausanne
                  </p>
                </div>
              </a>

              {/* Hours */}
              <div
                className="flex flex-col gap-4 p-5 rounded-xl"
                style={{ border: '1px solid rgba(242,242,242,0.1)', background: 'rgba(255,255,255,0.02)' }}
              >
                <span style={{ color: '#ccff33' }}><IconClock /></span>
                <div>
                  <p className="text-xs font-light uppercase tracking-[0.12em] mb-2" style={{ color: 'rgba(242,242,242,0.35)' }}>Hours</p>
                  <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.85)' }}>
                    Mon – Fri: 10:00 – 18:30<br />
                    Saturday: 10:00 – 17:30
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══ QUICK CONTACT ═══════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Quick contact"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
                Quick{' '}
                <span className="text-accent">contact</span>
              </h2>
              <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.45)' }}>
                Need a fast reply? Choose the most suitable contact method.
              </p>
            </div>
            <FloatingContactActions layout="section" locale="en" />
          </div>
        </section>

        {/* ══ FORMULAIRE ══════════════════════════════════════════════ */}
        <section
          id="formulaire"
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Contact form"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
                Send a{' '}
                <span className="text-accent">request</span>
              </h2>
              <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.45)' }}>
                Fields marked <span style={{ color: '#ccff33' }}>*</span> are required.
                Never share your Apple, Google or Samsung passwords in this form.
              </p>
            </div>
            <div className="max-w-2xl">
              <ContactForm locale="en" />
            </div>
          </div>
        </section>

        {/* ══ TIPS ════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="How to help us reply faster"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              How to help us reply{' '}
              <span className="text-accent">faster?</span>
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'State the model if you know it (iPhone 14, Galaxy S23…)',
                'Describe the problem precisely (black screen, inactive touchscreen, won\'t start…)',
                'Mention if the device was dropped or exposed to liquid',
                'Indicate when the issue started',
                'Add a photo if it can help with the diagnosis',
                'Never share your Apple, Google or Samsung passwords',
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
          aria-label="Find ClikClak in Lausanne"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Find us{' '}
              <span className="text-accent">in Lausanne</span>
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
                    Switzerland
                  </p>
                </address>

                <div className="flex flex-col gap-2 text-sm font-light" style={{ color: 'rgba(242,242,242,0.6)' }}>
                  <p>Mon – Fri: 10:00 – 18:30</p>
                  <p>Saturday: 10:00 – 17:30</p>
                </div>

                <Button href={MAPS_URL} variant="secondary" external>
                  Open in Maps
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FAQ ═════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Frequently asked questions"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Frequently asked{' '}
              <span className="text-accent">questions</span>
            </h2>
            <div className="max-w-3xl">
              <FAQAccordion items={FAQ_ITEMS} />
            </div>
          </div>
        </section>

        {/* ══ CTA FINAL ═══════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Contact ClikClak"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 text-center">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight max-w-xl">
              Ready to send your{' '}
              <span className="text-accent">request?</span>
            </h2>
            <p
              className="font-light max-w-xl"
              style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.6)' }}
            >
              Use the form above or contact us directly by phone or email.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="#formulaire">Send a request</Button>
              <Button href="tel:+41213204477" variant="secondary">021 320 44 77</Button>
            </div>
          </div>
        </section>

      </main>

      <SiteFooter locale="en" />
      <SectionPinning />
    </>
  )
}
