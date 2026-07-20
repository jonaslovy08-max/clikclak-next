/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Politique de confidentialité | ClikClak',
  description: "Informations sur la collecte et l'utilisation des données personnelles par ClikClak.",
  alternates: {
    canonical: `${SITE_URL}/politique-confidentialite`,
  },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Politique de confidentialité | ClikClak',
    url: `${SITE_URL}/politique-confidentialite`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function PolitiqueConfidentialitePage() {
  return (
    <>
      <Header />

      <main>
        <section className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10">
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-12">

            {/* ── En-tête ── */}
            <div className="flex flex-col gap-4">
              <h1 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
                Politique de{' '}
                <span className="text-accent">confidentialité</span>
              </h1>
              <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
                CLIK CLAK SàRL — Dernière mise à jour : 1er juillet 2026
              </p>
            </div>

            {/* ── Corps ── */}
            <div className="flex flex-col gap-10">

              <Article n="1" title="Responsable du traitement">
                <p>Le responsable du traitement des données personnelles est :</p>
                <address className="not-italic flex flex-col gap-1" style={{ color: 'rgba(242,242,242,0.6)' }}>
                  <span>CLIK CLAK SàRL</span>
                  <span>Rue du Petit-Chêne 9b, 1003 Lausanne</span>
                  <a href="mailto:info@clikclak.ch" className="hover:text-accent transition-colors duration-200">info@clikclak.ch</a>
                </address>
                <p>
                  La présente politique explique comment CLIK CLAK SàRL collecte, utilise et protège
                  les données personnelles dans le cadre de son site internet, de ses demandes de
                  contact, de ses prestations de réparation, de diagnostic et de service client.
                </p>
              </Article>

              <Article n="2" title="Données collectées">
                <p>CLIK CLAK SàRL peut collecter les données suivantes lorsque cela est nécessaire :</p>
                <ul>
                  <li>nom et prénom ;</li>
                  <li>adresse email ;</li>
                  <li>numéro de téléphone ;</li>
                  <li>informations liées à une demande de contact ;</li>
                  <li>modèle d'appareil concerné ;</li>
                  <li>type de réparation demandée ;</li>
                  <li>informations nécessaires au diagnostic ou au suivi d'une prestation ;</li>
                  <li>données techniques liées à la navigation sur le site ;</li>
                  <li>adresse IP, type de navigateur, pages consultées et données statistiques anonymisées ou agrégées.</li>
                </ul>
                <p>
                  CLIK CLAK SàRL ne demande jamais les mots de passe de comptes Apple, Google,
                  Samsung ou équivalents. Si un code de déverrouillage est nécessaire pour tester un
                  appareil, il est utilisé uniquement dans le cadre technique de l'intervention.
                </p>
              </Article>

              <Article n="3" title="Finalités du traitement">
                <p>Les données sont utilisées uniquement dans les buts suivants :</p>
                <ul>
                  <li>répondre aux demandes de contact ;</li>
                  <li>établir un devis ;</li>
                  <li>organiser une réparation ou un diagnostic ;</li>
                  <li>assurer le suivi client ;</li>
                  <li>gérer les rendez-vous, demandes et communications ;</li>
                  <li>améliorer le site internet et l'expérience utilisateur ;</li>
                  <li>assurer la sécurité du site ;</li>
                  <li>respecter les obligations légales ;</li>
                  <li>défendre les droits et intérêts légitimes de CLIK CLAK SàRL en cas de litige.</li>
                </ul>
                <p>CLIK CLAK SàRL ne vend pas les données personnelles de ses clients.</p>
              </Article>

              <Article n="4" title="Base du traitement">
                <p>Les données sont traitées lorsque cela est nécessaire pour :</p>
                <ul>
                  <li>répondre à une demande du client ;</li>
                  <li>exécuter une prestation ou préparer un devis ;</li>
                  <li>respecter une obligation légale ;</li>
                  <li>protéger les intérêts légitimes de CLIK CLAK SàRL, notamment la sécurité, la preuve des échanges, la gestion des litiges et l'amélioration de ses services ;</li>
                  <li>obtenir un consentement lorsque celui-ci est requis.</li>
                </ul>
              </Article>

              <Article n="5" title="Données liées aux appareils confiés">
                <p>
                  Dans le cadre d'une réparation, CLIK CLAK SàRL peut être amenée à manipuler un
                  appareil contenant des données personnelles.
                </p>
                <p>
                  CLIK CLAK SàRL n'a pas vocation à consulter les contenus personnels du client. Les
                  tests réalisés se limitent aux fonctions nécessaires : écran, tactile, caméra,
                  haut-parleur, micro, charge, réseau, boutons, capteurs ou autres éléments techniques.
                </p>
                <p>
                  Le client reste seul responsable de la sauvegarde de ses données avant toute
                  intervention. CLIK CLAK SàRL ne garantit pas la conservation des données pendant
                  une opération de diagnostic, réparation, restauration ou test.
                </p>
              </Article>

              <Article n="6" title="Services tiers">
                <p>
                  Le site peut utiliser certains services techniques fournis par des tiers, notamment :
                </p>
                <ul>
                  <li>Google Maps pour afficher l'emplacement de la boutique ;</li>
                  <li>Google Analytics pour la mesure d'audience et les statistiques de navigation ;</li>
                  <li>Google Ads pour le suivi des conversions publicitaires et, avec votre consentement, le remarketing ;</li>
                  <li>services d'hébergement ;</li>
                  <li>services de sécurité ou de maintenance ;</li>
                  <li>services de communication liés aux formulaires ou emails.</li>
                </ul>
                <p>
                  Ces prestataires peuvent traiter certaines données techniques nécessaires au
                  fonctionnement du service. Leur utilisation est soumise au consentement préalable
                  de l'utilisateur, sauf pour les services strictement nécessaires.
                </p>
              </Article>

              <Article n="7" title="Google Maps, Analytics et Ads">
                <p>
                  Le site intègre Google Maps pour afficher l'emplacement de CLIK CLAK SàRL. Lors de
                  l'utilisation de la carte, certaines données techniques peuvent être transmises à
                  Google (adresse IP, navigateur, interactions).
                </p>
                <p>
                  Le site peut utiliser Google Analytics pour mesurer l'audience, analyser le comportement
                  des visiteurs et améliorer le site. Ces données sont anonymisées ou agrégées dans la
                  mesure du possible. Google Analytics n'est activé qu'avec le consentement de
                  l'utilisateur (catégorie Statistiques).
                </p>
                <p>
                  Le site peut utiliser Google Ads pour mesurer les conversions publicitaires et, avec
                  votre accord, diffuser des publicités personnalisées. Google Ads n'est activé qu'avec
                  le consentement de l'utilisateur (catégorie Marketing).
                </p>
                <p>
                  Ces services sont soumis aux conditions d'utilisation et à la politique de
                  confidentialité de Google.
                </p>
              </Article>

              <Article n="8" title="Cookies, consentement et préférences">
                <p>Le site utilise des cookies ou technologies similaires pour :</p>
                <ul>
                  <li>assurer le bon fonctionnement du site (cookies nécessaires, toujours actifs) ;</li>
                  <li>mémoriser certaines préférences et le choix de consentement ;</li>
                  <li>mesurer l'audience via Google Analytics (avec consentement) ;</li>
                  <li>suivre les conversions et personnaliser les publicités via Google Ads (avec consentement) ;</li>
                  <li>améliorer les performances et sécuriser la navigation.</li>
                </ul>
                <p>
                  Lors de la première visite, une bannière propose d'accepter, refuser ou personnaliser
                  l'utilisation des cookies non nécessaires. Le choix est enregistré localement et peut
                  être modifié à tout moment via le lien «&nbsp;Gestion des cookies&nbsp;» en bas de page.
                </p>
                <p>
                  L'utilisateur peut également configurer son navigateur pour bloquer ou supprimer les
                  cookies. Certaines fonctions du site peuvent être affectées.
                </p>
              </Article>

              <Article n="9" title="Conservation des données">
                <p>
                  Les données sont conservées uniquement pendant la durée nécessaire aux finalités
                  pour lesquelles elles ont été collectées.
                </p>
                <p>
                  Certaines données peuvent être conservées plus longtemps lorsque cela est nécessaire
                  pour :
                </p>
                <ul>
                  <li>respecter une obligation légale ;</li>
                  <li>prouver une prestation ou un échange ;</li>
                  <li>gérer une garantie ;</li>
                  <li>défendre les droits de CLIK CLAK SàRL en cas de contestation ou litige.</li>
                </ul>
              </Article>

              <Article n="10" title="Transmission des données">
                <p>
                  CLIK CLAK SàRL ne transmet les données personnelles qu'aux personnes ou prestataires
                  nécessaires à la bonne exécution de ses services.
                </p>
                <p>Cela peut inclure :</p>
                <ul>
                  <li>prestataires informatiques ;</li>
                  <li>hébergeur du site ;</li>
                  <li>services de messagerie ;</li>
                  <li>prestataires techniques ;</li>
                  <li>autorités compétentes lorsque la loi l'exige.</li>
                </ul>
                <p>Aucune donnée personnelle n'est vendue à des tiers.</p>
              </Article>

              <Article n="11" title="Sécurité">
                <p>
                  CLIK CLAK SàRL prend des mesures raisonnables pour protéger les données personnelles
                  contre l'accès non autorisé, la perte, l'altération, la divulgation ou l'utilisation
                  abusive.
                </p>
                <p>Aucun système informatique ne peut toutefois être garanti comme totalement sécurisé.</p>
              </Article>

              <Article n="12" title="Droits des personnes concernées">
                <p>
                  Conformément au droit suisse applicable, toute personne concernée peut demander :
                </p>
                <ul>
                  <li>l'accès à ses données personnelles ;</li>
                  <li>la rectification de données inexactes ;</li>
                  <li>la suppression de données, lorsque les conditions légales sont réunies ;</li>
                  <li>la limitation ou l'opposition à certains traitements ;</li>
                  <li>des informations sur le traitement de ses données.</li>
                </ul>
                <p>
                  Les demandes peuvent être adressées à CLIK CLAK SàRL via l'adresse email indiquée
                  sur le site.
                </p>
                <p>
                  CLIK CLAK SàRL peut demander une preuve d'identité avant de traiter une demande
                  liée aux données personnelles.
                </p>
              </Article>

              <Article n="13" title="Données des mineurs">
                <p>
                  Les services de CLIK CLAK SàRL ne sont pas destinés spécifiquement aux enfants. Les
                  demandes concernant un appareil appartenant à un mineur doivent être effectuées par
                  un parent, représentant légal ou adulte responsable.
                </p>
              </Article>

              <Article n="14" title="Modifications">
                <p>
                  CLIK CLAK SàRL peut modifier la présente politique de confidentialité à tout moment
                  afin de l'adapter à ses pratiques, à l'évolution du site ou aux obligations légales.
                </p>
                <p>
                  La version applicable est celle publiée sur le site au moment de la consultation.
                </p>
              </Article>

              <Article n="15" title="Assistant ClikClak et traitement IA">
                <p>
                  Le site propose un assistant automatisé («&nbsp;ClikClak Bot&nbsp;») destiné à
                  répondre aux questions liées aux réparations, services et produits de CLIK CLAK SàRL.
                </p>
                <p>
                  Cet assistant utilise l'API Anthropic. Les messages saisis dans la fenêtre de chat
                  sont transmis à Anthropic afin de produire une réponse. L'utilisateur ne doit pas
                  transmettre via cet assistant de données sensibles, de mots de passe, de codes PIN,
                  de données bancaires ou de tout autre information à caractère confidentiel.
                </p>
                <p>
                  Anthropic agit en qualité de prestataire de traitement dans le cadre de son API
                  commerciale. Selon la politique d'Anthropic, les contenus transmis via l'API ne sont
                  pas utilisés par défaut pour entraîner les modèles, sauf participation explicite à un
                  programme prévu à cet effet. Pour toute information sur les pratiques d'Anthropic en
                  matière de données, l'utilisateur peut consulter la politique de confidentialité
                  d'Anthropic directement.
                </p>
                <p>
                  CLIK CLAK SàRL utilise Upstash Redis pour prévenir les abus et limiter l'utilisation
                  excessive de l'assistant. Aucune adresse IP brute n'est transmise à Redis. Un
                  identifiant technique pseudonymisé (hashé de manière irréversible) est calculé à
                  partir de données techniques de connexion et utilisé comme clé Redis. L'instance Redis
                  utilisée est actuellement hébergée dans une région européenne.
                </p>
                <p>
                  Les compteurs techniques de limitation sont conservés jusqu'à 24&nbsp;heures au maximum.
                  En cas d'abus répété détecté, un blocage temporaire peut être appliqué et peut durer
                  jusqu'à une&nbsp;heure. Les conversations complètes ne sont pas enregistrées dans Redis
                  par CLIK CLAK SàRL.
                </p>
                <p>
                  L'assistant ne constitue pas un engagement contractuel. Toute information fournie par
                  l'assistant doit être confirmée directement auprès de CLIK CLAK SàRL pour être
                  opposable.
                </p>
              </Article>

              <Article n="16" title="Stockage local et données techniques du site">
                <p>
                  Le site utilise le stockage local du navigateur (<em>localStorage</em>) pour les
                  usages suivants&nbsp;:
                </p>
                <ul>
                  <li>mémorisation du choix de consentement aux cookies (clé de préférence, sans date d'expiration fixe) ;</li>
                  <li>persistance temporaire du contenu du panier (uniquement si la boutique est active, clé <em>clikclak-cart-v1</em>) ;</li>
                  <li>aucun identifiant personnel, aucun email, aucun numéro de téléphone n'est stocké dans localStorage.</li>
                </ul>
                <p>
                  Ces données restent sur l'appareil de l'utilisateur et ne sont pas transmises à CLIK
                  CLAK SàRL ni à des tiers. Elles peuvent être supprimées à tout moment depuis les
                  paramètres du navigateur.
                </p>
              </Article>

              <Article n="17" title="Messagerie Instagram automatisée">
                <p>
                  CLIK CLAK SàRL utilise une application reliée à l'API Instagram de Meta afin
                  de recevoir et de répondre aux messages privés adressés au compte
                  professionnel Clik Clak.
                </p>
                <p>
                  Lorsqu'une personne contacte Clik Clak sur Instagram, les données nécessaires
                  au traitement de la conversation peuvent comprendre&nbsp;:
                </p>
                <ul>
                  <li>l'identifiant technique Instagram de l'expéditeur&nbsp;;</li>
                  <li>l'identifiant technique du message&nbsp;;</li>
                  <li>le contenu du message&nbsp;;</li>
                  <li>les informations communiquées au sujet de l'appareil et de la réparation recherchée.</li>
                </ul>
                <p>
                  Ces données sont utilisées uniquement pour comprendre la demande, rechercher
                  les informations ou tarifs disponibles dans les données Clik Clak et envoyer
                  une réponse au client.
                </p>
                <p>
                  Un historique limité aux informations utiles à la conversation peut être
                  conservé temporairement pendant une durée maximale de 30 minutes afin de
                  maintenir le contexte entre plusieurs messages.
                </p>
                <p>
                  Les identifiants techniques utilisés pour prévenir les réponses en double
                  peuvent être conservés pendant une durée maximale de 24 heures.
                </p>
                <p>
                  Les échanges transitent par les services de Meta. Un stockage technique
                  temporaire est assuré au moyen d'Upstash Redis pour maintenir le contexte et
                  prévenir les doublons.
                </p>
                <p>CLIK CLAK SàRL ne vend pas ces données et ne les utilise pas à des fins de publicité ciblée.</p>
                <p>
                  Une personne peut demander des informations, l'accès ou la suppression des
                  données la concernant en utilisant les coordonnées indiquées dans la section
                  Contact.{' '}
                  <a
                    href="/suppression-donnees"
                    className="hover:text-accent transition-colors duration-200 underline underline-offset-2"
                  >
                    Demander la suppression de mes données
                  </a>
                </p>
              </Article>

              <Article n="18" title="Contact">
                <p>
                  Pour toute question relative à la protection des données, le client peut contacter
                  CLIK CLAK SàRL via les coordonnées indiquées sur le site.
                </p>
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
      <h2 className="text-base md:text-lg font-light leading-snug" style={{ color: 'rgba(242,242,242,0.95)' }}>
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
