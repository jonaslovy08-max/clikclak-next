import type { Metadata } from 'next'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import RelatedBlogPosts from '@/components/blog/RelatedBlogPosts'
import ContactPopover from '@/components/home/ContactPopover'
import DataRecoveryFAQ from '@/components/recovery/DataRecoveryFAQ'
import { DATA_RECOVERY_FAQ_ITEMS } from '@/components/recovery/dataRecoveryFaqItems'
import ServiceJsonLd from '@/components/seo/ServiceJsonLd'
import { SITE_URL } from '@/lib/seo'

const SERVICE_NAME = 'Récupération de données Lausanne — ClikClak'
const DESCRIPTION =
  'Récupération de données à Lausanne sur iPhone, smartphone Android, MacBook, PC, disque dur, SSD, clé USB, carte SD, RAID et supports endommagés. Diagnostic, devis clair et transfert sécurisé.'
const CANONICAL = `${SITE_URL}/services/recuperation-donnees`

export const metadata: Metadata = {
  title: 'Récupération de données Lausanne | Smartphone, disque dur, SSD, Mac & PC | ClikClak',
  description: DESCRIPTION,
  alternates: {
    canonical: CANONICAL,
  },
  openGraph: {
    title: SERVICE_NAME,
    description:
      'Récupération de données à Lausanne sur iPhone, Android, MacBook, PC, disque dur, SSD, RAID et supports endommagés.',
    url: CANONICAL,
    locale: 'fr_CH',
    type: 'website',
  },
}


