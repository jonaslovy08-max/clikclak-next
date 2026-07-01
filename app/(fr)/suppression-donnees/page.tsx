/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Suppression de vos données | Clik Clak',
  description: "Comment demander la suppression des données personnelles traitées par l'application Clik Clak Support dans le cadre des échanges privés Instagram.",
  alternates: {
    canonical: `${SITE_URL}/suppression-donnees/`,
    languages: {
      'fr-CH':     `${SITE_URL}/suppression-donnees/`,
      'en-CH':     `${SITE_URL}/en/data-deletion/`,
      'x-default': `${SITE_URL}/suppression-donnees/`,
    },
  },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Suppression de vos données | Clik Clak',
    url: `${SITE_URL}/suppression-donnees/`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function SuppressionDonneesPage() {
  return (
    <>
      <Header />

      <main>
        <section className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10">
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-12">

            {/* ── En-tête ── */}
            <div className="flex flex-col gap-4">
              <h1 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
                Suppression de vos{' '}
                <span className="text-accent">données</span>
              </h1>
              <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
                CLIK CLAK SàRL — 1er juillet 2026
              </p>
              <p
                className="text-sm md:text-base font-light"
                style={{ color: 'rgba(242,242,242,0.65)', lineHeight: 1.8 }}
              >
                Cette page explique comment demander la suppression des données personnelles
                traitées par l'application Clik Clak Support dans le cadre des échanges privés
                avec le compte Instagram professionnel Clik Clak.
              </p>
            </div>

            {/* ── Corps ── */}
            <div className="flex flex-col gap-10">

              <Article n="1" title="Données concernées">
                <p>
                  Dans le cadre de la messagerie Instagram automatisée, les données pouvant être
                  traitées par CLIK CLAK SàRL comprennent notamment&nbsp;:
                </p>
                <ul>
                  <li>l'identifiant technique Instagram de l'expéditeur&nbsp;;</li>
                  <li>l'identifiant technique du message&nbsp;;</li>
                  <li>le contenu des messages adressés à Clik Clak&nbsp;;</li>
                  <li>les informations communiquées sur l'appareil et la réparation recherchée&nbsp;;</li>
                  <li>les données techniques temporaires utilisées pour maintenir le contexte et
                    empêcher les réponses en double.</li>
                </ul>
              </Article>

              <Article n="2" title="Suppression automatique">
                <p>
                  Une partie des données est supprimée automatiquement après expiration des durées
                  techniques suivantes&nbsp;:
                </p>
                <ul>
                  <li>
                    l'historique technique temporaire utile au contexte de conversation expire
                    au plus tard après <strong className="font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>30 minutes</strong>&nbsp;;
                  </li>
                  <li>
                    les identifiants techniques utilisés pour éviter les réponses en double
                    expirent au plus tard après <strong className="font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>24 heures</strong>.
                  </li>
                </ul>
                <p>
                  Ces durées concernent le stockage technique contrôlé par Clik Clak. Elles ne
                  couvrent pas les messages conservés directement dans la boîte de réception
                  Instagram ni les données détenues par Meta.
                </p>
              </Article>

              <Article n="3" title="Demander une suppression">
                <p>
                  Pour demander la suppression de données traitées dans le cadre de la messagerie
                  Clik Clak, une demande peut être envoyée&nbsp;:
                </p>
                <ul>
                  <li>
                    par e-mail à{' '}
                    <a
                      href="mailto:info@clikclak.ch"
                      className="hover:text-accent transition-colors duration-200"
                    >
                      info@clikclak.ch
                    </a>
                    &nbsp;;
                  </li>
                  <li>
                    ou via la{' '}
                    <a
                      href="/contact-clik-clak-lausanne"
                      className="hover:text-accent transition-colors duration-200"
                    >
                      page de contact
                    </a>
                    .
                  </li>
                </ul>
                <p>
                  Utiliser comme objet&nbsp;:{' '}
                  <strong className="font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>
                    Demande de suppression de données Instagram
                  </strong>
                </p>
                <p>
                  Pour permettre l'identification des données concernées, les informations
                  suivantes peuvent être communiquées&nbsp;:
                </p>
                <ul>
                  <li>le nom d'utilisateur Instagram&nbsp;;</li>
                  <li>la date approximative de la conversation&nbsp;;</li>
                  <li>tout élément permettant d'identifier les données visées.</li>
                </ul>
                <p>
                  <strong className="font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>
                    Ne jamais envoyer de mot de passe Instagram, de code de connexion ni de jeton
                    d'accès.
                  </strong>{' '}
                  Ces informations ne sont jamais nécessaires pour traiter une demande de
                  suppression.
                </p>
                <p>
                  CLIK CLAK SàRL peut demander une vérification raisonnable de l'identité avant
                  d'effectuer la suppression.
                </p>
                <p>
                  Seules les données contrôlées par CLIK CLAK SàRL peuvent être supprimées par
                  cette procédure. La suppression de ces données ne supprime pas le compte
                  Instagram de la personne.
                </p>
              </Article>

              <Article n="4" title="Traitement de la demande">
                <p>
                  CLIK CLAK SàRL examinera la demande et supprimera les données concernées qu'elle
                  contrôle, sous réserve des obligations légales de conservation applicables. Une
                  confirmation sera envoyée lorsque la demande aura été traitée.
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
                  <span>Suisse</span>
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

      <SiteFooter />
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
        <span className="text-accent font-light">{n}.</span>
        {' '}
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
