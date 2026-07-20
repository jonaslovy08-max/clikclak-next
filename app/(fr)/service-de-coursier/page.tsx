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
  title: 'Service de coursier réparation Lausanne | Collecte et retour appareil | ClikClak',
  description:
    'ClikClak propose un service de coursier à Lausanne et environs proches : collecte de votre smartphone, tablette ou ordinateur, dépôt en atelier puis livraison retour après réparation.',
  alternates: {
    canonical: `${SITE_URL}/service-de-coursier`,
  },
  openGraph: {
    title: 'Service de coursier réparation Lausanne — ClikClak',
    description: 'Collecte et retour de votre appareil à Lausanne. CHF 40 l\'aller-retour, hors réparation.',
    url: `${SITE_URL}/service-de-coursier`,
    locale: 'fr_CH',
    type: 'website',
  },
}

const POURQUI = [
  'Particulier ou entreprise qui ne peut pas se déplacer',
  'Réparation smartphone, iPhone, Samsung, Android',
  'Réparation tablette ou iPad',
  'Réparation MacBook ou ordinateur',
  'Récupération de données ou diagnostic',
]

const PREPARER = [
  'L\'appareil à déposer',
  'Le chargeur si le problème est lié à la charge',
  'Une description de la panne',
  'Vos coordonnées pour le retour',
  'Une sauvegarde si possible avant intervention',
]

const STEPS = [
  { num: '01', title: 'Demande', text: 'Contactez-nous par téléphone ou via le formulaire de contact. Décrivez la panne et l\'adresse de collecte.' },
  { num: '02', title: 'Pick-up', text: 'Un coursier vient chercher votre appareil à l\'adresse convenue selon disponibilité.' },
  { num: '03', title: 'Réparation / diagnostic', text: 'L\'appareil est déposé en atelier ClikClak pour diagnostic ou réparation.' },
  { num: '04', title: 'Livraison retour', text: 'Une fois l\'intervention terminée, l\'appareil est livré à votre adresse selon disponibilité.' },
]

const FAQ: FaqItem[] = [
  {
    q: 'Combien coûte le service de coursier ?',
    a: 'Le service de coursier est facturé CHF 40 pour l\'aller-retour (CHF 20 par trajet). Ce tarif s\'ajoute au prix de la réparation.',
  },
  {
    q: 'La réparation est-elle comprise dans les CHF 40 ?',
    a: 'Non. Les CHF 40 correspondent uniquement au service de collecte et de retour de l\'appareil. Le prix de la réparation s\'y ajoute selon le modèle et la panne.',
  },
  {
    q: 'Dans quelle zone le service est-il disponible ?',
    a: 'Le service est disponible pour Lausanne et les environs proches selon disponibilité. Contactez-nous pour confirmer selon votre adresse.',
  },
  {
    q: 'Peut-on envoyer un ordinateur ou une tablette ?',
    a: 'Oui. Le service de coursier est disponible pour smartphones, tablettes, MacBook et ordinateurs portables selon la demande.',
  },
  {
    q: 'Que dois-je préparer avant le passage du coursier ?',
    a: 'Ayez l\'appareil prêt avec le chargeur si nécessaire. Notez la description de la panne. Évitez de communiquer votre code de déverrouillage par message — il peut être fourni directement au coursier si nécessaire.',
  },
  {
    q: 'Que se passe-t-il si la réparation n\'est pas possible ?',
    a: 'Si la réparation n\'est pas réalisable, nous vous contactons pour vous expliquer la situation. L\'appareil vous est retourné. Le tarif coursier reste dû selon les conditions convenues.',
  },
  {
    q: 'Puis-je utiliser le coursier pour une récupération de données ?',
    a: 'Oui. Le service de coursier peut être utilisé pour tout type de demande : réparation, diagnostic ou récupération de données.',
  },
]

