import type { Metadata } from 'next'
import Image from 'next/image'
import { SITE_URL } from '@/lib/seo'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import RelatedBlogPosts from '@/components/blog/RelatedBlogPosts'
import ContactPopover from '@/components/home/ContactPopover'
import { Button } from '@/components/ui/Button'
import FAQAccordion, { type FaqItem } from '@/components/repair/FAQAccordion'
import ServiceRequestForm from '@/components/contact/ServiceRequestForm'

export const metadata: Metadata = {
  title: 'Dépannage 7/7 Lausanne | Smartphone, tablette & ordinateur | ClikClak',
  description:
    'Besoin d\'un dépannage 7/7 à Lausanne ? ClikClak vous accompagne pour smartphone, tablette, ordinateur, configuration, transfert de données, diagnostic et panne urgente selon disponibilité.',
  alternates: {
    canonical: `${SITE_URL}/services/depannage-reparation-domicile`,
  },
  openGraph: {
    title: 'Dépannage 7/7 Lausanne — ClikClak',
    description: 'Dépannage 7/7 à Lausanne : diagnostic, configuration, transfert de données, accompagnement technique selon disponibilité.',
    url: `${SITE_URL}/services/depannage-reparation-domicile`,
    locale: 'fr_CH',
    type: 'website',
  },
}

const BESOINS = [
  'Smartphone qui ne fonctionne plus correctement',
  'Tablette bloquée ou lente',
  'Ordinateur lent ou instable',
  'Problème de configuration',
  'Transfert de données entre appareils',
  'Sauvegarde de vos données',
  'Aide iCloud, Google ou comptes en ligne',
  'Installation et réglages',
  'Diagnostic avant réparation',
  'Récupération de données selon le cas',
]

const INCLUS = [
  'Diagnostic sur place',
  'Aide à l\'utilisation et accompagnement',
  'Réglages et configuration',
  'Sauvegarde ou transfert de données',
  'Préparation de l\'appareil avant réparation',
  'Accompagnement pour identifier la panne',
  'Conseil : réparation, récupération, remplacement ou dépôt en boutique',
]

const STEPS = [
  { num: '01', title: 'Contact', text: 'Appelez-nous ou envoyez votre demande en décrivant le problème.' },
  { num: '02', title: 'Évaluation', text: 'Nous confirmons si un déplacement est pertinent ou si un dépôt en atelier est préférable.' },
  { num: '03', title: 'Intervention', text: 'Dépannage, diagnostic, configuration ou accompagnement sur place selon le besoin.' },
  { num: '04', title: 'Suite', text: 'Si l\'appareil nécessite une réparation en atelier, nous organisons la suite de la prise en charge.' },
]

const FAQ: FaqItem[] = [
  {
    q: 'Intervenez-vous réellement à domicile ?',
    a: 'Oui, selon la disponibilité et le type de demande. Certaines interventions comme le diagnostic, le transfert de données ou la configuration se font très bien sur place. D\'autres nécessitent un dépôt en atelier.',
  },
  {
    q: 'Quelles pannes peuvent être traitées sur place ?',
    a: 'Les problèmes logiciels, de configuration, de compte, de transfert de données, de ralentissement ou de diagnostic général peuvent souvent être traités à domicile. Les pannes matérielles (écran, batterie, connecteur) nécessitent généralement un passage en atelier.',
  },
  {
    q: 'Est-ce que toutes les réparations peuvent se faire à domicile ?',
    a: 'Non. Les interventions nécessitant un démontage complet, un remplacement de pièce ou des équipements spécialisés se font uniquement en atelier. Le dépannage à domicile couvre l\'assistance, le diagnostic et les interventions légères.',
  },
  {
    q: 'Puis-je demander un transfert de données à domicile ?',
    a: 'Oui. Le transfert de données est l\'un des services qui se prête bien à une intervention à domicile. Nous pouvons vous accompagner pour sauvegarder ou migrer vos données entre appareils.',
  },
  {
    q: 'Intervenez-vous hors de Lausanne ?',
    a: 'Intervention possible à Lausanne et en Suisse romande selon la disponibilité et le type de demande. Contactez-nous pour confirmer selon votre localité.',
  },
  {
    q: 'Dois-je préparer quelque chose avant votre venue ?',
    a: 'Ayez l\'appareil chargé et à portée. Si un code de déverrouillage est nécessaire pour le diagnostic, préparez-le. Évitez de communiquer vos mots de passe Apple, Google ou Samsung par message.',
  },
  {
    q: 'Que se passe-t-il si la panne nécessite l\'atelier ?',
    a: 'Nous vous orientons vers la boutique de Lausanne ou proposons le service de coursier pour organiser la collecte de votre appareil si vous ne pouvez pas vous déplacer.',
  },
]

