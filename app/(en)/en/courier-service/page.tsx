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
  title: 'Courier Repair Service Lausanne | Device Pickup and Return | ClikClak',
  description:
    'ClikClak offers a courier service in Lausanne and nearby areas: device pickup, workshop drop-off and return delivery after repair.',
  alternates: {
    canonical: `${SITE_URL}/en/courier-service`,
    languages: {
      'fr-CH':     `${SITE_URL}/service-de-coursier`,
      'en-CH':     `${SITE_URL}/en/courier-service`,
      'x-default': `${SITE_URL}/service-de-coursier`,
    },
  },
  openGraph: {
    title: 'Courier Repair Service Lausanne — ClikClak',
    description: 'Device pickup and return in Lausanne. CHF 40 round trip, repair not included.',
    url: `${SITE_URL}/en/courier-service`,
    locale: 'en_CH',
    type: 'website',
  },
}

const FOR_WHO = [
  'Individual or business unable to come in person',
  'Smartphone, iPhone, Samsung, Android repair',
  'Tablet or iPad repair',
  'MacBook or computer repair',
  'Data recovery or diagnostic',
]

const PREPARE = [
  'The device to be picked up',
  'The charger if the issue is charging-related',
  'A description of the problem',
  'Your contact details for return',
  'A data backup if possible before the intervention',
]

const STEPS = [
  { num: '01', title: 'Request', text: 'Contact us by phone or via the contact form. Describe the issue and the pickup address.' },
  { num: '02', title: 'Pickup', text: 'A courier picks up your device at the agreed address, subject to availability.' },
  { num: '03', title: 'Repair / diagnostic', text: 'The device is brought to the ClikClak workshop for diagnostic or repair.' },
  { num: '04', title: 'Return delivery', text: 'Once the work is done, the device is delivered back to your address, subject to availability.' },
]

const FAQ: FaqItem[] = [
  {
    q: 'How much does the courier service cost?',
    a: 'The courier service is CHF 40 for the round trip (CHF 20 per leg). This is in addition to the repair price.',
  },
  {
    q: 'Is the repair included in the CHF 40?',
    a: 'No. The CHF 40 covers only the pickup and return of the device. The repair price is added separately depending on the model and issue.',
  },
  {
    q: 'Where is the service available?',
    a: 'The service is available in Lausanne and nearby areas, subject to availability. Contact us to confirm based on your address.',
  },
  {
    q: 'Can I send a computer or tablet?',
    a: 'Yes. The courier service is available for smartphones, tablets, MacBooks and laptops depending on the request.',
  },
  {
    q: 'What should I prepare before the courier arrives?',
    a: 'Have the device ready with the charger if needed. Note the description of the problem. Avoid sharing your unlock code by message — it can be provided directly to the courier if necessary.',
  },
  {
    q: 'What happens if the repair is not possible?',
    a: 'If the repair cannot be done, we will contact you to explain the situation. The device is returned to you. The courier fee remains due per the agreed terms.',
  },
  {
    q: 'Can I use the courier for data recovery?',
    a: 'Yes. The courier service can be used for any type of request: repair, diagnostic or data recovery.',
  },
]