function PriceRow({ label, price }: { label: string; price: string }) {
  const isText = !price.includes('CHF') && price !== 'Sur devis'
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

/* ════════════════════════════════════════════════════════════════════════════
   Page
════════════════════════════════════════════════════════════════════════════ */
export default function RecuperationDonneesPage() {
  return (
    <>
      <ServiceJsonLd
        name={SERVICE_NAME}
        description={DESCRIPTION}
        url={CANONICAL}
        serviceType="Récupération de données"
        locale="fr"
        faqItems={DATA_RECOVERY_FAQ_ITEMS}
      />
      <Header />

      <main>

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-20 border-t border-white/10"
          aria-label="Récupération de données à Lausanne"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-center">

            {/* ── Texte ── */}
            <div className="flex-1 flex flex-col gap-6">
              <h1 className="text-[2rem] md:text-[2.75rem] font-light leading-tight">
                Récupération de{' '}
                <span className="text-accent">données</span>{' '}
                à Lausanne
              </h1>
              {/* Image mobile */}
              <div className="block md:hidden -mx-6 w-screen overflow-hidden">
                <Image
                  src="/assets/images/homepage/service-sections/data-recovery-mobile.webp"
                  alt="Récupération de données ClikClak Lausanne"
                  width={0} height={0} sizes="100vw"
                  className="w-full h-auto"
                />
              </div>
              <p
                className="font-light leading-relaxed max-w-2xl"
                style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', color: 'rgba(242,242,242,0.65)' }}
              >
                Photos, contacts, documents, messages, fichiers professionnels ou souvenirs personnels :
                ClikClak analyse votre appareil ou support de stockage afin d&apos;estimer les chances
                de récupération et vous proposer une intervention adaptée.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <ContactPopover />
                <a
                  href="#transfert-donnees"
                  className="inline-flex items-center gap-2 text-sm font-light px-5 py-2.5 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                  style={{ border: '1px solid rgba(242,242,242,0.2)', color: 'rgba(242,242,242,0.75)' }}
                >
                  Transférer mes données
                </a>
              </div>
            </div>

            {/* ── Image desktop ── */}
            <div className="hidden md:block w-[45%] shrink-0 rounded-xl overflow-hidden">
              <Image
                src="/assets/images/homepage/service-sections/data-recovery.webp"
                alt="Récupération de données ClikClak Lausanne"
                width={0} height={0} sizes="45vw"
                className="w-full h-auto"
              />
            </div>

          </div>
        </section>

        {/* ══ INTRODUCTION ══════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Introduction récupération de données"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight max-w-2xl">
              Vos données sont souvent plus importantes{' '}
              <span className="text-accent">que l&apos;appareil</span>
            </h2>

            <p
              className="font-light leading-relaxed max-w-2xl"
              style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.6)' }}
            >
              Un smartphone qui ne s&apos;allume plus, un MacBook bloqué, un disque dur qui claque,
              un SSD non reconnu ou une carte SD illisible peuvent contenir des données essentielles.
              ClikClak prend en charge l&apos;analyse de votre support à Lausanne et vous indique
              les solutions possibles avant toute intervention.
            </p>

            <p
              className="text-sm font-light leading-relaxed"
              style={{ color: 'rgba(242,242,242,0.45)', borderLeft: '2px solid rgba(204,255,51,0.4)', paddingLeft: 16 }}
            >
              Les chances de récupération dépendent de l&apos;état du support, du type de panne,
              du chiffrement, des dégâts physiques et des manipulations déjà effectuées.
            </p>

          </div>
        </section>

        {/* ══ CE QUE NOUS RÉCUPÉRONS ════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Types de données récupérables"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Quels types de données pouvons-nous{' '}
              <span className="text-accent">récupérer ?</span>
            </h2>

            <div className="flex flex-wrap gap-3">
              {[
                'Photos et vidéos',
                'Contacts',
                'Messages',
                'Documents',
                'Fichiers professionnels',
                'Données d\'applications',
                'Sauvegardes',
                'Dossiers utilisateurs Mac / PC',
                'Données sur disque dur',
                'Données sur SSD',
                'Clé USB',
                'Carte SD',
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
              Certaines données peuvent être inaccessibles selon le chiffrement, le système,
              le modèle de l&apos;appareil ou l&apos;état du support.
            </p>

          </div>
        </section>

        {/* ══ SERVICES ══════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Services de récupération de données"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Nos <span className="text-accent">interventions</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* BLOC 1 — Smartphone */}
              <ServiceCard title="Récupération de données sur smartphone et iPhone">
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.6)' }}>
                  Nous intervenons sur les iPhone et smartphones Android qui ne s&apos;allument plus,
                  ont subi un choc, un contact liquide, une panne électronique ou un problème de carte mère.
                </p>
                <ul className="flex flex-col gap-1.5">
                  {[
                    'Appareil qui ne démarre plus',
                    'Écran inutilisable',
                    'Carte mère endommagée',
                    'Oxydation',
                    'Choc ou chute',
                    'Connecteur endommagé',
                    'Code ou accès problématique selon le cas',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm font-light" style={{ color: 'rgba(242,242,242,0.65)' }}>
                      <span style={{ color: '#ccff33', flexShrink: 0 }}>—</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col">
                  <PriceRow label="Extraction avancée de données"          price="CHF 490" />
                  <PriceRow label="Problème électronique complexe"         price="CHF 690" />
                  <PriceRow label="Dégâts liés aux chocs ou liquides"      price="CHF 690" />
                  <PriceRow label="Réparation carte mère / intervention avancée" price="CHF 1490" />
                  <PriceRow label="Code oublié ou perdu"                   price="de CHF 390 à CHF 3000" />
                </div>
                <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.35)' }}>
                  Les interventions liées à un code oublié ou à un appareil verrouillé nécessitent
                  une preuve de propriété. La récupération dépend du modèle, du système, du chiffrement
                  et de l&apos;état de l&apos;appareil.
                </p>
              </ServiceCard>

              {/* BLOC 2 — MacBook & PC */}
              <ServiceCard title="Récupération sur MacBook, Surface et PC portable">
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.6)' }}>
                  Nous analysons les ordinateurs qui ne démarrent plus, présentent un défaut mémoire,
                  une panne de carte mère ou un problème de stockage interne.
                </p>
                <div className="flex flex-col">
                  <PriceRow label="Problème de mémoire vive / RAM"          price="CHF 590" />
                  <PriceRow label="Réparation de carte mère PC / Mac"        price="CHF 1190" />
                  <PriceRow label="Récupération de données Mac / PC"         price="Sur devis" />
                  <PriceRow label="Transfert vers nouveau Mac / PC"          price="Sur devis" />
                </div>
              </ServiceCard>

              {/* BLOC 3 — HDD */}
              <ServiceCard title="Récupération de données sur disque dur HDD">
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.6)' }}>
                  Nous traitons les disques durs reconnus mais inaccessibles, les pannes électroniques
                  et les pannes mécaniques. En cas de bruit anormal, ne plus alimenter le disque avant diagnostic.
                </p>

                <div className="flex flex-col gap-3">
                  <p className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.5)' }}>Problèmes logiques — support reconnu mais inaccessible, partition corrompue</p>
                  <div className="flex flex-col">
                    <PriceRow label="USB, SD, disque dur CMR"                     price="CHF 190" />
                    <PriceRow label="Disque dur SMR, WD / Seagate dès 2019"       price="CHF 290" />
                  </div>
                  <p className="text-xs font-light mt-2" style={{ color: 'rgba(242,242,242,0.5)' }}>Pannes électroniques</p>
                  <div className="flex flex-col">
                    <PriceRow label="HDD CMR"  price="CHF 390" />
                    <PriceRow label="HDD SMR"  price="CHF 490" />
                  </div>
                  <p className="text-xs font-light mt-2" style={{ color: 'rgba(242,242,242,0.5)' }}>Pannes mécaniques</p>
                  <div className="flex flex-col">
                    <PriceRow label="500 GB"                                         price="CHF 990" />
                    <PriceRow label="1 TB"                                           price="CHF 1090" />
                    <PriceRow label="2 TB"                                           price="CHF 1190" />
                    <PriceRow label="+CHF 100 par TB supplémentaire jusqu'à 22 TB"  price="" />
                    <PriceRow label="Supplément disque SMR crypté / verrouillé"     price="+CHF 200" />
                  </div>
                </div>
              </ServiceCard>

              {/* BLOC 4 — SSD & flash */}
              <ServiceCard title="Récupération sur SSD, NVMe, clé USB, carte SD et MicroSD">
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.6)' }}>
                  Les supports flash peuvent présenter des pannes de contrôleur, de mémoire NAND,
                  de firmware ou des corruptions logiques.
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
                  <p className="text-xs font-light mt-2" style={{ color: 'rgba(242,242,242,0.5)' }}>Clé USB, carte SD & MicroSD</p>
                  <div className="flex flex-col">
                    <PriceRow label="8 GB à 16 GB"             price="CHF 490" />
                    <PriceRow label="32 GB à 64 GB"            price="CHF 590" />
                    <PriceRow label="128 GB à 512 GB"          price="dès CHF 690" />
                    <PriceRow label="Recherche de pinout complexe" price="+CHF 200" />
                  </div>
                </div>
              </ServiceCard>

              {/* BLOC 5 — RAID */}
              <ServiceCard title="RAID, NAS et ransomware">
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.6)' }}>
                  Pour les systèmes RAID, NAS ou les cas de ransomware, l&apos;analyse dépend du nombre
                  de disques, de la configuration, de l&apos;ordre des volumes et du niveau de chiffrement.
                  Ne pas réinitialiser, reconstruire, reformater ou modifier la configuration RAID avant diagnostic.
                </p>
                <div className="flex flex-col">
                  <PriceRow label="Traitement ransomware / RAID logique 0+1" price="CHF 450 / disque" />
                </div>
              </ServiceCard>

            </div>
          </div>
        </section>

        {/* ══ TRANSFERT DE DONNÉES ══════════════════════════════════════════ */}
        <section
          id="transfert-donnees"
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Transfert de données"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Transfert de données vers un{' '}
              <span className="text-accent">nouvel appareil</span>
            </h2>

            <p
              className="font-light leading-relaxed max-w-2xl"
              style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.6)' }}
            >
              ClikClak propose aussi le transfert de données lorsque votre appareil fonctionne encore
              ou lorsqu&apos;une récupération partielle est possible.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Transfert iPhone vers iPhone',
                'Transfert Android vers Android',
                'Transfert Android vers iPhone',
                'Transfert iPhone vers Android',
                'Transfert smartphone vers ordinateur',
                'Transfert Mac vers Mac',
                'Transfert PC vers PC',
                'Sauvegarde vers disque externe',
                'Transfert de photos, contacts, documents et fichiers',
                'Aide iCloud, Google Drive, Google Photos ou WhatsApp',
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
              <PriceRow label="Transfert simple smartphone"    price="Sur devis" />
              <PriceRow label="Transfert complet smartphone"   price="Sur devis" />
              <PriceRow label="Transfert Mac / PC"             price="Sur devis" />
              <PriceRow label="Sauvegarde vers disque externe" price="Sur devis" />
            </div>

            <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
              Le transfert dépend de l&apos;état de l&apos;appareil source, du système, de l&apos;espace
              disponible, des accès fournis par le client et des services utilisés.
            </p>

            <div>
              <ContactPopover />
            </div>

          </div>
        </section>

        {/* ══ PROCESSUS ═════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Comment ça se passe"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Comment ça se <span className="text-accent">passe ?</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  num: '01',
                  title: 'Diagnostic',
                  text: "Nous analysons l'appareil ou le support pour identifier le type de panne.",
                },
                {
                  num: '02',
                  title: 'Estimation',
                  text: 'Nous indiquons les possibilités de récupération et le tarif applicable ou une fourchette selon le cas.',
                },
                {
                  num: '03',
                  title: 'Intervention',
                  text: 'Après validation, l\'intervention est réalisée avec les précautions nécessaires.',
                },
                {
                  num: '04',
                  title: 'Restitution',
                  text: 'Les données récupérées sont restituées sur un support adapté ou transférées vers un nouvel appareil.',
                },
              ].map(step => (
                <div
                  key={step.num}
                  className="flex flex-col gap-4 p-6 rounded-xl"
                  style={{ border: '1px solid rgba(242,242,242,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                >
                  <span className="text-3xl font-light" style={{ color: 'rgba(204,255,51,0.5)' }}>
                    {step.num}
                  </span>
                  <p className="text-base font-light" style={{ color: '#ededed' }}>{step.title}</p>
                  <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.55)' }}>
                    {step.text}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
              Aucune intervention complexe n&apos;est lancée sans validation du client.
            </p>

          </div>
        </section>

        {/* ══ CONFIDENTIALITÉ ═══════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Confidentialité et sécurité des données"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 max-w-2xl">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Confidentialité et{' '}
              <span className="text-accent">sécurité des données</span>
            </h2>

            <p className="font-light leading-relaxed" style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.6)' }}>
              Les données confiées à ClikClak sont traitées uniquement dans le cadre de l&apos;intervention
              demandée. Nous n&apos;avons pas vocation à consulter vos contenus personnels.
            </p>

            <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.5)' }}>
              Certains contrôles techniques peuvent toutefois nécessiter de vérifier que les fichiers
              récupérés sont lisibles.
            </p>

            <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.5)' }}>
              Pour les appareils verrouillés ou les demandes sensibles, une preuve de propriété peut
              être demandée. ClikClak prend des mesures raisonnables pour protéger les données pendant
              l&apos;intervention.
            </p>

          </div>
        </section>

        {/* ══ À FAIRE / À ÉVITER ════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Bons réflexes avant diagnostic"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Les bons réflexes{' '}
              <span className="text-accent">avant diagnostic</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div
                className="flex flex-col gap-4 p-6 rounded-xl"
                style={{ border: '1px solid rgba(204,255,51,0.2)', backgroundColor: 'rgba(204,255,51,0.025)' }}
              >
                <p className="text-sm font-light" style={{ color: '#ccff33' }}>À faire</p>
                <ul className="flex flex-col gap-2">
                  {[
                    'Éteindre l\'appareil si possible',
                    'Ne plus utiliser le support',
                    'Ne pas tenter plusieurs redémarrages',
                    'Ne pas recharger un smartphone oxydé',
                    'Conserver le disque ou l\'appareil dans son état actuel',
                    'Nous contacter rapidement',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm font-light" style={{ color: 'rgba(242,242,242,0.75)' }}>
                      <span style={{ color: '#ccff33', flexShrink: 0 }}>+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="flex flex-col gap-4 p-6 rounded-xl"
                style={{ border: '1px solid rgba(242,242,242,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
              >
                <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.45)' }}>À éviter</p>
                <ul className="flex flex-col gap-2">
                  {[
                    'Formater le support',
                    'Réinstaller le système',
                    'Lancer des logiciels de récupération au hasard',
                    'Ouvrir un disque dur soi-même',
                    'Alimenter un disque qui claque',
                    'Chauffer ou sécher un appareil mouillé au sèche-cheveux',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm font-light" style={{ color: 'rgba(242,242,242,0.55)' }}>
                      <span style={{ color: 'rgba(242,242,242,0.3)', flexShrink: 0 }}>×</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* ══ CTA FINAL ═════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Demander un diagnostic de récupération de données"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 text-center">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight max-w-xl">
              Besoin de récupérer ou{' '}
              <span className="text-accent">transférer vos données ?</span>
            </h2>

            <p
              className="font-light leading-relaxed max-w-xl"
              style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.6)' }}
            >
              Déposez votre appareil ou support chez ClikClak à Lausanne pour une première analyse.
              Un diagnostic peut être nécessaire avant confirmation du prix et des chances de récupération.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-4">
              <ContactPopover />
              <a
                href="#transfert-donnees"
                className="inline-flex items-center gap-2 text-sm font-light px-5 py-2.5 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                style={{ border: '1px solid rgba(242,242,242,0.2)', color: 'rgba(242,242,242,0.75)' }}
              >
                Transférer mes données
              </a>
            </div>

          </div>
        </section>

      </main>

      <DataRecoveryFAQ />
      <RelatedBlogPosts postSlugs={['telephone-tombe-dans-l-eau', 'connaitre-modele-iphone']} />
      <SiteFooter />
      <SectionPinning />
    </>
  )
}
