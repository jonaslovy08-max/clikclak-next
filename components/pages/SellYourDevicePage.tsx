import Image from 'next/image'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import RelatedBlogPosts from '@/components/blog/RelatedBlogPosts'
import { Button } from '@/components/ui/Button'
import FAQAccordion, { type FaqItem } from '@/components/repair/FAQAccordion'
import RecentShopProducts from '@/components/shop/RecentShopProducts'
import BuybackRequestForm from '@/components/contact/BuybackRequestForm'

const STRINGS = {
  fr: {
    badge: 'Rachat d\'appareils',
    h1a: 'Vendez votre ancien appareil',
    h1b: 'à ClikClak',
    heroP: 'Smartphone, tablette, Mac, ordinateur, montre connectée ou écouteurs : sélectionnez votre appareil, indiquez son état et recevez une offre rapide selon le modèle, la condition réelle et le potentiel de reconditionnement.',
    heroImgAlt: 'Rachat d\'appareils chez ClikClak Lausanne',
    bullets: ['Prix équitable', 'Suppression sécurisée des données', 'Envoi gratuit selon conditions', 'Paiement rapide après contrôle', 'Reconditionnement ou recyclage responsable'],
    cta1: 'Commencer l\'estimation',
    cta1Href: '#estimation-rachat',
    cta2: 'Comment ça marche ?',
    cta2Href: '#comment-ca-marche',

    howH2a: 'Comment vendre votre',
    howH2b: 'appareil ?',
    howNote: 'L\'offre finale est confirmée après contrôle réel de l\'appareil. Un appareil verrouillé, endommagé ou différent de la description peut modifier ou annuler l\'offre.',

    devicesH2a: 'Quels appareils pouvez-vous',
    devicesH2b: 'vendre ?',
    devicesPriceNote: 'Les montants « jusqu\'à » concernent des modèles récents en excellent état. L\'offre finale dépend du modèle exact, de la capacité, de l\'état, du verrouillage, des accessoires et du contrôle réalisé par ClikClak.',

    whyH2a: 'Pourquoi vendre votre appareil',
    whyH2b: 'à ClikClak ?',

    formH2a: 'Estimez votre',
    formH2b: 'appareil',
    formSub: 'Remplissez les informations ci-dessous pour recevoir une offre. Aucun prix garanti avant contrôle réel de l\'appareil.',

    prepareH2a: 'Avant de vendre votre',
    prepareH2b: 'appareil',

    dataH2a: 'Suppression sécurisée',
    dataH2b: 'des données',
    dataP1: 'Avant toute reprise, vos données doivent être sauvegardées et supprimées de l\'appareil. ClikClak peut vous accompagner pour le transfert ou l\'effacement. Les mots de passe ne doivent jamais être transmis via le formulaire.',
    dataP2: 'Un appareil encore verrouillé ou lié à un compte iCloud, Google ou Samsung peut être refusé.',
    dataLink: 'Besoin de transférer ou récupérer vos données ?',
    dataHref: '/services/recuperation-donnees',

    shippingH2a: 'Envoi gratuit ou',
    shippingH2b: 'dépôt en boutique',
    shippingP: 'Vous pouvez déposer votre appareil directement chez ClikClak à Lausanne. Selon le type de reprise et les conditions validées, une option d\'envoi gratuit peut être proposée.',
    shippingCta: 'Demander une estimation',
    shippingCtaHref: '#estimation-rachat',

    faqH2a: 'Questions',
    faqH2b: 'fréquentes',

    blogTitle: 'Conseils utiles',
  },
  en: {
    badge: 'Device buyback',
    h1a: 'Sell your old device',
    h1b: 'to ClikClak',
    heroP: 'Smartphone, tablet, Mac, computer, smartwatch or earphones: select your device, describe its condition and receive a quick offer based on the model, real condition and refurbishment potential.',
    heroImgAlt: 'Device buyback at ClikClak Lausanne',
    bullets: ['Fair price', 'Secure data deletion', 'Free shipping (conditions apply)', 'Fast payment after inspection', 'Responsible refurbishment or recycling'],
    cta1: 'Start your estimate',
    cta1Href: '#estimation-rachat',
    cta2: 'How does it work?',
    cta2Href: '#comment-ca-marche',

    howH2a: 'How to sell your',
    howH2b: 'device?',
    howNote: 'The final offer is confirmed after actual inspection of the device. A locked, damaged or misrepresented device may alter or cancel the offer.',

    devicesH2a: 'What devices can you',
    devicesH2b: 'sell?',
    devicesPriceNote: 'The "up to" amounts apply to recent models in excellent condition. The final offer depends on the exact model, capacity, condition, lock status, accessories and ClikClak\'s inspection.',

    whyH2a: 'Why sell your device',
    whyH2b: 'to ClikClak?',

    formH2a: 'Get your',
    formH2b: 'estimate',
    formSub: 'Fill in the information below to receive an offer. No price is guaranteed before actual inspection of the device.',

    prepareH2a: 'Before selling your',
    prepareH2b: 'device',

    dataH2a: 'Secure',
    dataH2b: 'data deletion',
    dataP1: 'Before any buyback, your data must be backed up and deleted from the device. ClikClak can guide you through the transfer or erasure process. Passwords must never be shared through the form.',
    dataP2: 'A device still locked or linked to an iCloud, Google or Samsung account may be refused.',
    dataLink: 'Need to transfer or recover your data?',
    dataHref: '/en/services/data-recovery',

    shippingH2a: 'Free shipping or',
    shippingH2b: 'in-store drop-off',
    shippingP: 'You can drop off your device directly at ClikClak in Lausanne. Depending on the buyback type and agreed conditions, a free shipping option may be offered.',
    shippingCta: 'Request an estimate',
    shippingCtaHref: '#estimation-rachat',

    faqH2a: 'Frequently asked',
    faqH2b: 'questions',

    blogTitle: 'Useful tips',
  },
} as const

