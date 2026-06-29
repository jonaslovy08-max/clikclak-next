import type { Metadata } from 'next'
import Image from 'next/image'
import { SITE_URL } from '@/lib/seo'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import ContactPopover from '@/components/home/ContactPopover'
import { Button } from '@/components/ui/Button'
import FAQAccordion, { type FaqItem } from '@/components/repair/FAQAccordion'
import ServiceRequestForm from '@/components/contact/ServiceRequestForm'

export const metadata: Metadata = {
  title: '7/7 On-site Support Lausanne | Smartphone, Tablet & Computer | ClikClak',
  description:
    'Need on-site support in Lausanne? ClikClak assists you 7/7 for diagnostics, configuration, data transfer, technical assistance and repairs, subject to availability.',
  alternates: {
    canonical: `${SITE_URL}/en/services/home-repair-service/`,
    languages: {
      'fr-CH':     `${SITE_URL}/services/depannage-reparation-domicile/`,
      'en-CH':     `${SITE_URL}/en/services/home-repair-service/`,
      'x-default': `${SITE_URL}/services/depannage-reparation-domicile/`,
    },
  },
  openGraph: {
    title: '7/7 On-site Support Lausanne — ClikClak',
    description: '7/7 on-site support in Lausanne: diagnostic, configuration, data transfer, technical assistance, subject to availability.',
    url: `${SITE_URL}/en/services/home-repair-service/`,
    locale: 'en_CH',
    type: 'website',
  },
}

const NEEDS = [
  'Smartphone not working correctly',
  'Tablet frozen or slow',
  'Computer slow or unstable',
  'Configuration issue',
  'Data transfer between devices',
  'Data backup',
  'iCloud, Google or online account help',
  'Installation and settings',
  'Diagnostic before repair',
  'Data recovery when possible',
]

const INCLUDES = [
  'On-site diagnostic',
  'Usage assistance and guidance',
  'Settings and configuration',
  'Data backup or transfer',
  'Device preparation before repair',
  'Help to identify the issue',
  'Advice: repair, recovery, replacement or workshop drop-off',
]

const STEPS = [
  { num: '01', title: 'Contact', text: 'Call us or send your request, describing the problem.' },
  { num: '02', title: 'Assessment', text: 'We confirm whether an on-site visit is relevant or if a workshop drop-off is preferable.' },
  { num: '03', title: 'Intervention', text: 'Support, diagnostic, configuration or guidance on-site as needed.' },
  { num: '04', title: 'Follow-up', text: 'If the device needs workshop repair, we organise the next steps.' },
]

const FAQ: FaqItem[] = [
  {
    q: 'Do you really come to the home?',
    a: 'Yes, depending on availability and request type. Some interventions like diagnostic, data transfer or configuration work well on-site. Others require a workshop drop-off.',
  },
  {
    q: 'Which issues can be handled on-site?',
    a: 'Software issues, configuration, accounts, data transfer, slowness or general diagnostic can often be handled at home. Hardware faults (screen, battery, port) generally require a workshop visit.',
  },
  {
    q: 'Can all repairs be done at home?',
    a: 'No. Interventions requiring full disassembly, part replacement or specialised equipment are done only in the workshop. Home support covers assistance, diagnostic and light interventions.',
  },
  {
    q: 'Can I request a data transfer at home?',
    a: 'Yes. Data transfer is one of the services well-suited to home intervention. We can assist you in backing up or migrating data between devices.',
  },
  {
    q: 'Do you operate outside Lausanne?',
    a: 'Intervention is possible in Lausanne and French-speaking Switzerland, depending on availability and request type. Contact us to confirm based on your location.',
  },
  {
    q: 'Should I prepare anything before your visit?',
    a: 'Have the device charged and available. If an unlock code is needed for the diagnostic, prepare it. Avoid sharing your Apple, Google or Samsung password by message.',
  },
  {
    q: 'What happens if the issue requires the workshop?',
    a: 'We direct you to the Lausanne shop or offer the courier service to organise device pickup if you cannot come in.',
  },
]

