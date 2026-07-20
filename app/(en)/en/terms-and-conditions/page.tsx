/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Terms and Conditions — Clik Clak Repair',
  description: 'General terms and conditions for repair services provided by Clik Clak SàRL, Lausanne.',
  alternates: {
    canonical: `${SITE_URL}/en/terms-and-conditions`,
    languages: {
      'fr-CH':     `${SITE_URL}/cgv`,
      'en-CH':     `${SITE_URL}/en/terms-and-conditions`,
      'x-default': `${SITE_URL}/cgv`,
    },
  },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Terms and Conditions — Clik Clak Repair',
    url: `${SITE_URL}/en/terms-and-conditions`,
    locale: 'en_CH',
    type: 'website',
  },
}

export default function EnTermsPage() {
  return (
    <>
      <Header locale="en" />

      <main>
        <section className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10">
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-12">

            <div className="flex flex-col gap-4">
              <h1 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
                Terms and conditions of{' '}
                <span className="text-accent">sale and repair</span>
              </h1>
              <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
                CLIK CLAK SàRL — Last updated: to be completed
              </p>
            </div>

            <div className="flex flex-col gap-10" style={{ color: 'rgba(242,242,242,0.75)', lineHeight: 1.75 }}>

              <Article n="1" title="Scope">
                <p>
                  These General Terms and Conditions of Sale and Repair ("GTC") govern all diagnostic, repair, parts replacement, data recovery, accessory sales and related services performed by CLIK CLAK SàRL.
                </p>
                <p>
                  Dropping off a device, approving a quote, booking an appointment, placing an order or accepting an intervention constitutes full acceptance of these GTC.
                </p>
                <p>
                  CLIK CLAK SàRL acts exclusively at the Client's request and based on information provided by the Client.
                </p>
              </Article>

              <Article n="2" title="Quote, diagnostic and acceptance">
                <p>
                  Prices shown on the website, in the shop, by phone, email or message are indicative until the device has been inspected.
                </p>
                <p>
                  A quote may be issued after diagnostic. The Client is free to accept or decline it.
                </p>
                <p>A diagnostic fee of CHF 40.– applies if:</p>
                <ul>
                  <li>the Client declines the quote after diagnostic;</li>
                  <li>the device is declared beyond repair;</li>
                  <li>the Client withdraws from the intervention after opening or technical analysis;</li>
                  <li>no economically reasonable repair is possible.</li>
                </ul>
                <p>
                  This fee may be deducted from the final price if the repair is accepted, unless otherwise stated.
                </p>
              </Article>

              <Article n="3" title="Pricing and payment">
                <p>Prices are in Swiss francs unless otherwise stated.</p>
                <p>
                  Payment is due at the latest upon return of the device. CLIK CLAK SàRL reserves the right to retain the device until all amounts due have been paid in full.
                </p>
                <p>
                  Replaced, defective or removed parts become the property of CLIK CLAK SàRL, unless the Client expressly requests them before the intervention.
                </p>
              </Article>

              <Article n="4" title="Data responsibility">
                <p>
                  The Client is solely responsible for fully backing up their data before any intervention.
                </p>
                <p>
                  CLIK CLAK SàRL has no obligation to back up, preserve, restore or transfer data unless a specific written service has been agreed.
                </p>
                <p>
                  CLIK CLAK SàRL accepts no liability for loss, deletion, corruption, alteration or inability to access data, including photos, videos, messages, contacts, applications, files, accounts, settings or personal content.
                </p>
                <p>
                  The Client acknowledges that a technical intervention may require turning on, rebooting, resetting or testing the device, which may entail risks to data.
                </p>
              </Article>

              <Article n="5" title="Codes, accounts and access">
                <p>
                  For certain tests, the Client may be asked to provide an unlock code or disable security features, including iCloud, Find My iPhone, Google Account, Samsung Account or equivalent systems.
                </p>
                <p>
                  If the Client refuses to provide necessary access, some tests cannot be carried out and the warranty may be limited to verifiable elements only.
                </p>
                <p>
                  CLIK CLAK SàRL undertakes not to intentionally consult the Client's personal content. However, the Client acknowledges that some elements may be briefly visible during functional testing.
                </p>
              </Article>

              <Article n="6" title="Repair warranty">
                <p>Unless otherwise stated in writing, repairs carry the following warranties:</p>
                <ul>
                  <li>Original or manufacturer-equivalent parts: 24-month warranty.</li>
                  <li>Compatible, generic or refurbished parts: 3-month warranty.</li>
                  <li>
                    Repairs related to oxidation, liquid damage, motherboard, micro-soldering or data recovery: no lifespan warranty, unless a specific written agreement applies.
                  </li>
                </ul>
                <p>
                  The warranty covers only manufacturing or functional defects in the replaced part under normal use.
                </p>
                <p>The warranty does not cover:</p>
                <ul>
                  <li>damage from falls, shocks, pressure, twisting or crushing;</li>
                  <li>cracked glass, screen, OLED/LCD display or frame;</li>
                  <li>vertical or horizontal lines, black spots, dead pixels, black screen or no display caused by physical trauma;</li>
                  <li>oxidation, humidity, liquid contact or corrosion;</li>
                  <li>damage from heat, cold, fire, power surge, defective charger or swollen battery;</li>
                  <li>interventions, openings, repair attempts or modifications carried out by the Client or a third party;</li>
                  <li>defects related to pre-existing, hidden or non-visible damage at the time of diagnostic;</li>
                  <li>software issues, updates, account locks, manufacturer restrictions or system incompatibilities.</li>
                </ul>
                <p>
                  Any unauthorised intervention or opening of the device by a third party immediately voids the CLIK CLAK SàRL warranty.
                </p>
              </Article>

              <Article n="7" title="Water resistance after repair">
                <p>
                  The Client acknowledges that opening a device may alter or eliminate its water resistance, even if new gaskets are fitted.
                </p>
                <p>
                  CLIK CLAK SàRL provides no water resistance guarantee after any intervention, including on devices originally marketed as water-resistant by the manufacturer.
                </p>
              </Article>

              <Article n="8" title="Face ID, Touch ID, True Tone and manufacturer functions">
                <p>
                  The Client is informed that certain functions — including Face ID, Touch ID, True Tone, biometric recognition, system messages, sensors or calibrations — may be software- or hardware-linked to the motherboard and original components.
                </p>
                <p>
                  CLIK CLAK SàRL cannot guarantee the preservation or restoration of these functions when their operation depends on manufacturer restrictions, prior damage, proprietary components or software locks.
                </p>
                <p>
                  Unless CLIK CLAK SàRL is demonstrably at fault, no compensation will be owed for the loss or limitation of these functions.
                </p>
              </Article>

              <Article n="9" title="Risks related to damaged devices">
                <p>
                  The Client acknowledges that a device that has suffered a shock, fall, twisting, crushing, oxidation or a previous repair may have invisible internal damage.
                </p>
                <p>
                  During disassembly, opening, heating, disconnection or part replacement, this damage may become apparent or worsen.
                </p>
                <p>CLIK CLAK SàRL accepts no liability for total or partial failure resulting from pre-existing damage, including:</p>
                <ul>
                  <li>cracked motherboard;</li>
                  <li>short circuit;</li>
                  <li>overheating;</li>
                  <li>unstable or swollen battery;</li>
                  <li>weakened flex cable;</li>
                  <li>damaged connector;</li>
                  <li>internal oxidation;</li>
                  <li>fault appearing after opening but linked to the initial condition of the device.</li>
                </ul>
              </Article>

              <Article n="10" title="Oxidation and liquid contact">
                <p>
                  In case of liquid contact or oxidation, the primary goal of the intervention is, where possible, data recovery or temporary restoration of function.
                </p>
                <p>
                  No lifespan, stability, performance or fault-free guarantee is given after de-oxidation.
                </p>
                <p>
                  The Client acknowledges that an oxidised device may stop working at any time, even after a successful intervention.
                </p>
              </Article>

              <Article n="11" title="Turnaround times">
                <p>
                  Stated turnaround times are indicative and may vary depending on parts availability, intervention complexity, the actual condition of the device or supplier delays.
                </p>
                <p>
                  Unless otherwise agreed in writing, the indicative maximum turnaround is 30 business days, excluding parts shortages, force majeure, complex cases, oxidation, motherboard issues or data recovery.
                </p>
                <p>
                  No compensation will be owed for reasonable delays or delays beyond CLIK CLAK SàRL's control.
                </p>
              </Article>

              <Article n="12" title="Unclaimed devices">
                <p>
                  The Client must collect their device as soon as notified of its availability by SMS, call, email or any other provided contact method.
                </p>
                <p>
                  If the device is not collected within 90 days of notification, CLIK CLAK SàRL may charge storage and handling fees.
                </p>
                <p>
                  After follow-up with no response and within the limits of Swiss law, CLIK CLAK SàRL may take necessary steps regarding the unclaimed device, including conservation, recycling, destruction, valorisation or realisation, to cover amounts due.
                </p>
                <p>
                  CLIK CLAK SàRL also reserves a right of retention over the device until all amounts due have been paid in full, in accordance with applicable Swiss law.
                </p>
              </Article>

              <Article n="13" title="Limitation of liability">
                <p>
                  Within the limits permitted by Swiss law, CLIK CLAK SàRL's liability is limited to direct, proven damages exclusively attributable to a fault by CLIK CLAK SàRL.
                </p>
                <p>All liability for indirect or consequential damages is excluded, including:</p>
                <ul>
                  <li>data loss;</li>
                  <li>loss of revenue;</li>
                  <li>loss of profit;</li>
                  <li>business interruption;</li>
                  <li>loss of opportunity;</li>
                  <li>device downtime;</li>
                  <li>inability to use applications, accounts or services;</li>
                  <li>replacement costs not pre-approved by CLIK CLAK SàRL.</li>
                </ul>
                <p>
                  If direct liability is established, maximum compensation is limited, at CLIK CLAK SàRL's choice, to:
                </p>
                <ul>
                  <li>repair of the device;</li>
                  <li>refund of the amount paid for the relevant intervention;</li>
                  <li>replacement with a comparable refurbished device in equivalent condition, capacity and generation.</li>
                </ul>
                <p>
                  The Client must then return the concerned device to CLIK CLAK SàRL and deactivate all accounts, locks and protections associated with it.
                </p>
                <p>
                  This limitation does not apply in cases of fraud or gross negligence by CLIK CLAK SàRL, as provided under mandatory Swiss law.
                </p>
              </Article>

              <Article n="14" title="Manufacturer warranty">
                <p>
                  The Client acknowledges that any intervention not performed by the manufacturer or an authorised centre may result in total or partial loss of the manufacturer's warranty, including from Apple, Samsung, Huawei, OPPO, Sony or any other brand.
                </p>
                <p>
                  CLIK CLAK SàRL cannot be held liable for the loss of a manufacturer warranty following an intervention requested by the Client.
                </p>
              </Article>

              <Article n="15" title="Compatible parts and system messages">
                <p>
                  The Client acknowledges that using compatible, generic or refurbished parts may result in system messages, unknown part alerts, software restrictions or differences in display, brightness, colour, battery life or touch sensitivity.
                </p>
                <p>
                  These elements do not necessarily constitute a repair defect if they result from manufacturer restrictions or the nature of the chosen part.
                </p>
              </Article>

              <Article n="16" title="Governing law and jurisdiction">
                <p>These GTC are governed by Swiss law.</p>
                <p>
                  Subject to mandatory jurisdictional rules under Swiss law, particularly for consumer contracts, the place of jurisdiction is Lausanne, Switzerland.
                </p>
                <p>
                  For professional clients, companies, self-employed persons or contracts not subject to mandatory jurisdiction, the competent courts are those of Lausanne.
                </p>
              </Article>

              <Article n="17" title="Partial invalidity">
                <p>
                  If any provision of these GTC is declared null, invalid or unenforceable, the remaining provisions remain fully valid.
                </p>
                <p>
                  The affected provision will be replaced by a valid provision as close as possible to the original economic and legal intent.
                </p>
              </Article>

              <Article n="18" title="Applicable version">
                <p>
                  The version of the GTC applicable is the one in force at the time of device drop-off, quote approval or service order.
                </p>
                <p>CLIK CLAK SàRL reserves the right to amend these GTC at any time.</p>
              </Article>

              <Article n="19" id="buyback-conditions" title="Device buyback and trade-in conditions">

                <h3 className="text-sm md:text-base font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>19.1 — Indicative estimate</h3>
                <p>
                  Any estimate provided remotely is indicative and non-binding. It is based on information supplied by the client.
                </p>

                <h3 className="text-sm md:text-base font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>19.2 — Mandatory inspection</h3>
                <p>
                  The final offer is confirmed only after physical inspection of the device by CLIK CLAK SàRL.
                </p>

                <h3 className="text-sm md:text-base font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>19.3 — Modification or refusal</h3>
                <p>
                  CLIK CLAK SàRL reserves the right to modify, refuse or cancel a buyback if the model, capacity, condition, accessories, lock status, ownership or any other information does not match the declared details.
                </p>

                <h3 className="text-sm md:text-base font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>19.4 — Locked device</h3>
                <p>
                  A device linked to an iCloud, Google, Samsung or manufacturer account may be refused until the lock is fully deactivated.
                </p>

                <h3 className="text-sm md:text-base font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>19.5 — Ownership</h3>
                <p>
                  The client warrants that they own the device or are legally authorised to sell it. CLIK CLAK SàRL may refuse any device that appears suspicious, reported lost, stolen or presenting an inconsistency.
                </p>

                <h3 className="text-sm md:text-base font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>19.6 — Personal data</h3>
                <p>
                  The client is responsible for backing up, transferring and deleting their data before any final sale. CLIK CLAK SàRL may assist the client but cannot be held liable for data not backed up or deleted by the client.
                </p>

                <h3 className="text-sm md:text-base font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>19.7 — Payment</h3>
                <p>
                  Payment occurs only after physical inspection of the device, validation of the final offer and acceptance of the buyback conditions.
                </p>

                <h3 className="text-sm md:text-base font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>19.8 — Right to decline the final offer</h3>
                <p>
                  If the final offer differs from the initial estimate, the client may decline the offer. Return or collection arrangements are confirmed on a case-by-case basis.
                </p>

                <h3 className="text-sm md:text-base font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>19.9 — Free shipping</h3>
                <p>
                  Free shipping, if offered, is subject to buyback conditions and prior validation by CLIK CLAK SàRL.
                </p>

              </Article>

              <Article n="20" title="ClikClak automated assistant">
                <p>
                  The website features an automated assistant using artificial intelligence. It is designed to answer general questions about CLIK CLAK SàRL repairs, prices, services and practical information.
                </p>
                <p>
                  The assistant provides indicative assistance. Its responses do not constitute a definitive diagnostic, a binding repair offer, or a commitment regarding price, turnaround, stock or warranty.
                </p>
                <p>
                  Prices, turnaround times, availability and warranties communicated by the assistant must be confirmed directly with CLIK CLAK SàRL before placing any order or dropping off a device.
                </p>
                <p>
                  All assistant responses are automated. They do not constitute a contractual commitment and CLIK CLAK SàRL cannot be held liable for inaccurate, incomplete or unverified information.
                </p>
              </Article>

            </div>
          </div>
        </section>
      </main>

      <SiteFooter locale="en" />
    </>
  )
}

function Article({
  n,
  id,
  title,
  children,
}: {
  n:        string
  id?:      string
  title:    string
  children: React.ReactNode
}) {
  return (
    <article id={id} className="flex flex-col gap-4">
      <h2 className="text-base md:text-lg font-light leading-snug" style={{ color: 'rgba(242,242,242,0.95)' }}>
        <span className="text-accent font-light">Article&nbsp;{n}</span>
        {' — '}
        {title}
      </h2>
      <div
        className="flex flex-col gap-3 text-sm md:text-base font-light [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-5 [&_ul]:list-disc [&_li]:marker:text-accent"
        style={{
          color:      'rgba(242,242,242,0.65)',
          lineHeight: 1.8,
        }}
      >
        {children}
      </div>
    </article>
  )
}