export default function DepannageDomicilePage() {
  return (
    <>
      <Header />

      <main>

        {/* ══ HERO ════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-20 border-t border-white/10"
          aria-label="Dépannage 7/7 à Lausanne"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-center">

            {/* ── Texte ── */}
            <div className="flex-1 flex flex-col gap-6">
              <div>
                <span
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-light"
                  style={{ border: '1px solid rgba(204,255,51,0.4)', backgroundColor: 'rgba(204,255,51,0.06)', color: '#ccff33' }}
                >
                  Dépannage 7/7
                </span>
              </div>
              <h1 className="text-[2rem] md:text-[2.75rem] font-light leading-tight">
                Dépannage 7/7{' '}
                <span className="text-accent">à Lausanne</span>
              </h1>
              {/* Image mobile — après le H1 */}
              <div className="block md:hidden -mx-6 w-screen overflow-hidden">
                <Image
                  src="/assets/images/homepage/service-sections/depannage-7-7-mobile.webp"
                  alt="Dépannage 7/7 ClikClak pour smartphone, tablette et ordinateur"
                  width={0} height={0} sizes="100vw"
                  className="w-full h-auto"
                />
              </div>
              <p
                className="font-light leading-relaxed max-w-2xl"
                style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', color: 'rgba(242,242,242,0.65)' }}
              >
                Un problème avec votre smartphone, tablette ou ordinateur ? ClikClak vous accompagne 7/7 pour les demandes de dépannage, diagnostic, configuration, transfert de données ou assistance technique, selon disponibilité et type d&apos;intervention.
              </p>
              <p
                className="text-sm font-light leading-relaxed max-w-xl pl-4"
                style={{ color: 'rgba(242,242,242,0.45)', borderLeft: '2px solid rgba(204,255,51,0.3)' }}
              >
                Les interventions sont proposées selon disponibilité, zone d&apos;intervention, type de demande et faisabilité technique.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button href="#demande-depannage" size="lg">
                  Demander un dépannage
                </Button>
                <Button href="tel:+41213204477" variant="secondary" size="lg">
                  Appeler ClikClak
                </Button>
              </div>
            </div>

            {/* ── Image desktop ── */}
            <div className="hidden md:block w-[45%] shrink-0 rounded-xl overflow-hidden">
              <Image
                src="/assets/images/homepage/service-sections/depannage-7-7.webp"
                alt="Dépannage 7/7 ClikClak pour smartphone, tablette et ordinateur"
                width={0} height={0} sizes="45vw"
                className="w-full h-auto"
              />
            </div>

          </div>
        </section>

        {/* ══ POUR QUELS BESOINS ══════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Pour quels besoins"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Pour quels{' '}
              <span className="text-accent">besoins ?</span>
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BESOINS.map(item => (
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

        {/* ══ CE QUE PEUT INCLURE ════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Ce que le dépannage peut inclure"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Ce que le dépannage peut{' '}
              <span className="text-accent">inclure</span>
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INCLUS.map(item => (
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
              Certaines réparations nécessitent un passage en atelier, notamment les interventions carte mère, écrans complexes, oxydation avancée, récupération de données complexe ou démontage approfondi.
            </p>
          </div>
        </section>

        {/* ══ COMMENT ÇA SE PASSE ════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Comment se passe le dépannage à domicile"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Comment ça{' '}
              <span className="text-accent">se passe ?</span>
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

        {/* ══ ZONE + TARIFS ══════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Zone d'intervention et tarifs"
        >
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-4">
              <h2 className="text-[1.5rem] md:text-[1.75rem] font-light leading-tight">
                Zone d&apos;<span className="text-accent">intervention</span>
              </h2>
              <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.65)' }}>
                Lausanne et Suisse romande selon disponibilité et type de demande. Contactez-nous pour confirmer selon votre localité et votre besoin.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-[1.5rem] md:text-[1.75rem] font-light leading-tight">
                <span className="text-accent">Tarifs</span>
              </h2>
              <div className="flex flex-col">
                {[
                  'Diagnostic / dépannage à domicile : sur devis',
                  'Intervention selon durée, distance et complexité : sur devis',
                  'Réparation matérielle (atelier) : sur devis selon modèle',
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
          aria-label="Questions fréquentes dépannage domicile"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Questions{' '}
              <span className="text-accent">fréquentes</span>
            </h2>
            <div className="max-w-3xl">
              <FAQAccordion items={FAQ} />
            </div>
          </div>
        </section>

        {/* ══ CTA FINAL ══════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Demander un dépannage 7/7"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 text-center">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight max-w-xl">
              Besoin d&apos;un{' '}
              <span className="text-accent">dépannage 7/7 ?</span>
            </h2>
            <p
              className="font-light max-w-xl"
              style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.6)' }}
            >
              Remplissez le formulaire ci-dessous ou contactez-nous directement.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="#demande-depannage" size="lg">
                Demander un dépannage
              </Button>
              <ContactPopover />
            </div>
          </div>
        </section>

        {/* ══ FORMULAIRE DÉPANNAGE ════════════════════════════════════ */}
        <section
          id="demande-depannage"
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Formulaire demande de dépannage à domicile"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
                Demander un{' '}
                <span className="text-accent">dépannage</span>
              </h2>
              <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.5)' }}>
                Décrivez votre problème et indiquez votre adresse ou votre zone. ClikClak vous répondra pour confirmer si un déplacement est pertinent.
              </p>
            </div>
            <div className="max-w-2xl">
              <ServiceRequestForm serviceType="depannage" />
            </div>
          </div>
        </section>

      </main>

      <RelatedBlogPosts postSlugs={['connaitre-modele-iphone', 'batterie-smartphone-fatiguee', 'telephone-tombe-dans-l-eau']} />
      <SiteFooter />
      <SectionPinning />
    </>
  )
}