const AVANTAGES = {
  fr: [
    { title: 'Prix équitable',                text: 'Votre appareil est évalué selon son modèle, son état réel, sa capacité, la demande du marché et les éventuelles réparations nécessaires.' },
    { title: 'Suppression sécurisée des données', text: 'Nous vous guidons pour sauvegarder, transférer et effacer vos données avant la vente. Un appareil lié à un compte iCloud, Google ou Samsung peut être refusé.' },
    { title: 'Paiement rapide',               text: 'Après contrôle et validation de l\'offre, le paiement est effectué rapidement selon les modalités convenues.' },
    { title: 'Envoi gratuit',                 text: 'Vous pouvez déposer votre appareil en boutique ou bénéficier d\'une option d\'envoi gratuit selon les conditions de reprise.' },
    { title: 'Durabilité',                    text: 'Un appareil inutilisé peut être reconditionné, réparé ou recyclé de manière plus responsable.' },
  ],
  en: [
    { title: 'Fair price',                    text: 'Your device is evaluated based on its model, actual condition, capacity, market demand and any repairs needed.' },
    { title: 'Secure data deletion',          text: 'We guide you through backing up, transferring and erasing your data before the sale. A device linked to an iCloud, Google or Samsung account may be refused.' },
    { title: 'Fast payment',                  text: 'After inspection and offer confirmation, payment is made quickly according to the agreed terms.' },
    { title: 'Free shipping',                 text: 'You can drop your device off in-store or use the free shipping option subject to buyback conditions.' },
    { title: 'Sustainability',                text: 'An unused device can be refurbished, repaired or responsibly recycled.' },
  ],
}

