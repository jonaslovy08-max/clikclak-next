/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Conditions générales de vente — Clik Clak Repair',
  description: 'Conditions générales de vente et de réparation de Clik Clak SàRL, Lausanne.',
  alternates: {
    canonical: `${SITE_URL}/cgv/`,
  },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Conditions générales de vente — Clik Clak Repair',
    url: `${SITE_URL}/cgv/`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function CgvPage() {
  return (
    <>
      <Header />

      <main>
        <section className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10">
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-12">

            {/* ── En-tête ── */}
            <div className="flex flex-col gap-4">
              <h1 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
                Conditions générales de{' '}
                <span className="text-accent">vente et de réparation</span>
              </h1>
              <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
                CLIK CLAK SàRL — Dernière mise à jour : à compléter
              </p>
            </div>

            {/* ── Corps ── */}
            <div className="flex flex-col gap-10" style={{ color: 'rgba(242,242,242,0.75)', lineHeight: 1.75 }}>

              <Article n="1" title="Champ d'application">
                <p>
                  Les présentes Conditions Générales de Vente et de Réparation («&nbsp;CGV&nbsp;»)
                  régissent toutes les prestations de diagnostic, réparation, remplacement de pièces,
                  récupération de données, vente d'accessoires et prestations associées réalisées par
                  CLIK CLAK SàRL.
                </p>
                <p>
                  Toute remise d'un appareil, validation d'un devis, prise de rendez-vous, commande
                  ou acceptation d'une intervention vaut acceptation pleine et entière des présentes CGV.
                </p>
                <p>
                  CLIK CLAK SàRL intervient exclusivement sur demande du Client et selon les
                  informations fournies par celui-ci.
                </p>
              </Article>

              <Article n="2" title="Devis, diagnostic et acceptation">
                <p>
                  Les prix communiqués sur le site, en boutique, par téléphone, email ou message sont
                  indicatifs jusqu'à inspection de l'appareil.
                </p>
                <p>
                  Un devis peut être établi après diagnostic. Le Client reste libre de l'accepter ou
                  de le refuser.
                </p>
                <p>Un forfait de diagnostic de CHF&nbsp;40.– est dû si&nbsp;:</p>
                <ul>
                  <li>le Client refuse le devis après diagnostic&nbsp;;</li>
                  <li>l'appareil est déclaré irréparable&nbsp;;</li>
                  <li>le Client renonce à l'intervention après ouverture ou analyse technique&nbsp;;</li>
                  <li>aucune réparation économiquement raisonnable n'est possible.</li>
                </ul>
                <p>
                  Ce forfait peut être déduit du prix final si la réparation est acceptée, sauf
                  indication contraire.
                </p>
              </Article>

              <Article n="3" title="Prix et paiement">
                <p>Les prix sont indiqués en francs suisses, sauf indication contraire.</p>
                <p>
                  Le paiement est exigible au plus tard lors de la restitution de l'appareil.
                  CLIK CLAK SàRL se réserve le droit de retenir l'appareil jusqu'au paiement intégral
                  des montants dus.
                </p>
                <p>
                  Les pièces remplacées, défectueuses ou retirées deviennent la propriété de CLIK CLAK
                  SàRL, sauf demande expresse du Client avant l'intervention.
                </p>
              </Article>

              <Article n="4" title="Responsabilité des données">
                <p>
                  Le Client est seul responsable de la sauvegarde complète de ses données avant toute
                  intervention.
                </p>
                <p>
                  CLIK CLAK SàRL n'est tenue à aucune obligation de sauvegarde, conservation,
                  restauration ou transfert de données, sauf prestation spécifique expressément convenue
                  par écrit.
                </p>
                <p>
                  CLIK CLAK SàRL décline toute responsabilité en cas de perte, suppression, corruption,
                  altération ou impossibilité d'accès aux données, notamment photos, vidéos, messages,
                  contacts, applications, fichiers, comptes, réglages ou contenus personnels.
                </p>
                <p>
                  Le Client reconnaît qu'une intervention technique peut nécessiter l'allumage, le
                  redémarrage, la réinitialisation ou le test de l'appareil, ce qui peut entraîner des
                  risques pour les données.
                </p>
              </Article>

              <Article n="5" title="Codes, comptes et accès">
                <p>
                  Pour certains tests, le Client peut être amené à fournir un code de déverrouillage
                  ou à désactiver certaines sécurités, notamment iCloud, Localiser mon iPhone, compte
                  Google, Samsung Account ou tout système équivalent.
                </p>
                <p>
                  Si le Client refuse de fournir les accès nécessaires, certains tests ne pourront pas
                  être réalisés et la garantie pourra être limitée aux seuls éléments vérifiables.
                </p>
                <p>
                  CLIK CLAK SàRL s'engage à ne pas consulter volontairement les contenus personnels du
                  Client. Toutefois, le Client reconnaît que certains éléments peuvent être brièvement
                  visibles lors des tests fonctionnels.
                </p>
              </Article>

              <Article n="6" title="Garantie des réparations">
                <p>Sauf indication contraire écrite, les réparations bénéficient des garanties suivantes&nbsp;:</p>
                <ul>
                  <li>Pièces originales ou d'origine constructeur&nbsp;: garantie de 24&nbsp;mois.</li>
                  <li>Pièces compatibles, génériques ou reconditionnées&nbsp;: garantie de 3&nbsp;mois.</li>
                  <li>
                    Réparations liées à l'oxydation, liquide, carte mère, micro-soudure ou récupération
                    de données&nbsp;: aucune garantie de durée de fonctionnement, sauf accord écrit spécifique.
                  </li>
                </ul>
                <p>
                  La garantie couvre uniquement le défaut de fabrication ou de fonctionnement de la pièce
                  remplacée, dans des conditions normales d'utilisation.
                </p>
                <p>La garantie ne couvre pas&nbsp;:</p>
                <ul>
                  <li>les dommages consécutifs à une chute, un choc, une pression, une torsion ou un écrasement&nbsp;;</li>
                  <li>la casse de vitre, écran, dalle OLED/LCD ou châssis&nbsp;;</li>
                  <li>les lignes verticales ou horizontales, taches noires, pixels morts, écran noir ou absence d'affichage consécutifs à un traumatisme physique&nbsp;;</li>
                  <li>l'oxydation, l'humidité, le contact liquide ou la corrosion&nbsp;;</li>
                  <li>les dommages causés par chaleur, froid, incendie, surtension, chargeur défectueux ou batterie gonflée&nbsp;;</li>
                  <li>les interventions, ouvertures, tentatives de réparation ou modifications effectuées par le Client ou un tiers&nbsp;;</li>
                  <li>les défauts liés à un dommage préexistant, caché ou non visible lors du diagnostic&nbsp;;</li>
                  <li>les défauts logiciels, mises à jour, blocages de compte, restrictions constructeur ou incompatibilités système.</li>
                </ul>
                <p>
                  Toute intervention par un tiers ou ouverture non autorisée de l'appareil entraîne
                  la fin immédiate de la garantie CLIK CLAK SàRL.
                </p>
              </Article>

              <Article n="7" title="Étanchéité et résistance à l'eau">
                <p>
                  Le Client reconnaît que l'ouverture d'un appareil peut altérer ou supprimer son
                  étanchéité ou sa résistance à l'eau, même si de nouveaux joints sont posés.
                </p>
                <p>
                  CLIK CLAK SàRL ne garantit aucune étanchéité après intervention, y compris sur les
                  appareils initialement annoncés comme résistants à l'eau par le constructeur.
                </p>
              </Article>

              <Article n="8" title="Face ID, Touch ID, True Tone et fonctions constructeur">
                <p>
                  Le Client est informé que certaines fonctions, notamment Face ID, Touch ID, True Tone,
                  reconnaissance biométrique, messages système, capteurs ou calibrations, peuvent être
                  liées logiciellement ou matériellement à la carte mère et aux composants d'origine.
                </p>
                <p>
                  CLIK CLAK SàRL ne peut garantir le maintien ou la restauration de ces fonctions
                  lorsque leur fonctionnement dépend de restrictions imposées par le constructeur,
                  d'un dommage antérieur, d'un composant propriétaire ou d'un verrouillage logiciel.
                </p>
                <p>
                  Sauf faute prouvée de CLIK CLAK SàRL, aucune indemnité ne sera due pour la perte
                  ou la limitation de ces fonctions.
                </p>
              </Article>

              <Article n="9" title="Risques liés aux appareils endommagés">
                <p>
                  Le Client reconnaît qu'un appareil ayant subi un choc, une chute, une torsion, un
                  écrasement, une oxydation ou une réparation antérieure peut présenter des dommages
                  internes invisibles.
                </p>
                <p>
                  Lors du démontage, de l'ouverture, du chauffage, du débranchement ou du remplacement
                  de pièces, ces dommages peuvent se révéler ou s'aggraver.
                </p>
                <p>CLIK CLAK SàRL décline toute responsabilité en cas de panne totale ou partielle résultant d'un dommage préexistant, notamment&nbsp;:</p>
                <ul>
                  <li>carte mère fissurée&nbsp;;</li>
                  <li>court-circuit&nbsp;;</li>
                  <li>surchauffe&nbsp;;</li>
                  <li>batterie instable ou gonflée&nbsp;;</li>
                  <li>nappe fragilisée&nbsp;;</li>
                  <li>connecteur endommagé&nbsp;;</li>
                  <li>oxydation interne&nbsp;;</li>
                  <li>défaut apparu après ouverture mais lié à l'état initial de l'appareil.</li>
                </ul>
              </Article>

              <Article n="10" title="Oxydation et contact liquide">
                <p>
                  En cas de contact liquide ou d'oxydation, l'objectif principal de l'intervention est,
                  lorsque possible, la récupération de données ou la remise en fonctionnement temporaire.
                </p>
                <p>
                  Aucune garantie de durée de vie, stabilité, performance ou absence de panne future
                  n'est donnée après une désoxydation.
                </p>
                <p>
                  Le Client reconnaît qu'un appareil oxydé peut cesser de fonctionner à tout moment,
                  même après une intervention réussie.
                </p>
              </Article>

              <Article n="11" title="Délais">
                <p>
                  Les délais communiqués sont indicatifs et peuvent varier selon la disponibilité des
                  pièces, la complexité de l'intervention, l'état réel de l'appareil ou les délais des
                  fournisseurs.
                </p>
                <p>
                  Sauf accord écrit contraire, le délai maximal indicatif est de 30&nbsp;jours ouvrables,
                  hors pénurie de pièces, force majeure, cas complexe, oxydation, carte mère ou
                  récupération de données.
                </p>
                <p>
                  Aucun dédommagement ne sera dû en cas de retard raisonnable ou indépendant de la
                  volonté de CLIK CLAK SàRL.
                </p>
              </Article>

              <Article n="12" title="Appareils non réclamés">
                <p>
                  Le Client est tenu de récupérer son appareil dès qu'il est informé de sa mise à
                  disposition par SMS, appel, email ou tout autre moyen de contact fourni.
                </p>
                <p>
                  Si l'appareil n'est pas récupéré dans un délai de 90&nbsp;jours après notification,
                  CLIK CLAK SàRL pourra facturer des frais de stockage et de dossier.
                </p>
                <p>
                  Après rappel resté sans effet, et dans les limites prévues par le droit suisse,
                  CLIK CLAK SàRL pourra prendre les mesures nécessaires concernant l'appareil non
                  réclamé, notamment conservation, recyclage, destruction, valorisation ou réalisation,
                  afin de couvrir les frais dus.
                </p>
                <p>
                  CLIK CLAK SàRL se réserve également le droit de rétention sur l'appareil jusqu'au
                  paiement intégral des montants dus, conformément aux dispositions applicables du
                  droit suisse.
                </p>
              </Article>

              <Article n="13" title="Limitation de responsabilité">
                <p>
                  Dans les limites autorisées par le droit suisse, la responsabilité de CLIK CLAK SàRL
                  est limitée aux dommages directs, prouvés et exclusivement imputables à une faute de
                  CLIK CLAK SàRL.
                </p>
                <p>Toute responsabilité pour dommages indirects ou consécutifs est exclue, notamment&nbsp;:</p>
                <ul>
                  <li>perte de données&nbsp;;</li>
                  <li>perte de chiffre d'affaires&nbsp;;</li>
                  <li>perte de bénéfice&nbsp;;</li>
                  <li>perte d'exploitation&nbsp;;</li>
                  <li>perte de chance&nbsp;;</li>
                  <li>immobilisation de l'appareil&nbsp;;</li>
                  <li>impossibilité d'utiliser des applications, comptes ou services&nbsp;;</li>
                  <li>frais de remplacement non validés préalablement par CLIK CLAK SàRL.</li>
                </ul>
                <p>
                  En cas de responsabilité directe établie, l'indemnisation maximale sera limitée, au
                  choix de CLIK CLAK SàRL, à&nbsp;:
                </p>
                <ul>
                  <li>la réparation de l'appareil&nbsp;;</li>
                  <li>le remboursement du prix payé pour l'intervention concernée&nbsp;;</li>
                  <li>le remplacement par un appareil reconditionné équivalent en état, capacité et génération comparables.</li>
                </ul>
                <p>
                  Le Client devra alors remettre l'appareil concerné à CLIK CLAK SàRL et désactiver
                  tous comptes, verrouillages et protections liés à celui-ci.
                </p>
                <p>
                  La présente limitation ne s'applique pas en cas de dol ou faute grave de CLIK CLAK
                  SàRL, conformément au droit impératif suisse.
                </p>
              </Article>

              <Article n="14" title="Garantie constructeur">
                <p>
                  Le Client reconnaît que toute intervention non réalisée par le constructeur ou un
                  centre agréé peut entraîner la perte totale ou partielle de la garantie constructeur,
                  notamment Apple, Samsung, Huawei, OPPO, Sony ou toute autre marque.
                </p>
                <p>
                  CLIK CLAK SàRL ne peut être tenue responsable de la perte d'une garantie constructeur
                  consécutive à une intervention demandée par le Client.
                </p>
              </Article>

              <Article n="15" title="Pièces compatibles et messages système">
                <p>
                  Le Client reconnaît que l'utilisation de pièces compatibles, génériques ou
                  reconditionnées peut entraîner l'apparition de messages système, alertes de pièce
                  inconnue, restrictions logicielles ou différences d'affichage, luminosité, couleur,
                  autonomie ou sensibilité tactile.
                </p>
                <p>
                  Ces éléments ne constituent pas nécessairement un défaut de réparation s'ils résultent
                  de restrictions constructeur ou de la nature de la pièce choisie.
                </p>
              </Article>

              <Article n="16" title="Droit applicable et for">
                <p>Les présentes CGV sont soumises au droit suisse.</p>
                <p>
                  Sous réserve des fors impératifs prévus par le droit suisse, notamment en matière de
                  contrats conclus avec des consommateurs, le for juridique est Lausanne, Suisse.
                </p>
                <p>
                  Pour les Clients professionnels, sociétés, indépendants ou contrats non soumis à un
                  for impératif, les tribunaux compétents sont ceux de Lausanne.
                </p>
              </Article>

              <Article n="17" title="Nullité partielle">
                <p>
                  Si une disposition des présentes CGV devait être déclarée nulle, invalide ou
                  inapplicable, les autres dispositions demeurent pleinement valables.
                </p>
                <p>
                  La disposition concernée sera remplacée par une disposition valable se rapprochant
                  autant que possible de l'objectif économique et juridique initial.
                </p>
              </Article>

              <Article n="18" title="Version applicable">
                <p>
                  La version des CGV applicable est celle en vigueur au moment de la remise de l'appareil,
                  de la validation du devis ou de la commande de la prestation.
                </p>
                <p>CLIK CLAK SàRL se réserve le droit de modifier les présentes CGV à tout moment.</p>
              </Article>

              <Article n="19" id="conditions-reprise" title="Conditions de reprise et de rachat d'appareils">

                <h3 className="text-sm md:text-base font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>19.1 — Estimation indicative</h3>
                <p>
                  Toute estimation transmise à distance est indicative et non contractuelle.
                  Elle repose sur les informations fournies par le client.
                </p>

                <h3 className="text-sm md:text-base font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>19.2 — Contrôle obligatoire</h3>
                <p>
                  L'offre finale est confirmée uniquement après contrôle physique de l'appareil
                  par CLIK CLAK SàRL.
                </p>

                <h3 className="text-sm md:text-base font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>19.3 — Modification ou refus</h3>
                <p>
                  CLIK CLAK SàRL se réserve le droit de modifier, refuser ou annuler une reprise si
                  le modèle, la capacité, l'état, les accessoires, le verrouillage, la propriété ou
                  toute autre information ne correspond pas aux éléments déclarés.
                </p>

                <h3 className="text-sm md:text-base font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>19.4 — Appareil verrouillé</h3>
                <p>
                  Un appareil lié à un compte iCloud, Google, Samsung ou constructeur peut être
                  refusé jusqu'à désactivation complète du verrouillage.
                </p>

                <h3 className="text-sm md:text-base font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>19.5 — Propriété</h3>
                <p>
                  Le client garantit être propriétaire de l'appareil ou légalement autorisé à le
                  vendre. CLIK CLAK SàRL peut refuser tout appareil douteux, déclaré perdu, volé
                  ou présentant une incohérence.
                </p>

                <h3 className="text-sm md:text-base font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>19.6 — Données personnelles</h3>
                <p>
                  Le client est responsable de la sauvegarde, du transfert et de la suppression de
                  ses données avant toute vente définitive. CLIK CLAK SàRL peut accompagner le
                  client, mais ne peut être tenue responsable des données non sauvegardées ou non
                  supprimées par le client.
                </p>

                <h3 className="text-sm md:text-base font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>19.7 — Paiement</h3>
                <p>
                  Le paiement intervient uniquement après contrôle de l'appareil, validation de
                  l'offre finale et acceptation des conditions de reprise.
                </p>

                <h3 className="text-sm md:text-base font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>19.8 — Droit de refus de l'offre finale</h3>
                <p>
                  Si l'offre finale diffère de l'estimation initiale, le client peut refuser
                  l'offre. Les modalités de retour ou de récupération de l'appareil sont alors
                  confirmées au cas par cas.
                </p>

                <h3 className="text-sm md:text-base font-normal" style={{ color: 'rgba(242,242,242,0.85)' }}>19.9 — Envoi gratuit</h3>
                <p>
                  L'envoi gratuit, s'il est proposé, est soumis aux conditions de reprise et à
                  validation préalable de CLIK CLAK SàRL.
                </p>

              </Article>

              <Article n="20" title="Assistant ClikClak automatisé">
                <p>
                  Le site propose un assistant automatisé utilisant l'intelligence artificielle. Il
                  est conçu pour répondre aux questions générales liées aux réparations, tarifs,
                  services et informations pratiques de CLIK CLAK SàRL.
                </p>
                <p>
                  L'assistant fournit une aide indicative. Ses réponses ne constituent pas un
                  diagnostic définitif, une offre de réparation contractuelle, ni un engagement de
                  prix, de délai, de stock ou de garantie.
                </p>
                <p>
                  Les prix, délais, disponibilités et garanties communiqués par l'assistant doivent
                  être confirmés directement auprès de CLIK CLAK SàRL avant toute commande ou remise
                  d'appareil.
                </p>
                <p>
                  Toute réponse de l'assistant est automatisée. Elle ne constitue pas un engagement
                  contractuel et ne saurait engager la responsabilité de CLIK CLAK SàRL pour des
                  informations inexactes, incomplètes ou non vérifiées.
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

/* ── Composant article — numéro lime + titre + corps ─────────────────────── */
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