export default function EnCourierServicePage() {
  return (
    <>
      <Header locale="en" />

      <main>

        {/* ══ HERO ════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-20 border-t border-white/10"
          aria-label="Courier service for your repairs"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-center">

            <div className="flex-1 flex flex-col gap-6">
              <div>
                <span
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-light"
                  style={{ border: '1px solid rgba(204,255,51,0.4)', backgroundColor: 'rgba(204,255,51,0.06)', color: '#ccff33' }}
                >
                  Courier service
                </span>
              </div>
              <h1 className="text-[2rem] md:text-[2.75rem] font-light leading-tight">
                Courier service{' '}
                <span className="text-accent">for your repairs</span>
              </h1>
              <div className="block md:hidden -mx-6 w-screen overflow-hidden">
                <Image
                  src="/assets/images/homepage/service-sections/coursier-mobile.webp"
                  alt="ClikClak courier service Lausanne"
                  width={0} height={0} sizes="100vw"
                  className="w-full h-auto"
                />
              </div>
              <p
                className="font-light leading-relaxed max-w-2xl"
                style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', color: 'rgba(242,242,242,0.65)' }}
              >
                Want to repair your phone, tablet or computer but cannot come to the shop? The ClikClak courier service organises pickup of your device, delivery to the workshop and return after intervention.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button href="#courier-request" size="lg">
                  Request a courier
                </Button>
                <Button href="tel:+41213204477" variant="secondary" size="lg">
                  Call ClikClak
                </Button>
              </div>
            </div>

            <div className="hidden md:block w-[45%] shrink-0 rounded-xl overflow-hidden">
              <Image
                src="/assets/images/homepage/service-sections/coursier.webp"
                alt="ClikClak courier service Lausanne"
                width={0} height={0} sizes="45vw"
                className="w-full h-auto"
              />
            </div>

          </div>
        </section>

        {/* ══ TARIF ══════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Courier service pricing"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Service{' '}
              <span className="text-accent">pricing</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-6">
              <div
                className="flex flex-col gap-3 p-6 rounded-xl"
                style={{ border: '1px solid rgba(204,255,51,0.3)', backgroundColor: 'rgba(204,255,51,0.04)' }}
              >
                <p className="text-xs font-light uppercase tracking-[0.15em]" style={{ color: 'rgba(204,255,51,0.7)' }}>
                  Round trip
                </p>
                <p className="text-3xl font-light" style={{ color: '#ccff33' }}>CHF 40</p>
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.55)' }}>
                  CHF 20 per leg (pickup + return). This amount is added to the repair price — it does not include it.
                </p>
              </div>
              <div
                className="flex flex-col gap-3 p-6 rounded-xl flex-1"
                style={{ border: '1px solid rgba(242,242,242,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
              >
                <p className="text-xs font-light uppercase tracking-[0.15em]" style={{ color: 'rgba(242,242,242,0.35)' }}>
                  Coverage area
                </p>
                <p className="text-base font-light" style={{ color: 'rgba(242,242,242,0.85)' }}>
                  Lausanne and nearby areas
                </p>
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.5)' }}>
                  Availability depends on current requests. Contact us to confirm based on your address.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FOR WHO ═════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Who is this service for"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              For{' '}
              <span className="text-accent">whom?</span>
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FOR_WHO.map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span style={{ color: '#ccff33', flexShrink: 0, fontWeight: 300 }}>—</span>
                  <span className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.75)' }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ══ HOW IT WORKS ════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="How the courier service works"
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

        {/* ══ WHAT TO PREPARE ═════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="What to prepare before the courier arrives"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              What to{' '}
              <span className="text-accent">prepare?</span>
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PREPARE.map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span style={{ color: '#ccff33', flexShrink: 0, fontWeight: 300 }}>—</span>
                  <span className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.75)' }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
            <p
              className="text-sm font-light leading-relaxed pl-4"
              style={{ color: 'rgba(242,242,242,0.5)', borderLeft: '2px solid rgba(204,255,51,0.4)' }}
            >
              Never share your Apple ID, Google or Samsung password in a message. If a code is needed for the diagnostic, it can be provided directly to the courier in person.
            </p>
          </div>
        </section>

        {/* ══ FAQ ════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Frequently asked questions — courier service"
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
          aria-label="Request the courier service"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 text-center">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight max-w-xl">
              Ready to use the{' '}
              <span className="text-accent">courier service?</span>
            </h2>
            <p
              className="font-light max-w-xl"
              style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.6)' }}
            >
              Fill in the form below or contact us directly.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="#courier-request" size="lg">
                Request a courier
              </Button>
              <ContactPopover locale="en" />
            </div>
          </div>
        </section>

        {/* ══ FORM ════════════════════════════════════════════════════ */}
        <section
          id="courier-request"
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Courier service request form"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
                Request a{' '}
                <span className="text-accent">courier</span>
              </h2>
              <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.5)' }}>
                Provide the pickup address, device type and issue. ClikClak will confirm service availability.
              </p>
              <p
                className="text-sm font-light leading-relaxed pl-4"
                style={{ color: 'rgba(242,242,242,0.45)', borderLeft: '2px solid rgba(204,255,51,0.35)' }}
              >
                The courier service is CHF 40 for the round trip, not including the repair price. Available in Lausanne and nearby areas subject to availability.
              </p>
            </div>
            <div className="max-w-2xl">
              <ServiceRequestForm serviceType="coursier" locale="en" />
            </div>
          </div>
        </section>

      </main>

      <SiteFooter locale="en" />
      <SectionPinning />
    </>
  )
}
