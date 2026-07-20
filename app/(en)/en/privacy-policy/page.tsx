/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Privacy Policy | ClikClak',
  description: 'Information on the collection and use of personal data by ClikClak.',
  alternates: {
    canonical: `${SITE_URL}/en/privacy-policy`,
    languages: {
      'fr-CH':     `${SITE_URL}/politique-confidentialite`,
      'en-CH':     `${SITE_URL}/en/privacy-policy`,
      'x-default': `${SITE_URL}/politique-confidentialite`,
    },
  },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Privacy Policy | ClikClak',
    url: `${SITE_URL}/en/privacy-policy`,
    locale: 'en_CH',
    type: 'website',
  },
}

export default function EnPrivacyPolicyPage() {
  return (
    <>
      <Header locale="en" />

      <main>
        <section className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10">
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-12">

            <div className="flex flex-col gap-4">
              <h1 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
                Privacy{' '}
                <span className="text-accent">policy</span>
              </h1>
              <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
                CLIK CLAK SàRL — Last updated: 1 July 2026
              </p>
            </div>

            <div className="flex flex-col gap-10">

              <Article n="1" title="Data controller">
                <p>The data controller is:</p>
                <address className="not-italic flex flex-col gap-1" style={{ color: 'rgba(242,242,242,0.6)' }}>
                  <span>CLIK CLAK SàRL</span>
                  <span>Rue du Petit-Chêne 9b, 1003 Lausanne</span>
                  <a href="mailto:info@clikclak.ch" className="hover:text-accent transition-colors duration-200">info@clikclak.ch</a>
                </address>
                <p>
                  This policy explains how CLIK CLAK SàRL collects, uses and protects personal data in connection with its website, contact requests, repair, diagnostic and customer service activities.
                </p>
              </Article>

              <Article n="2" title="Data collected">
                <p>CLIK CLAK SàRL may collect the following data when necessary:</p>
                <ul>
                  <li>first and last name;</li>
                  <li>email address;</li>
                  <li>phone number;</li>
                  <li>contact request details;</li>
                  <li>device model;</li>
                  <li>type of repair requested;</li>
                  <li>information required for diagnostic or service tracking;</li>
                  <li>technical browsing data;</li>
                  <li>IP address, browser type, pages visited and anonymised or aggregated statistics.</li>
                </ul>
                <p>
                  CLIK CLAK SàRL never asks for Apple, Google, Samsung or equivalent account passwords. If an unlock code is needed to test a device, it is used solely for the technical purpose of the intervention.
                </p>
              </Article>

              <Article n="3" title="Purposes of processing">
                <p>Data is used solely for the following purposes:</p>
                <ul>
                  <li>responding to contact requests;</li>
                  <li>issuing a quote;</li>
                  <li>organising a repair or diagnostic;</li>
                  <li>client follow-up;</li>
                  <li>managing appointments, requests and communications;</li>
                  <li>improving the website and user experience;</li>
                  <li>ensuring website security;</li>
                  <li>complying with legal obligations;</li>
                  <li>defending CLIK CLAK SàRL's rights and legitimate interests in disputes.</li>
                </ul>
                <p>CLIK CLAK SàRL does not sell clients' personal data.</p>
              </Article>

              <Article n="4" title="Legal basis for processing">
                <p>Data is processed when necessary to:</p>
                <ul>
                  <li>respond to a client request;</li>
                  <li>perform a service or prepare a quote;</li>
                  <li>comply with a legal obligation;</li>
                  <li>protect CLIK CLAK SàRL's legitimate interests, including security, evidence of exchanges, dispute management and service improvement;</li>
                  <li>obtain consent where required.</li>
                </ul>
              </Article>

              <Article n="5" title="Data related to devices handed in">
                <p>
                  In the course of a repair, CLIK CLAK SàRL may handle a device containing personal data.
                </p>
                <p>
                  CLIK CLAK SàRL does not intentionally consult clients' personal content. Tests are limited to the necessary functions: screen, touch, camera, speaker, microphone, charging, network, buttons, sensors or other technical elements.
                </p>
                <p>
                  The client remains solely responsible for backing up their data before any intervention. CLIK CLAK SàRL does not guarantee data preservation during any diagnostic, repair, restore or test operation.
                </p>
              </Article>

              <Article n="6" title="Third-party services">
                <p>
                  The website may use certain technical services from third parties, including:
                </p>
                <ul>
                  <li>Google Maps to display the shop location;</li>
                  <li>Google Analytics for audience measurement and browsing statistics;</li>
                  <li>Google Ads for conversion tracking and, with consent, remarketing;</li>
                  <li>hosting services;</li>
                  <li>security or maintenance services;</li>
                  <li>communication services related to forms or emails.</li>
                </ul>
                <p>
                  These providers may process certain technical data required for the service to function. Their use is subject to prior user consent, except for strictly necessary services.
                </p>
              </Article>

              <Article n="7" title="Google Maps, Analytics and Ads">
                <p>
                  The website integrates Google Maps to display the CLIK CLAK SàRL location. When using the map, certain technical data may be transmitted to Google (IP address, browser, interactions).
                </p>
                <p>
                  The website may use Google Analytics to measure audience, analyse visitor behaviour and improve the site. Data is anonymised or aggregated where possible. Google Analytics is only activated with user consent (Statistics category).
                </p>
                <p>
                  The website may use Google Ads to measure advertising conversions and, with your consent, display personalised advertising. Google Ads is only activated with user consent (Marketing category).
                </p>
                <p>
                  These services are subject to Google's terms of service and privacy policy.
                </p>
              </Article>

              <Article n="8" title="Cookies, consent and preferences">
                <p>The website uses cookies or similar technologies to:</p>
                <ul>
                  <li>ensure the website functions properly (necessary cookies, always active);</li>
                  <li>remember certain preferences and consent choices;</li>
                  <li>measure audience via Google Analytics (with consent);</li>
                  <li>track conversions and personalise advertising via Google Ads (with consent);</li>
                  <li>improve performance and secure browsing.</li>
                </ul>
                <p>
                  On first visit, a banner offers the option to accept, decline or customise non-necessary cookie use. The choice is saved locally and can be changed at any time via the "Cookie settings" link at the bottom of the page.
                </p>
                <p>
                  Users can also configure their browser to block or delete cookies. Some website functions may be affected.
                </p>
              </Article>

              <Article n="9" title="Data retention">
                <p>
                  Data is kept only for as long as necessary for the purposes for which it was collected.
                </p>
                <p>Some data may be retained for longer when necessary to:</p>
                <ul>
                  <li>comply with a legal obligation;</li>
                  <li>prove a service or exchange;</li>
                  <li>manage a warranty;</li>
                  <li>defend CLIK CLAK SàRL's rights in disputes or contestations.</li>
                </ul>
              </Article>

              <Article n="10" title="Data sharing">
                <p>
                  CLIK CLAK SàRL only shares personal data with persons or providers necessary for the proper delivery of its services.
                </p>
                <p>This may include:</p>
                <ul>
                  <li>IT service providers;</li>
                  <li>website hosting provider;</li>
                  <li>messaging services;</li>
                  <li>technical providers;</li>
                  <li>competent authorities when required by law.</li>
                </ul>
                <p>No personal data is sold to third parties.</p>
              </Article>

              <Article n="11" title="Security">
                <p>
                  CLIK CLAK SàRL takes reasonable measures to protect personal data against unauthorised access, loss, alteration, disclosure or misuse.
                </p>
                <p>No IT system can be guaranteed entirely secure.</p>
              </Article>

              <Article n="12" title="Individual rights">
                <p>
                  In accordance with applicable Swiss law, any data subject may request:
                </p>
                <ul>
                  <li>access to their personal data;</li>
                  <li>correction of inaccurate data;</li>
                  <li>deletion of data, where legal conditions are met;</li>
                  <li>restriction of or objection to certain processing;</li>
                  <li>information about the processing of their data.</li>
                </ul>
                <p>
                  Requests may be sent to CLIK CLAK SàRL via the email address indicated on the website.
                </p>
                <p>
                  CLIK CLAK SàRL may request proof of identity before processing a request relating to personal data.
                </p>
              </Article>

              <Article n="13" title="Minors">
                <p>
                  CLIK CLAK SàRL services are not specifically intended for children. Requests concerning a device belonging to a minor must be made by a parent, legal guardian or responsible adult.
                </p>
              </Article>

              <Article n="14" title="Amendments">
                <p>
                  CLIK CLAK SàRL may amend this privacy policy at any time to reflect its practices, website changes or legal requirements.
                </p>
                <p>
                  The applicable version is the one published on the website at the time of consultation.
                </p>
              </Article>

              <Article n="15" title="ClikClak assistant and AI processing">
                <p>
                  The website offers an automated assistant ("ClikClak Bot") designed to answer questions about CLIK CLAK SàRL repairs, services and products.
                </p>
                <p>
                  This assistant uses the Anthropic API. Messages entered in the chat window are transmitted to Anthropic to generate a response. Users must not transmit sensitive data, passwords, PINs, banking details or other confidential information through this assistant.
                </p>
                <p>
                  Anthropic acts as a processing provider under its commercial API. According to Anthropic's policy, content transmitted via the API is not used by default to train models unless the user explicitly opts into a programme for this purpose. For information on Anthropic's data practices, users may consult Anthropic's privacy policy directly.
                </p>
                <p>
                  CLIK CLAK SàRL uses Upstash Redis to prevent abuse and limit excessive use of the assistant. No raw IP address is transmitted to Redis. A pseudonymised technical identifier (irreversibly hashed) is calculated from technical connection data and used as a Redis key. The Redis instance is currently hosted in a European region.
                </p>
                <p>
                  Technical rate-limiting counters are retained for a maximum of 24 hours. In case of repeated detected abuse, a temporary block may be applied for up to one hour. Full conversations are not stored in Redis by CLIK CLAK SàRL.
                </p>
                <p>
                  The assistant does not constitute a contractual commitment. Any information provided by the assistant must be confirmed directly with CLIK CLAK SàRL to be binding.
                </p>
              </Article>

              <Article n="16" title="Local storage and technical site data">
                <p>
                  The website uses browser local storage (<em>localStorage</em>) for the following purposes:
                </p>
                <ul>
                  <li>storing cookie consent preferences (preference key, no fixed expiry);</li>
                  <li>temporary persistence of cart contents (only if the shop is active, key <em>clikclak-cart-v1</em>);</li>
                  <li>no personal identifiers, email addresses or phone numbers are stored in localStorage.</li>
                </ul>
                <p>
                  This data remains on the user's device and is not transmitted to CLIK CLAK SàRL or third parties. It can be deleted at any time from browser settings.
                </p>
              </Article>

              <Article n="17" title="Automated Instagram messaging">
                <p>
                  CLIK CLAK SàRL uses an application connected to Meta's Instagram API to
                  receive and reply to private messages sent to the Clik Clak professional
                  account.
                </p>
                <p>
                  When a person contacts Clik Clak on Instagram, the data required to process
                  the conversation may include:
                </p>
                <ul>
                  <li>the sender's technical Instagram identifier;</li>
                  <li>the technical message identifier;</li>
                  <li>the message content;</li>
                  <li>information provided about the device and the requested repair.</li>
                </ul>
                <p>
                  This data is used solely to understand the request, retrieve available
                  information or prices from Clik Clak's data, and send a reply to the customer.
                </p>
                <p>
                  A limited history containing only information useful to the conversation may
                  be stored temporarily for up to 30 minutes in order to maintain context
                  between messages.
                </p>
                <p>
                  Technical identifiers used to prevent duplicate replies may be retained for
                  up to 24 hours.
                </p>
                <p>
                  Messages are transmitted through Meta's services. Temporary technical storage
                  is provided through Upstash Redis to maintain context and prevent duplicate
                  processing.
                </p>
                <p>CLIK CLAK SàRL does not sell this data and does not use it for targeted advertising.</p>
                <p>
                  A person may request information, access to, or deletion of their personal
                  data using the contact details provided in the Contact section.{' '}
                  <a
                    href="/en/data-deletion"
                    className="hover:text-accent transition-colors duration-200 underline underline-offset-2"
                  >
                    Request deletion of my data
                  </a>
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
  title,
  children,
}: {
  n:        string
  title:    string
  children: React.ReactNode
}) {
  return (
    <article className="flex flex-col gap-4">
      <h2 className="text-base md:text-lg font-light leading-snug" style={{ color: 'rgba(242,242,242,0.95)' }}>
        <span className="text-accent font-light">Article&nbsp;{n}</span>
        {' — '}
        {title}
      </h2>
      <div
        className="flex flex-col gap-3 text-sm md:text-base font-light [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-5 [&_ul]:list-disc [&_li]:marker:text-accent"
        style={{ color: 'rgba(242,242,242,0.65)', lineHeight: 1.8 }}
      >
        {children}
      </div>
    </article>
  )
}