export default function EnHomeRepairServicePage() {
  return (
    <>
      <Header locale="en" />

      <main>

        {/* ══ HERO ════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-20 border-t border-white/10"
          aria-label="7/7 on-site support in Lausanne"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-center">

            <div className="flex-1 flex flex-col gap-6">
              <div>
                <span
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-light"
                  style={{ border: '1px solid rgba(204,255,51,0.4)', backgroundColor: 'rgba(204,255,51,0.06)', color: '#ccff33' }}
                >
                  7/7 On-site support
                </span>
              </div>
              <h1 className="text-[2rem] md:text-[2.75rem] font-light leading-tight">
                7/7 support{' '}
                <span className="text-accent">in Lausanne</span>
              </h1>
              <div className="block md:hidden -mx-6 w-screen overflow-hidden">
                <Image
                  src="/assets/images/homepage/service-sections/depannage-7-7-mobile.webp"
                  alt="7/7 on-site support ClikClak for smartphone, tablet and computer"
                  width={0} height={0} sizes="100vw"
                  className="w-full h-auto"
                />
              </div>
              <p
                className="font-light leading-relaxed max-w-2xl"
                style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', color: 'rgba(242,242,242,0.65)' }}
              >
                Issue with your smartphone, tablet or computer? ClikClak assists you 7/7 for support, diagnostic, configuration, data transfer or technical assistance, subject to availability and request type.
              </p>
              <p
                className="text-sm font-light leading-relaxed max-w-xl pl-4"
                style={{ color: 'rgba(242,242,242,0.45)', borderLeft: '2px solid rgba(204,255,51,0.3)' }}
              >
                Interventions are offered subject to availability, coverage area, request type and technical feasibility.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button href="#support-request" size="lg">
                  Request support
                </Button>
                <Button href="tel:+41213204477" variant="secondary" size="lg">
                  Call ClikClak
                </Button>
              </div>
            </div>

            <div className="hidden md:block w-[45%] shrink-0 rounded-xl overflow-hidden">
              <Image
                src="/assets/images/homepage/service-sections/depannage-7-7.webp"
                alt="7/7 on-site support ClikClak for smartphone, tablet and computer"
                width={0} height={0} sizes="45vw"
                className="w-full h-auto"
              />
            </div>

          </div>
        </section>

        {/* ══ NEEDS ════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="What needs can we cover"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              What{' '}
              <span className="text-accent">needs?</span>
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {NEEDS.map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span style={{ color: '#ccff33', flexShrink: 0, fontWeight: 300 }}>—</span>
                  <span className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.75)' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ══ INCLUDES ════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="What the support can include"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              What the support can{' '}
              <span className="text-accent">include</span>
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INCLUDES.map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span style={{ color: '#ccff33', flexShrink: 0, fontWeight: 300 }}>—</span>
                  <span className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.75)' }}>{item}</span>
                </li>
              ))}
            </ul>
            <p
              className="text-sm font-light leading-relaxed pl-4"
              style={{ color: 'rgba(242,242,242,0.5)', borderLeft: '2px solid rgba(204,255,51,0.4)' }}
            >
              Some repairs require a workshop visit, particularly motherboard interventions, complex screens, advanced oxidation, complex data recovery or deep disassembly.
            </p>
          </div>
        </section>

        {/* ══ STEPS ════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="How the on-site support works"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              How does it{' '}
              <span className="text-accent">work?</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {STEPS.map(step => (
                <div
                  key={step.num}
                  className="flex flex-col gap-4 p-5 rounded-xl"
                  style={{ border: '1px solid rgba(242,242,242,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                >
                  <span className="text-2xl font-light" style={{ color: 'rgba(204,255,51,0.5)' }}>{step.num}</span>
                  <p className="text-sm font-light" style={{ color: '#ededed' }}>{step.title}</p>
                  <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.5)' }}>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ ZONE + PRICING ═══════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Coverage area and pricing"
        >
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-4">
              <h2 className="text-[1.5rem] md:text-[1.75rem] font-light leading-tight">
                Coverage <span className="text-accent">area</span>
              </h2>
              <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.65)' }}>
                Lausanne and French-speaking Switzerland, subject to availability and request type. Contact us to confirm based on your location and need.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-[1.5rem] md:text-[1.75rem] font-light leading-tight">
                <span className="text-accent">Pricing</span>
              </h2>
              <div className="flex flex-col">
                {[
                  'On-site diagnostic / support: on request',
                  'Intervention by duration, distance and complexity: on request',
                  'Hardware repair (workshop): on request by model',
                ].map(t => (
                  <p key={t} className="flex items-start gap-3 py-3 text-sm font-light leading-relaxed" style={{ borderBottom: '1px solid rgba(242,242,242,0.07)', color: 'rgba(242,242,242,0.65)' }}>
                    <span style={{ color: '#ccff33', flexShrink: 0 }}>—</span>
                    {t}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ FAQ ════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Frequently asked questions — home support"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Frequently asked{' '}
              <span className="text-accent">questions</span>
            </h2>
            <div className="max-w-3xl">
              <FAQAccordion items={FAQ} />
            </div>
          </div>
        </section>

        {/* ══ CTA ════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Request 7/7 on-site support"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 text-center">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight max-w-xl">
              Need{' '}
              <span className="text-accent">7/7 support?</span>
            </h2>
            <p
              className="font-light max-w-xl"
              style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.6)' }}
            >
              Fill in the form below or contact us directly.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="#support-request" size="lg">
                Request support
              </Button>
              <ContactPopover locale="en" />
            </div>
          </div>
        </section>

        {/* ══ FORM ════════════════════════════════════════════════════ */}
        <section
          id="support-request"
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Home support request form"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
                Request{' '}
                <span className="text-accent">support</span>
              </h2>
              <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.5)' }}>
                Describe your issue and provide your address or area. ClikClak will reply to confirm whether an on-site visit is appropriate.
              </p>
            </div>
            <div className="max-w-2xl">
              <ServiceRequestForm serviceType="depannage" locale="en" />
            </div>
          </div>
        </section>

      </main>

      <SiteFooter locale="en" />
      <SectionPinning />
    </>
  )
}