export default function ServiceCourrierPage() {
  return (
    <>
      <Header />

      <main>

        {/* ══ HERO ════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-20 border-t border-white/10"
          aria-label="Service de coursier pour vos réparations"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-center">

            {/* ── Texte ── */}
            <div className="flex-1 flex flex-col gap-6">
              <div>
                <span
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-light"
                  style={{ border: '1px solid rgba(204,255,51,0.4)', backgroundColor: 'rgba(204,255,51,0.06)', color: '#ccff33' }}
                >
                  Service de coursier
                </span>
              </div>
              <h1 className="text-[2rem] md:text-[2.75rem] font-light leading-tight">
                Service de coursier{' '}
                <span className="text-accent">pour vos réparations</span>
              </h1>
              {/* Image mobile */}
              <div className="block md:hidden -mx-6 w-screen overflow-hidden">
                <Image
                  src="/assets/images/homepage/service-sections/coursier-mobile.webp"
                  alt="Service de coursier ClikClak Lausanne"
                  width={0} height={0} sizes="100vw"
                  className="w-full h-auto"
                />
              </div>
              <p
                className="font-light leading-relaxed max-w-2xl"
                style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', color: 'rgba(242,242,242,0.65)' }}
              >
                Vous souhaitez réparer votre téléphone, tablette ou ordinateur, mais vous ne pouvez pas passer en boutique ? Le service de coursier ClikClak organise la collecte de votre appareil, son dépôt en atelier et son retour après intervention.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button href="#demande-coursier" size="lg">
                  Demander un coursier
                </Button>
                <Button href="tel:+41213204477" variant="secondary" size="lg">
                  Appeler ClikClak
                </Button>
              </div>
            </div>

            {/* ── Image desktop ── */}
            <div className="hidden md:block w-[45%] shrink-0 rounded-xl overflow-hidden">
              <Image
                src="/assets/images/homepage/service-sections/coursier.webp"
                alt="Service de coursier ClikClak Lausanne"
                width={0} height={0} sizes="45vw"
                className="w-full h-auto"
              />
            </div>

          </div>
        </section>

        {/* ══ TARIF ══════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Tarif du service de coursier"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Tarif du{' '}
              <span className="text-accent">service</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-6">
              <div
                className="flex flex-col gap-3 p-6 rounded-xl"
                style={{ border: '1px solid rgba(204,255,51,0.3)', backgroundColor: 'rgba(204,255,51,0.04)' }}
              >
                <p className="text-xs font-light uppercase tracking-[0.15em]" style={{ color: 'rgba(204,255,51,0.7)' }}>
                  Aller-retour
                </p>
                <p className="text-3xl font-light" style={{ color: '#ccff33' }}>CHF 40</p>
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.55)' }}>
                  CHF 20 par trajet (collecte + retour). Ce tarif s&apos;ajoute au prix de la réparation — il ne la comprend pas.
                </p>
              </div>
              <div
                className="flex flex-col gap-3 p-6 rounded-xl flex-1"
                style={{ border: '1px solid rgba(242,242,242,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
              >
                <p className="text-xs font-light uppercase tracking-[0.15em]" style={{ color: 'rgba(242,242,242,0.35)' }}>
                  Zone
                </p>
                <p className="text-base font-light" style={{ color: 'rgba(242,242,242,0.85)' }}>
                  Lausanne et environs proches
                </p>
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.5)' }}>
                  Disponibilité selon les demandes en cours. Contactez-nous pour confirmer selon votre adresse.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ POUR QUI ════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Pour qui est ce service"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Pour{' '}
              <span className="text-accent">qui ?</span>
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {POURQUI.map(item => (
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

        {/* ══ COMMENT ÇA MARCHE ══════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Comment fonctionne le service de coursier"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Comment ça{' '}
              <span className="text-accent">marche ?</span>
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

        {/* ══ À PRÉPARER ══════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Que préparer avant le passage du coursier"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Que{' '}
              <span className="text-accent">préparer ?</span>
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PREPARER.map(item => (
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
              Ne jamais communiquer votre code Apple ID, mot de passe Google ou Samsung dans un message. Si un code est nécessaire pour le diagnostic, il peut être transmis directement au coursier lors du passage.
            </p>
          </div>
        </section>

        {/* ══ FAQ ════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Questions fréquentes service de coursier"
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
          aria-label="Demander le service de coursier"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 text-center">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight max-w-xl">
              Prêt à utiliser le{' '}
              <span className="text-accent">service de coursier ?</span>
            </h2>
            <p
              className="font-light max-w-xl"
              style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.6)' }}
            >
              Remplissez le formulaire ci-dessous ou contactez-nous directement.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="#demande-coursier" size="lg">
                Demander un coursier
              </Button>
              <ContactPopover />
            </div>
          </div>
        </section>

        {/* ══ FORMULAIRE COURSIER ════════════════════════════════════ */}
        <section
          id="demande-coursier"
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Formulaire demande de service de coursier"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
                Demander un{' '}
                <span className="text-accent">coursier</span>
              </h2>
              <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.5)' }}>
                Indiquez l&apos;adresse de prise en charge, le type d&apos;appareil et la panne. ClikClak vous confirmera la disponibilité du service.
              </p>
              <p
                className="text-sm font-light leading-relaxed pl-4"
                style={{ color: 'rgba(242,242,242,0.45)', borderLeft: '2px solid rgba(204,255,51,0.35)' }}
              >
                Le service de coursier est facturé CHF 40 pour l&apos;aller-retour, hors prix de réparation. Disponible à Lausanne et environs proches selon disponibilité.
              </p>
            </div>
            <div className="max-w-2xl">
              <ServiceRequestForm serviceType="coursier" />
            </div>
          </div>
        </section>

      </main>

      <RelatedBlogPosts postSlugs={['connaitre-modele-iphone', 'batterie-smartphone-fatiguee']} />
      <SiteFooter />
      <SectionPinning />
    </>
  )
}
