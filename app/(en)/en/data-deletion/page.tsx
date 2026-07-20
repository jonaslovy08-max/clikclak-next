/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import { SITE_URL } from '@/lib/seo'
import { getDataDeletionByCode } from '@/lib/meta/instagram/dataDeletion'

export const metadata: Metadata = {
  title: 'Deletion of your data | Clik Clak',
  description: 'How to request the deletion of personal data processed by the Clik Clak Support application in connection with private Instagram exchanges.',
  alternates: {
    canonical: `${SITE_URL}/en/data-deletion`,
    languages: {
      'fr-CH':     `${SITE_URL}/suppression-donnees`,
      'en-CH':     `${SITE_URL}/en/data-deletion`,
      'x-default': `${SITE_URL}/suppression-donnees`,
    },
  },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Deletion of your data | Clik Clak',
    url: `${SITE_URL}/en/data-deletion`,
    locale: 'en_CH',
    type: 'website',
  },
}

const CONFIRMATION_CODE_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('en-CH', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso))
  } catch { return '—' }
}

const STATUS_LABEL: Record<string, string> = {
  processing: 'Processing',
  completed:  'Deletion confirmed',
  failed:     'Processing error',
}
const STATUS_COLOR: Record<string, string> = {
  processing: 'rgba(251,191,36,0.8)',
  completed:  'rgba(74,222,128,0.8)',
  failed:     'rgba(248,113,113,0.8)',
}

