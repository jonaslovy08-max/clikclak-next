import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import { Button } from '@/components/ui/Button'
import FAQAccordion, { type FaqItem } from '@/components/repair/FAQAccordion'
import RecentShopProducts from '@/components/shop/RecentShopProducts'
import BuybackRequestForm from '@/components/contact/BuybackRequestForm'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Vendre smartphone, tablette, Mac et ordinateur Lausanne | ClikClak',
  description:
    'Vendez votre ancien smartphone, iPhone, Samsung, iPad, MacBook, iMac, ordinateur, Apple Watch ou AirPods à ClikClak Lausanne. Sélectionnez votre appareil, indiquez son état et recevez une offre rapide.',
  alternates: {
    canonical: `${SITE_URL}/services/rachat-de-votre-smartphone/`,
  },
  openGraph: {
    title: 'Vendre smartphone, tablette, Mac et ordinateur Lausanne — ClikClak',
    description: 'Vendez votre ancien appareil à ClikClak Lausanne. Offre rapide selon modèle, état et potentiel de reconditionnement.',
    url: `${SITE_URL}/services/rachat-de-votre-smartphone/`,
    locale: 'fr_CH',
    type: 'website',
  },
}

const AVANTAGES = [
  { title: 'Prix équitable',                text: 'Votre appareil est évalué selon son modèle, son état réel, sa capacité, la demande du marché et les éventuelles réparations nécessaires.' },
  { title: 'Suppression sécurisée des données', text: 'Nous vous guidons pour sauvegarder, transférer et effacer vos données avant la vente. Un appareil lié à un compte iCloud, Google ou Samsung peut être refusé.' },
  { title: 'Paiement rapide',               text: 'Après contrôle et validation de l\'offre, le paiement est effectué rapidement selon les modalités convenues.' },
  { title: 'Envoi gratuit',                 text: 'Vous pouvez déposer votre appareil en boutique ou bénéficier d\'une option d\'envoi gratuit selon les conditions de reprise.' },
  { title: 'Durabilité',                    text: 'Un appareil inutilisé peut être reconditionné, réparé ou recyclé de manière plus responsable.' },
]

const CARDS = [
  { title: 'Vendre un smartphone',       badge: 'Jusqu\'à CHF 1388', text: 'iPhone, Samsung, Huawei, OPPO, Xiaomi, Sony, Google Pixel…' },
  { title: 'Vendre une tablette',         badge: null,                text: 'iPad, Samsung Galaxy Tab et autres tablettes récentes.' },
  { title: 'Vendre un ordinateur',        badge: null,                text: 'PC portable, ordinateur fixe, Asus, HP, Lenovo, Dell et autres marques.' },
  { title: 'Vendre un Mac',               badge: 'Jusqu\'à CHF 2789', text: 'MacBook, iMac, Mac mini, Mac Studio.' },
  { title: 'Vendre une montre connectée', badge: null,                text: 'Apple Watch, Samsung Watch, Garmin et autres montres connectées.' },
  { title: 'Vendre des écouteurs',        badge: null,                text: 'AirPods et écouteurs Bluetooth récents.' },
]

const STEPS = [
  { num: '01', title: 'Sélection appareil',       text: 'Choisissez le type d\'appareil : smartphone, tablette, Mac, ordinateur, montre connectée ou écouteurs.' },
  { num: '02', title: 'Indiquez l\'état',          text: 'Précisez le modèle, la capacité, l\'état de l\'écran, de la batterie, les accessoires et le verrouillage éventuel.' },
  { num: '03', title: 'Recevez une offre rapide',  text: 'ClikClak analyse votre demande et vous transmet une offre ou une estimation selon les informations fournies.' },
  { num: '04', title: 'Envoi gratuit ou boutique', text: 'Déposez votre appareil chez ClikClak à Lausanne ou utilisez l\'option d\'envoi gratuit selon les conditions.' },
  { num: '05', title: 'Paiement rapide',           text: 'Après contrôle de l\'appareil et validation de l\'offre, le paiement est effectué rapidement.' },
]

const PREPARER = [
  'Sauvegardez vos données personnelles.',
  'Déconnectez iCloud, Localiser mon iPhone, Google ou Samsung.',
  'Supprimez vos codes uniquement si la vente est confirmée.',
  'Réinitialisez l\'appareil seulement après sauvegarde.',
  'Préparez la boîte, le chargeur, le câble ou les accessoires si vous les avez.',
  'Ne communiquez jamais vos mots de passe dans le formulaire.',
]

const FAQ: FaqItem[] = [
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
]