const CARDS = {
  fr: [
    { title: 'Vendre un smartphone',       badge: 'Jusqu\'à CHF 1388', text: 'iPhone, Samsung, Huawei, OPPO, Xiaomi, Sony, Google Pixel…' },
    { title: 'Vendre une tablette',         badge: null,                text: 'iPad, Samsung Galaxy Tab et autres tablettes récentes.' },
    { title: 'Vendre un ordinateur',        badge: null,                text: 'PC portable, ordinateur fixe, Asus, HP, Lenovo, Dell et autres marques.' },
    { title: 'Vendre un Mac',               badge: 'Jusqu\'à CHF 2789', text: 'MacBook, iMac, Mac mini, Mac Studio.' },
    { title: 'Vendre une montre connectée', badge: null,                text: 'Apple Watch, Samsung Watch, Garmin et autres montres connectées.' },
    { title: 'Vendre des écouteurs',        badge: null,                text: 'AirPods et écouteurs Bluetooth récents.' },
  ],
  en: [
    { title: 'Sell a smartphone',           badge: 'Up to CHF 1,388',  text: 'iPhone, Samsung, Huawei, OPPO, Xiaomi, Sony, Google Pixel…' },
    { title: 'Sell a tablet',               badge: null,                text: 'iPad, Samsung Galaxy Tab and other recent tablets.' },
    { title: 'Sell a computer',             badge: null,                text: 'Laptop, desktop, Asus, HP, Lenovo, Dell and other brands.' },
    { title: 'Sell a Mac',                  badge: 'Up to CHF 2,789',  text: 'MacBook, iMac, Mac mini, Mac Studio.' },
    { title: 'Sell a smartwatch',           badge: null,                text: 'Apple Watch, Samsung Watch, Garmin and other smartwatches.' },
    { title: 'Sell earphones',              badge: null,                text: 'AirPods and recent Bluetooth earphones.' },
  ],
}

const STEPS = {
  fr: [
    { num: '01', title: 'Sélection appareil',       text: 'Choisissez le type d\'appareil : smartphone, tablette, Mac, ordinateur, montre connectée ou écouteurs.' },
    { num: '02', title: 'Indiquez l\'état',          text: 'Précisez le modèle, la capacité, l\'état de l\'écran, de la batterie, les accessoires et le verrouillage éventuel.' },
    { num: '03', title: 'Recevez une offre rapide',  text: 'ClikClak analyse votre demande et vous transmet une offre ou une estimation selon les informations fournies.' },
    { num: '04', title: 'Envoi gratuit ou boutique', text: 'Déposez votre appareil chez ClikClak à Lausanne ou utilisez l\'option d\'envoi gratuit selon les conditions.' },
    { num: '05', title: 'Paiement rapide',           text: 'Après contrôle de l\'appareil et validation de l\'offre, le paiement est effectué rapidement.' },
  ],
  en: [
    { num: '01', title: 'Device selection',          text: 'Choose the device type: smartphone, tablet, Mac, computer, smartwatch or earphones.' },
    { num: '02', title: 'Describe condition',        text: 'Specify the model, capacity, screen and battery condition, accessories and any lock status.' },
    { num: '03', title: 'Receive a quick offer',     text: 'ClikClak reviews your request and sends you an offer or estimate based on the information provided.' },
    { num: '04', title: 'Free shipping or in-store', text: 'Drop your device at ClikClak in Lausanne or use the free shipping option subject to conditions.' },
    { num: '05', title: 'Fast payment',              text: 'After device inspection and offer confirmation, payment is made quickly.' },
  ],
}

const PREPARER = {
  fr: [
    'Sauvegardez vos données personnelles.',
    'Déconnectez iCloud, Localiser mon iPhone, Google ou Samsung.',
    'Supprimez vos codes uniquement si la vente est confirmée.',
    'Réinitialisez l\'appareil seulement après sauvegarde.',
    'Préparez la boîte, le chargeur, le câble ou les accessoires si vous les avez.',
    'Ne communiquez jamais vos mots de passe dans le formulaire.',
  ],
  en: [
    'Back up your personal data.',
    'Sign out of iCloud, Find My iPhone, Google or Samsung.',
    'Remove your passcode only once the sale is confirmed.',
    'Factory reset only after backup.',
    'Prepare the box, charger, cable or accessories if you have them.',
    'Never share your passwords in the form.',
  ],
}