export default async function DataDeletionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp   = await searchParams
  const code = typeof sp.confirmation === 'string' ? sp.confirmation : null

  let confirmationStatus: Awaited<ReturnType<typeof getDataDeletionByCode>> = null
  if (code && CONFIRMATION_CODE_RE.test(code)) {
    try { confirmationStatus = await getDataDeletionByCode(code) } catch { /* silent */ }
  }

  return (
    <>
      <Header locale="en" />

      <main>
        <section className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10">
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-12">

            {/* ── Header ── */}
            <div className="flex flex-col gap-4">
              <h1 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
                Deletion of your{' '}
                <span className="text-accent">data</span>
              </h1>
              <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
                CLIK CLAK SàRL — 1 July 2026
              </p>
              <p
                className="text-sm md:text-base font-light"
                style={{ color: 'rgba(242,242,242,0.65)', lineHeight: 1.8 }}
              >
                This page explains how to request the deletion of personal data processed by the
                Clik Clak Support application in connection with private exchanges with the Clik Clak
                professional Instagram account.
              </p>
            </div>

            {/* ── Deletion status (if confirmation code provided) ── */}
            {code && (
              <div
                className="p-5 rounded-card border"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <h2 className="text-base font-light mb-4" style={{ color: 'rgba(242,242,242,0.9)' }}>
                  Request status
                </h2>
                {confirmationStatus ? (
                  <dl className="flex flex-col gap-3 text-sm font-light">
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-xs uppercase tracking-wider" style={{ color: 'rgba(242,242,242,0.35)' }}>Confirmation code</dt>
                      <dd className="font-mono text-xs" style={{ color: 'rgba(242,242,242,0.6)' }}>{confirmationStatus.confirmation_code}</dd>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-xs uppercase tracking-wider" style={{ color: 'rgba(242,242,242,0.35)' }}>Status</dt>
                      <dd style={{ color: STATUS_COLOR[confirmationStatus.status] ?? 'rgba(242,242,242,0.7)' }}>
                        {STATUS_LABEL[confirmationStatus.status] ?? confirmationStatus.status}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-xs uppercase tracking-wider" style={{ color: 'rgba(242,242,242,0.35)' }}>Request date</dt>
                      <dd style={{ color: 'rgba(242,242,242,0.65)' }}>{formatDate(confirmationStatus.requested_at)}</dd>
                    </div>
                    {confirmationStatus.completed_at && (
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-xs uppercase tracking-wider" style={{ color: 'rgba(242,242,242,0.35)' }}>Deletion completed</dt>
                        <dd style={{ color: 'rgba(242,242,242,0.65)' }}>{formatDate(confirmationStatus.completed_at)}</dd>
                      </div>
                    )}
                  </dl>
                ) : (
                  <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.5)' }}>
                    This confirmation code was not found or has expired.
                  </p>
                )}
              </div>
            )}

            {/* ── Body ── */}
            <div className="flex flex-col gap-10">

              <Article n="1" title="Data concerned and purpose">
                <p>
                  In the context of the automated Instagram messaging service, the data that may
                  be processed by CLIK CLAK SàRL includes in particular:
                </p>
                <ul>
                  <li>the sender's technical Instagram identifier;</li>
                  <li>the technical message identifier;</li>
                  <li>the content of messages sent to Clik Clak;</li>
                  <li>information provided about the device and the requested repair;</li>
                  <li>temporary technical data used to maintain conversation context and prevent
                    duplicate replies.</li>
                </ul>
                <p>
                  This data is used <strong className="font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>
                    solely for customer support and pricing assistance
                  </strong>. It is not sold and is not used for advertising or profiling.
                  It may be processed by Meta and by the technical service providers solely to
                  the extent necessary for the operation, security and hosting of the service.
                </p>
              </Article>

              <Article n="2" title="Retention periods and automatic deletion">
                <p>
                  Messaging data is retained for the following periods:
                </p>
                <ul>
                  <li>
                    <strong className="font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>inbox messages</strong> are excluded
                    from display as soon as they reach their expiration date, set{' '}
                    <strong className="font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>30 days</strong> after they are recorded. They are permanently
                    deleted during the next cleanup operation, triggered by normal service
                    operations and by a scheduled task;
                  </li>
                  <li>
                    the temporary technical history used to maintain conversation context expires
                    after at most{' '}
                    <strong className="font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>30 minutes</strong>;
                  </li>
                  <li>
                    technical identifiers used to prevent duplicate replies expire after at
                    most{' '}
                    <strong className="font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>24 hours</strong>.
                  </li>
                </ul>
                <p>
                  These periods apply to technical storage controlled by Clik Clak. They do not
                  cover messages retained directly in the Instagram inbox or data held by Meta.
                </p>
                <p>
                  Upon a deletion request: deleting a participant's data removes their conversations
                  and all associated messages retained by Clik Clak, as well as the technical Redis
                  context.
                </p>
              </Article>

              <Article n="3" title="Requesting deletion">
                <p>
                  To request the deletion of data processed through the Clik Clak Instagram
                  messaging service, a request can be sent:
                </p>
                <ul>
                  <li>
                    by email to{' '}
                    <a
                      href="mailto:info@clikclak.ch"
                      className="hover:text-accent transition-colors duration-200"
                    >
                      info@clikclak.ch
                    </a>
                    ;
                  </li>
                  <li>
                    or via the{' '}
                    <a
                      href="/en/contact"
                      className="hover:text-accent transition-colors duration-200"
                    >
                      contact page
                    </a>
                    .
                  </li>
                </ul>
                <p>
                  Please use the subject line:{' '}
                  <strong className="font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>
                    Instagram data deletion request
                  </strong>
                </p>
                <p>
                  To help identify the data concerned, the following information may be provided:
                </p>
                <ul>
                  <li>Instagram username;</li>
                  <li>approximate date of the conversation;</li>
                  <li>any details that help identify the data in question.</li>
                </ul>
                <p>
                  <strong className="font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>
                    Never send your Instagram password, login code or access token.
                  </strong>{' '}
                  This information is never required to process a deletion request.
                </p>
                <p>
                  CLIK CLAK SàRL may request reasonable verification of identity before carrying
                  out the deletion.
                </p>
                <p>
                  Only data controlled by CLIK CLAK SàRL can be deleted through this procedure.
                  Deleting this data does not delete the person's Instagram account.
                </p>
              </Article>

              <Article n="4" title="Processing the request">
                <p>
                  CLIK CLAK SàRL will review the request and delete the relevant data it controls,
                  subject to any applicable legal retention obligations. A confirmation will be sent
                  once the request has been processed.
                </p>
              </Article>

              <Article n="5" title="Contact">
                <address
                  className="not-italic flex flex-col gap-1"
                  style={{ color: 'rgba(242,242,242,0.6)' }}
                >
                  <span>CLIK CLAK SàRL</span>
                  <span>Rue du Petit-Chêne 9B</span>
                  <span>1003 Lausanne</span>
                  <span>Switzerland</span>
                  <a
                    href="mailto:info@clikclak.ch"
                    className="hover:text-accent transition-colors duration-200"
                  >
                    info@clikclak.ch
                  </a>
                </address>
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
      <h2
        className="text-base md:text-lg font-light leading-snug"
        style={{ color: 'rgba(242,242,242,0.95)' }}
      >
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