export default function RachatSmartphonePage() {
  return (
    <>
      <Header />

      <main>

        {/* ══ HERO ════════════════════════════════════════════════════ */}
        <section className="px-6 md:px-14 lg:px-20 py-20 border-t border-white/10" aria-label="Vendez votre ancien appareil à ClikClak">
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <div>
              <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-light"
                style={{ border: '1px solid rgba(204,255,51,0.4)', backgroundColor: 'rgba(204,255,51,0.06)', color: '#ccff33' }}>
                Rachat d&apos;appareils
              </span>
            </div>
            <h1 className="text-[2rem] md:text-[2.75rem] font-light leading-tight max-w-3xl">
              Vendez votre ancien appareil{' '}<span className="text-accent">à ClikClak</span>
            </h1>
            <p className="font-light leading-relaxed max-w-2xl"
              style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', color: 'rgba(242,242,242,0.65)' }}>
              Smartphone, tablette, Mac, ordinateur, montre connectée ou écouteurs : sélectionnez votre appareil, indiquez son état et recevez une offre rapide selon le modèle, la condition réelle et le potentiel de reconditionnement.
            </p>
            <ul className="flex flex-col gap-2">
              {['Prix équitable', 'Suppression sécurisée des données', 'Envoi gratuit selon conditions', 'Paiement rapide après contrôle', 'Reconditionnement ou recyclage responsable'].map(b => (
                <li key={b} className="flex items-start gap-2 text-sm font-light" style={{ color: 'rgba(242,242,242,0.7)' }}>
                  <span className="text-accent mt-0.5 shrink-0" aria-hidden>–</span>{b}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-4">
              <Button href="#estimation-rachat" size="lg">Commencer l&apos;estimation</Button>
              <Button href="#comment-ca-marche" variant="secondary" size="lg">Comment ça marche ?</Button>
            </div>
          </div>
        </section>

        {/* ══ COMMENT ÇA MARCHE ════════════════════════════════════════ */}
        <section id="comment-ca-marche" className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10" aria-label="Comment vendre votre appareil">
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Comment vendre votre{' '}<span className="text-accent">appareil ?</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {STEPS.map(s => (
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
              L&apos;offre finale est confirmée après contrôle réel de l&apos;appareil. Un appareil verrouillé, endommagé ou différent de la description peut modifier ou annuler l&apos;offre.
            </p>
          </div>
        </section>

        {/* ══ TYPES D'APPAREILS ════════════════════════════════════════ */}
        <section className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10" aria-label="Quels appareils pouvez-vous vendre">
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Quels appareils pouvez-vous{' '}<span className="text-accent">vendre ?</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CARDS.map(c => (
                <a key={c.title} href="#estimation-rachat"
                  className="flex flex-col gap-4 p-5 rounded-xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent border border-white/10 bg-white/[0.02] transition-[border-color,background-color] duration-200 hover:border-[rgba(204,255,51,0.2)] hover:bg-[rgba(204,255,51,0.025)]"
                  >
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
              Les montants &laquo;&nbsp;jusqu&apos;à&nbsp;&raquo; concernent des modèles récents en excellent état. L&apos;offre finale dépend du modèle exact, de la capacité, de l&apos;état, du verrouillage, des accessoires et du contrôle réalisé par ClikClak.
            </p>
          </div>
        </section>

        {/* ══ AVANTAGES ════════════════════════════════════════════════ */}
        <section className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10" aria-label="Pourquoi vendre à ClikClak">
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Pourquoi vendre votre appareil{' '}<span className="text-accent">à ClikClak ?</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {AVANTAGES.map(a => (
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
        <section id="estimation-rachat" className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10" aria-label="Formulaire estimation rachat appareil">
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
                Estimez votre{' '}<span className="text-accent">appareil</span>
              </h2>
              <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.5)' }}>
                Remplissez les informations ci-dessous pour recevoir une offre. Aucun prix garanti avant contrôle réel de l&apos;appareil.
              </p>
            </div>
            <div className="max-w-2xl">
              <BuybackRequestForm />
            </div>
          </div>
        </section>

        {/* ══ PRÉPARER SON APPAREIL ════════════════════════════════════ */}
        <section id="preparer-appareil" className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10" aria-label="Avant de vendre votre appareil">
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Avant de vendre votre{' '}<span className="text-accent">appareil</span>
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PREPARER.map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span style={{ color: '#ccff33', flexShrink: 0, fontWeight: 300 }}>—</span>
                  <span className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.75)' }}>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.5)' }}>
              Si vous n&apos;êtes pas sûr de la procédure, ClikClak peut vous guider.
            </p>
          </div>
        </section>

        {/* ══ DONNÉES ET CONFIDENTIALITÉ ═══════════════════════════════ */}
        <section className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10" aria-label="Suppression sécurisée des données">
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Suppression sécurisée{' '}<span className="text-accent">des données</span>
            </h2>
            <div className="max-w-3xl flex flex-col gap-4">
              <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.65)' }}>
                Avant toute reprise, vos données doivent être sauvegardées et supprimées de l&apos;appareil. ClikClak peut vous accompagner pour le transfert ou l&apos;effacement. Les mots de passe ne doivent jamais être transmis via le formulaire.
              </p>
              <p className="text-sm font-light leading-relaxed pl-4"
                style={{ color: 'rgba(242,242,242,0.5)', borderLeft: '2px solid rgba(204,255,51,0.4)' }}>
                Un appareil encore verrouillé ou lié à un compte iCloud, Google ou Samsung peut être refusé.
              </p>
              <Link href="/services/recuperation-donnees"
                className="inline-flex items-center gap-2 text-sm font-light underline underline-offset-4 focus-visible:outline-none"
                style={{ color: 'rgba(204,255,51,0.7)' }}>
                Besoin de transférer ou récupérer vos données ?
              </Link>
            </div>
          </div>
        </section>

        {/* ══ ENVOI GRATUIT / BOUTIQUE ══════════════════════════════════ */}
        <section className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10" aria-label="Envoi gratuit ou dépôt en boutique">
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Envoi gratuit ou{' '}<span className="text-accent">dépôt en boutique</span>
            </h2>
            <div className="max-w-3xl flex flex-col gap-4">
              <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.65)' }}>
                Vous pouvez déposer votre appareil directement chez ClikClak à Lausanne. Selon le type de reprise et les conditions validées, une option d&apos;envoi gratuit peut être proposée.
              </p>
              <div>
                <Button href="#estimation-rachat" size="lg">Demander une estimation</Button>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FAQ ══════════════════════════════════════════════════════ */}
        <section className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10" aria-label="Questions fréquentes rachat appareil">
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Questions{' '}<span className="text-accent">fréquentes</span>
            </h2>
            <div className="max-w-3xl">
              <FAQAccordion items={FAQ} />
            </div>
          </div>
        </section>

      </main>

      <RecentShopProducts />
      <SiteFooter />
      <SectionPinning />
    </>
  )
}