const FAQ_DATA: Record<'fr' | 'en', FaqItem[]> = {
  fr: [
    { q: 'Est-ce que ClikClak rachète tous les appareils ?',       a: 'Non. L\'acceptation dépend du modèle, de l\'état, de la demande, de la valeur de revente et du verrouillage éventuel.' },
    { q: 'L\'offre est-elle définitive ?',                         a: 'Non. Une estimation à distance reste indicative. L\'offre finale est confirmée après contrôle de l\'appareil.' },
    { q: 'Puis-je vendre un appareil cassé ?',                     a: 'Oui dans certains cas. Un appareil cassé peut être repris pour réparation, pièces ou recyclage selon son état.' },
    { q: 'Dois-je désactiver iCloud ou Localiser mon iPhone ?',    a: 'Oui. Un appareil encore lié à un compte iCloud, Google ou Samsung peut être refusé.' },
    { q: 'Mes données sont-elles supprimées ?',                    a: 'Vous devez sauvegarder et supprimer vos données avant la vente. ClikClak peut vous accompagner dans cette étape si nécessaire.' },
    { q: 'Est-ce que l\'envoi est gratuit ?',                      a: 'Une option d\'envoi gratuit peut être proposée selon les conditions de reprise. Le dépôt en boutique reste possible.' },
    { q: 'Quand suis-je payé ?',                                   a: 'Le paiement intervient après contrôle de l\'appareil et validation de l\'offre.' },
    { q: 'Comment le prix est-il calculé ?',                       a: 'Le prix dépend du modèle, de l\'année, de la capacité, de l\'état, de la batterie, des défauts, de la demande et des réparations nécessaires.' },
    { q: 'Puis-je vendre une montre connectée ou des écouteurs ?', a: 'Oui, certains modèles récents comme Apple Watch, Samsung Watch ou AirPods peuvent être proposés.' },
    { q: 'Que faire si je ne connais pas le modèle ?',             a: 'Vous pouvez envoyer une photo et les informations disponibles. ClikClak vous aidera à identifier l\'appareil.' },
  ],
  en: [
    { q: 'Does ClikClak buy all devices?',                          a: 'No. Acceptance depends on the model, condition, demand, resale value and any lock status.' },
    { q: 'Is the offer final?',                                     a: 'No. A remote estimate is indicative. The final offer is confirmed after physical inspection of the device.' },
    { q: 'Can I sell a broken device?',                             a: 'Yes in some cases. A broken device may be accepted for repair, parts or recycling depending on its condition.' },
    { q: 'Do I need to deactivate iCloud or Find My iPhone?',       a: 'Yes. A device still linked to an iCloud, Google or Samsung account may be refused.' },
    { q: 'Will my data be deleted?',                                a: 'You must back up and delete your data before the sale. ClikClak can guide you through this step if needed.' },
    { q: 'Is shipping free?',                                       a: 'A free shipping option may be offered subject to buyback conditions. In-store drop-off is also possible.' },
    { q: 'When do I get paid?',                                     a: 'Payment is made after device inspection and offer confirmation.' },
    { q: 'How is the price calculated?',                            a: 'The price depends on the model, year, capacity, condition, battery, defects, demand and any repairs needed.' },
    { q: 'Can I sell a smartwatch or earphones?',                   a: 'Yes, certain recent models such as Apple Watch, Samsung Watch or AirPods may be accepted.' },
    { q: 'What if I don\'t know the model?',                        a: 'You can send a photo and the available information. ClikClak will help identify the device.' },
  ],
}

