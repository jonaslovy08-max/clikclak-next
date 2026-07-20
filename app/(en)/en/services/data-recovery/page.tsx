import type { Metadata } from 'next'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import ContactPopover from '@/components/home/ContactPopover'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Data Recovery Lausanne | Smartphone, HDD, SSD, Mac & PC | ClikClak',
  description:
    'Data recovery in Lausanne on iPhone, Android, MacBook, PC, hard drive, SSD, USB, SD card, RAID and damaged media. Diagnostic, clear quote and secure transfer.',
  alternates: {
    canonical: `${SITE_URL}/en/services/data-recovery`,
    languages: {
      'fr-CH':     `${SITE_URL}/services/recuperation-donnees`,
      'en-CH':     `${SITE_URL}/en/services/data-recovery`,
      'x-default': `${SITE_URL}/services/recuperation-donnees`,
    },
  },
  openGraph: {
    title: 'Data Recovery Lausanne — ClikClak',
    description: 'Data recovery in Lausanne on iPhone, Android, MacBook, PC, hard drive, SSD, RAID and damaged media.',
    url: `${SITE_URL}/en/services/data-recovery`,
    locale: 'en_CH',
    type: 'website',
  },
}

function PriceRow({ label, price }: { label: string; price: string }) {
  const isText = !price.includes('CHF') && price !== 'On request'
  return (
    <div
      className="flex items-start justify-between gap-4 py-2.5"
      style={{ borderBottom: '1px solid rgba(242,242,242,0.07)' }}
    >
      <span className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.75)' }}>{label}</span>
      <span
        className="text-sm font-light whitespace-nowrap"
        style={{ color: isText ? 'rgba(242,242,242,0.45)' : '#ccff33' }}
      >
        {price}
      </span>
    </div>
  )
}

function ServiceCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col gap-5 p-6 rounded-xl"
      style={{ border: '1px solid rgba(242,242,242,0.12)', backgroundColor: 'rgba(255,255,255,0.02)' }}
    >
      <h3 className="text-base md:text-lg font-light leading-snug" style={{ color: '#ededed' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function EnDataRecoveryPage() {
  return (
    <>
      <Header locale="en" />

      <main>

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-20 border-t border-white/10"
          aria-label="Data recovery in Lausanne"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-center">

            <div className="flex-1 flex flex-col gap-6">
              <h1 className="text-[2rem] md:text-[2.75rem] font-light leading-tight">
                Data{' '}
                <span className="text-accent">recovery</span>{' '}
                in Lausanne
              </h1>
              <div className="block md:hidden -mx-6 w-screen overflow-hidden">
                <Image
                  src="/assets/images/homepage/service-sections/data-recovery-mobile.webp"
                  alt="Data recovery ClikClak Lausanne"
                  width={0} height={0} sizes="100vw"
                  className="w-full h-auto"
                />
              </div>
              <p
                className="font-light leading-relaxed max-w-2xl"
                style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', color: 'rgba(242,242,242,0.65)' }}
              >
                Photos, contacts, documents, messages, professional files or personal memories: ClikClak analyses your device or storage media to estimate recovery chances and offer an appropriate intervention.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <ContactPopover locale="en" />
                <a
                  href="#data-transfer"
                  className="inline-flex items-center gap-2 text-sm font-light px-5 py-2.5 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                  style={{ border: '1px solid rgba(242,242,242,0.2)', color: 'rgba(242,242,242,0.75)' }}
                >
                  Transfer my data
                </a>
              </div>
            </div>

            <div className="hidden md:block w-[45%] shrink-0 rounded-xl overflow-hidden">
              <Image
                src="/assets/images/homepage/service-sections/data-recovery.webp"
                alt="Data recovery ClikClak Lausanne"
                width={0} height={0} sizes="45vw"
                className="w-full h-auto"
              />
            </div>

          </div>
        </section>

        {/* ══ INTRO ══════════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Data recovery introduction"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight max-w-2xl">
              Your data is often more important{' '}
              <span className="text-accent">than the device</span>
            </h2>

            <p
              className="font-light leading-relaxed max-w-2xl"
              style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.6)' }}
            >
              A smartphone that won&apos;t turn on, a blocked MacBook, a clicking hard drive, an unrecognised SSD or an unreadable SD card may contain essential data. ClikClak analyses your media in Lausanne and explains the available options before any intervention.
            </p>

            <p
              className="text-sm font-light leading-relaxed"
              style={{ color: 'rgba(242,242,242,0.45)', borderLeft: '2px solid rgba(204,255,51,0.4)', paddingLeft: 16 }}
            >
              Recovery chances depend on the condition of the media, the type of fault, encryption, physical damage and any manipulations already performed.
            </p>

          </div>
        </section>

        {/* ══ RECOVERABLE DATA ══════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Types of recoverable data"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              What types of data can we{' '}
              <span className="text-accent">recover?</span>
            </h2>

            <div className="flex flex-wrap gap-3">
              {[
                'Photos and videos',
                'Contacts',
                'Messages',
                'Documents',
                'Professional files',
                'App data',
                'Backups',
                'Mac / PC user folders',
                'Hard drive data',
                'SSD data',
                'USB drive',
                'SD card',
                'RAID',
              ].map(item => (
                <span
                  key={item}
                  className="text-sm font-light px-4 py-2 rounded-lg"
                  style={{ border: '1px solid rgba(242,242,242,0.15)', color: 'rgba(242,242,242,0.75)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                >
                  {item}
                </span>
              ))}
            </div>

            <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
              Some data may be inaccessible depending on encryption, the operating system, the device model or the condition of the media.
            </p>

          </div>
        </section>

        {/* ══ SERVICES ══════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Data recovery services"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Our <span className="text-accent">interventions</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <ServiceCard title="Data recovery from smartphone and iPhone">
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.6)' }}>
                  We handle iPhones and Android smartphones that no longer turn on, have suffered a shock, liquid contact, electronic fault or motherboard issue.
                </p>
                <ul className="flex flex-col gap-1.5">
                  {[
                    'Device that won\'t boot',
                    'Unusable screen',
                    'Damaged motherboard',
                    'Oxidation',
                    'Shock or drop',
                    'Damaged connector',
                    'Code or access issues depending on the case',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm font-light" style={{ color: 'rgba(242,242,242,0.65)' }}>
                      <span style={{ color: '#ccff33', flexShrink: 0 }}>—</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col">
                  <PriceRow label="Advanced data extraction"                 price="CHF 490" />
                  <PriceRow label="Complex electronic issue"                 price="CHF 690" />
                  <PriceRow label="Shock or liquid-related damage"           price="CHF 690" />
                  <PriceRow label="Motherboard repair / advanced work"       price="CHF 1490" />
                  <PriceRow label="Forgotten or lost code"                   price="from CHF 390 to CHF 3000" />
                </div>
                <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.35)' }}>
                  Interventions related to a forgotten code or locked device require proof of ownership. Recovery depends on the model, OS, encryption and device condition.
                </p>
              </ServiceCard>

              <ServiceCard title="Recovery from MacBook, Surface and laptop PC">
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.6)' }}>
                  We analyse computers that won&apos;t start, have a memory fault, motherboard issue or internal storage problem.
                </p>
                <div className="flex flex-col">
                  <PriceRow label="RAM / memory issue"                       price="CHF 590" />
                  <PriceRow label="PC / Mac motherboard repair"              price="CHF 1190" />
                  <PriceRow label="Mac / PC data recovery"                   price="On request" />
                  <PriceRow label="Transfer to new Mac / PC"                 price="On request" />
                </div>
              </ServiceCard>

              <ServiceCard title="Data recovery from HDD hard drive">
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.6)' }}>
                  We handle recognised but inaccessible drives, electronic faults and mechanical failures. If you hear abnormal noise, stop powering the drive before diagnosis.
                </p>
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.5)' }}>Logical issues — recognised but inaccessible, corrupted partition</p>
                  <div className="flex flex-col">
                    <PriceRow label="USB, SD, CMR hard drive"                     price="CHF 190" />
                    <PriceRow label="SMR drive, WD / Seagate from 2019"           price="CHF 290" />
                  </div>
                  <p className="text-xs font-light mt-2" style={{ color: 'rgba(242,242,242,0.5)' }}>Electronic faults</p>
                  <div className="flex flex-col">
                    <PriceRow label="HDD CMR"  price="CHF 390" />
                    <PriceRow label="HDD SMR"  price="CHF 490" />
                  </div>
                  <p className="text-xs font-light mt-2" style={{ color: 'rgba(242,242,242,0.5)' }}>Mechanical failures</p>
                  <div className="flex flex-col">
                    <PriceRow label="500 GB"                                         price="CHF 990" />
                    <PriceRow label="1 TB"                                           price="CHF 1090" />
                    <PriceRow label="2 TB"                                           price="CHF 1190" />
                    <PriceRow label="+CHF 100 per additional TB up to 22 TB"        price="" />
                    <PriceRow label="Encrypted / locked SMR drive surcharge"        price="+CHF 200" />
                  </div>
                </div>
              </ServiceCard>

              <ServiceCard title="Recovery from SSD, NVMe, USB, SD and MicroSD">
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.6)' }}>
                  Flash media can suffer controller, NAND memory, firmware faults or logical corruptions.
                </p>
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.5)' }}>SSD / NVMe</p>
                  <div className="flex flex-col">
                    <PriceRow label="SSD 64 GB"   price="CHF 690" />
                    <PriceRow label="SSD 256 GB"  price="CHF 790" />
                    <PriceRow label="SSD 1 TB"    price="CHF 990" />
                    <PriceRow label="SSD 4 TB"    price="CHF 1190" />
                    <PriceRow label="SSD 8 TB"    price="CHF 1290" />
                  </div>
                  <p className="text-xs font-light mt-2" style={{ color: 'rgba(242,242,242,0.5)' }}>USB drive, SD & MicroSD</p>
                  <div className="flex flex-col">
                    <PriceRow label="8 GB to 16 GB"             price="CHF 490" />
                    <PriceRow label="32 GB to 64 GB"            price="CHF 590" />
                    <PriceRow label="128 GB to 512 GB"          price="from CHF 690" />
                    <PriceRow label="Complex pinout search"     price="+CHF 200" />
                  </div>
                </div>
              </ServiceCard>

              <ServiceCard title="RAID, NAS and ransomware">
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.6)' }}>
                  For RAID systems, NAS or ransomware cases, analysis depends on the number of drives, configuration, volume order and encryption level. Do not reinitialise, rebuild, reformat or modify the RAID configuration before diagnosis.
                </p>
                <div className="flex flex-col">
                  <PriceRow label="Ransomware / RAID logical 0+1 treatment" price="CHF 450 / drive" />
                </div>
              </ServiceCard>

            </div>
          </div>
        </section>

        {/* ══ DATA TRANSFER ════════════════════════════════════════════════ */}
        <section
          id="data-transfer"
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Data transfer"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Data transfer to a{' '}
              <span className="text-accent">new device</span>
            </h2>

            <p
              className="font-light leading-relaxed max-w-2xl"
              style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.6)' }}
            >
              ClikClak also handles data transfer when your device is still working or when partial recovery is possible.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'iPhone to iPhone transfer',
                'Android to Android transfer',
                'Android to iPhone transfer',
                'iPhone to Android transfer',
                'Smartphone to computer transfer',
                'Mac to Mac transfer',
                'PC to PC transfer',
                'Backup to external drive',
                'Photos, contacts, documents and file transfer',
                'iCloud, Google Drive, Google Photos or WhatsApp help',
              ].map(item => (
                <div key={item} className="flex items-start gap-2 text-sm font-light" style={{ color: 'rgba(242,242,242,0.7)' }}>
                  <span style={{ color: '#ccff33', flexShrink: 0 }}>—</span>
                  {item}
                </div>
              ))}
            </div>

            <div
              className="flex flex-col p-5 rounded-xl"
              style={{ border: '1px solid rgba(242,242,242,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
            >
              <PriceRow label="Simple smartphone transfer"   price="On request" />
              <PriceRow label="Full smartphone transfer"    price="On request" />
              <PriceRow label="Mac / PC transfer"           price="On request" />
              <PriceRow label="Backup to external drive"    price="On request" />
            </div>

            <div>
              <ContactPopover locale="en" />
            </div>

          </div>
        </section>

        {/* ══ PROCESS ═════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="How it works"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              How does it <span className="text-accent">work?</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { num: '01', title: 'Diagnostic', text: 'We analyse the device or media to identify the type of fault.' },
                { num: '02', title: 'Estimate', text: 'We explain recovery options and the applicable price or a range depending on the case.' },
                { num: '03', title: 'Intervention', text: 'After validation, the intervention is carried out with the necessary care.' },
                { num: '04', title: 'Handover', text: 'Recovered data is returned on a suitable medium or transferred to a new device.' },
              ].map(step => (
                <div
                  key={step.num}
                  className="flex flex-col gap-4 p-6 rounded-xl"
                  style={{ border: '1px solid rgba(242,242,242,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                >
                  <span className="text-3xl font-light" style={{ color: 'rgba(204,255,51,0.5)' }}>{step.num}</span>
                  <p className="text-base font-light" style={{ color: '#ededed' }}>{step.title}</p>
                  <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.55)' }}>{step.text}</p>
                </div>
              ))}
            </div>

            <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
              No complex intervention is started without client validation.
            </p>

          </div>
        </section>

        {/* ══ CTA ══════════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Request a data recovery diagnostic"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 text-center">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight max-w-xl">
              Need to recover or{' '}
              <span className="text-accent">transfer your data?</span>
            </h2>

            <p
              className="font-light leading-relaxed max-w-xl"
              style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.6)' }}
            >
              Bring your device or media to ClikClak in Lausanne for an initial analysis. A diagnostic may be required before confirming the price and recovery chances.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-4">
              <ContactPopover locale="en" />
              <a
                href="#data-transfer"
                className="inline-flex items-center gap-2 text-sm font-light px-5 py-2.5 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                style={{ border: '1px solid rgba(242,242,242,0.2)', color: 'rgba(242,242,242,0.75)' }}
              >
                Transfer my data
              </a>
            </div>

          </div>
        </section>

      </main>

      <SiteFooter locale="en" />
      <SectionPinning />
    </>
  )
}