export default function SellYourDevicePage({ locale = 'fr' }: { locale?: 'fr' | 'en' }) {
  const T       = STRINGS[locale]
  const avantages = AVANTAGES[locale]
  const cards     = CARDS[locale]
  const steps     = STEPS[locale]
  const preparer  = PREPARER[locale]
  const faq       = FAQ_DATA[locale]

  return (
    <>
      <Header locale={locale} />

      <main>

        {/* ══ HERO ════════════════════════════════════════════════════ */}
        <section className="px-6 md:px-14 lg:px-20 py-20 border-t border-white/10"
          aria-label={locale === 'en' ? 'Sell your old device to ClikClak' : 'Vendez votre ancien appareil à ClikClak'}>
          <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-center">
            <div className="flex-1 flex flex-col gap-6">
              <div>
                <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-light"
                  style={{ border: '1px solid rgba(204,255,51,0.4)', backgroundColor: 'rgba(204,255,51,0.06)', color: '#ccff33' }}>
                  {T.badge}
                </span>
              </div>
              <h1 className="text-[2rem] md:text-[2.75rem] font-light leading-tight">
                {T.h1a}{' '}<span className="text-accent">{T.h1b}</span>
              </h1>
              <div className="block md:hidden -mx-6 w-screen overflow-hidden">
                <Image
                  src="/assets/images/homepage/service-sections/smartphone-buyback-mobile.webp"
                  alt={T.heroImgAlt}
                  width={0} height={0} sizes="100vw"
                  className="w-full h-auto"
                />
              </div>
              <p className="font-light leading-relaxed max-w-2xl"
                style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', color: 'rgba(242,242,242,0.65)' }}>
                {T.heroP}
              </p>
              <ul className="flex flex-col gap-2">
                {T.bullets.map(b => (
                  <li key={b} className="flex items-start gap-2 text-sm font-light" style={{ color: 'rgba(242,242,242,0.7)' }}>
                    <span className="text-accent mt-0.5 shrink-0" aria-hidden>–</span>{b}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-4">
                <Button href={T.cta1Href} size="lg">{T.cta1}</Button>
                <Button href={T.cta2Href} variant="secondary" size="lg">{T.cta2}</Button>
              </div>
            </div>
            <div className="hidden md:block w-[45%] shrink-0 rounded-xl overflow-hidden">
              <Image
                src="/assets/images/homepage/service-sections/smartphone-buyback.webp"
                alt={T.heroImgAlt}
                width={0} height={0} sizes="45vw"
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* ══ COMMENT ÇA MARCHE ════════════════════════════════════════ */}
        <section id="comment-ca-marche" className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label={locale === 'en' ? 'How to sell your device' : 'Comment vendre votre appareil'}>
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              {T.howH2a}{' '}<span className="text-accent">{T.howH2b}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {steps.map(s => (
                <div key={s.num} className="flex flex-col gap-4 p-5 rounded-xl"
                  style={{ border: '1px solid rgba(242,242,242,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-2xl font-light" style={{ color: 'rgba(204,255,51,0.5)' }}>{s.num}</span>
                  <p className="text-sm font-light" style={{ color: '#ededed' }}>{s.title}</p>
                  <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.5)' }}>{s.text}</p>
                </div>
              ))}
            </div>
            <p className="text-sm font-light leading-relaxed pl-4"
              style={{ color: 'rgba(242,242,242,0.5)', borderLeft: '2px solid rgba(204,255,51,0.4)' }}>
              {T.howNote}
            </p>
          </div>
        </section>

        {/* ══ TYPES D'APPAREILS ════════════════════════════════════════ */}
        <section className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label={locale === 'en' ? 'What devices can you sell' : 'Quels appareils pouvez-vous vendre'}>
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              {T.devicesH2a}{' '}<span className="text-accent">{T.devicesH2b}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map(c => (
                <a key={c.title} href="#estimation-rachat"
                  className="flex flex-col gap-4 p-5 rounded-xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent border border-white/10 bg-white/[0.02] transition-[border-color,background-color] duration-200 hover:border-[rgba(204,255,51,0.2)] hover:bg-[rgba(204,255,51,0.025)]">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.85)' }}>{c.title}</p>
                    {c.badge && (
                      <span className="text-xs font-light shrink-0 px-2 py-1 rounded"
                        style={{ background: 'rgba(204,255,51,0.1)', color: '#ccff33', border: '1px solid rgba(204,255,51,0.2)' }}>
                        {c.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.5)' }}>{c.text}</p>
                </a>
              ))}
            </div>
            <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.4)' }}>
              {T.devicesPriceNote}
            </p>
          </div>
        </section>

        {/* ══ AVANTAGES ════════════════════════════════════════════════ */}
        <section className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label={locale === 'en' ? 'Why sell to ClikClak' : 'Pourquoi vendre à ClikClak'}>
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              {T.whyH2a}{' '}<span className="text-accent">{T.whyH2b}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {avantages.map(a => (
                <div key={a.title} className="flex flex-col gap-3 p-5 rounded-xl"
                  style={{ border: '1px solid rgba(242,242,242,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <p className="text-sm font-light" style={{ color: '#ccff33' }}>{a.title}</p>
                  <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.55)' }}>{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FORMULAIRE ESTIMATION ════════════════════════════════════ */}
        <section id="estimation-rachat" className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label={locale === 'en' ? 'Device estimate form' : 'Formulaire estimation rachat appareil'}>
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
                {T.formH2a}{' '}<span className="text-accent">{T.formH2b}</span>
              </h2>
              <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.5)' }}>
                {T.formSub}
              </p>
            </div>
            <div className="max-w-2xl">
              <BuybackRequestForm locale={locale} />
            </div>
          </div>
        </section>

        {/* ══ PRÉPARER SON APPAREIL ════════════════════════════════════ */}
        <section id="preparer-appareil" className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label={locale === 'en' ? 'Before selling your device' : 'Avant de vendre votre appareil'}>
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              {T.prepareH2a}{' '}<span className="text-accent">{T.prepareH2b}</span>
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {preparer.map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span style={{ color: '#ccff33', flexShrink: 0, fontWeight: 300 }}>—</span>
                  <span className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.75)' }}>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.5)' }}>
              {locale === 'en' ? 'If you are unsure of the process, ClikClak can guide you.' : 'Si vous n\'êtes pas sûr de la procédure, ClikClak peut vous guider.'}
            </p>
          </div>
        </section>

        {/* ══ DONNÉES ET CONFIDENTIALITÉ ═══════════════════════════════ */}
        <section className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label={locale === 'en' ? 'Secure data deletion' : 'Suppression sécurisée des données'}>
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              {T.dataH2a}{' '}<span className="text-accent">{T.dataH2b}</span>
            </h2>
            <div className="max-w-3xl flex flex-col gap-4">
              <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.65)' }}>
                {T.dataP1}
              </p>
              <p className="text-sm font-light leading-relaxed pl-4"
                style={{ color: 'rgba(242,242,242,0.5)', borderLeft: '2px solid rgba(204,255,51,0.4)' }}>
                {T.dataP2}
              </p>
              <a href={T.dataHref}
                className="inline-flex items-center gap-2 text-sm font-light underline underline-offset-4 focus-visible:outline-none"
                style={{ color: 'rgba(204,255,51,0.7)' }}>
                {T.dataLink}
              </a>
            </div>
          </div>
        </section>

        {/* ══ ENVOI GRATUIT / BOUTIQUE ══════════════════════════════════ */}
        <section className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label={locale === 'en' ? 'Free shipping or in-store drop-off' : 'Envoi gratuit ou dépôt en boutique'}>
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              {T.shippingH2a}{' '}<span className="text-accent">{T.shippingH2b}</span>
            </h2>
            <div className="max-w-3xl flex flex-col gap-4">
              <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.65)' }}>
                {T.shippingP}
              </p>
              <div>
                <Button href={T.shippingCtaHref} size="lg">{T.shippingCta}</Button>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FAQ ══════════════════════════════════════════════════════ */}
        <section className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label={locale === 'en' ? 'Frequently asked questions — device buyback' : 'Questions fréquentes rachat appareil'}>
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              {T.faqH2a}{' '}<span className="text-accent">{T.faqH2b}</span>
            </h2>
            <div className="max-w-3xl">
              <FAQAccordion items={faq} />
            </div>
          </div>
        </section>

      </main>

      <RecentShopProducts />
      <RelatedBlogPosts title={T.blogTitle} postSlugs={['connaitre-modele-iphone', 'batterie-smartphone-fatiguee']} locale={locale} />
      <SiteFooter locale={locale} />
      <SectionPinning />
    </>
  )
}
