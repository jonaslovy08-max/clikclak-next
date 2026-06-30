'use client'

import { useState, useMemo, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { useChatbot } from './ChatbotContext'
import { Button } from '@/components/ui/Button'
import {
  searchIphoneModels,
  getIphoneRepairs,
  BRAND_LABELS,
  BRAND_PAGE_HREFS,
  type BrandKey,
  type ModelResult,
} from '@/lib/chatbot/searchRepairPrices'
import { SHOP_PRODUCTS } from '@/data/shopProducts'
import { CHATBOT_LIMITS } from '@/lib/chatbot/config'
import { CHATBOT_I18N, localizeChatbotHref } from '@/lib/chatbot/i18n'
import type { ChatbotLocale } from '@/lib/chatbot/locale'

/* ── Types ── */
type GuidedScreen =
  | 'home' | 'find-price' | 'iphone-model' | 'iphone-repair'
  | 'other-brand' | 'identify-model' | 'data-recovery'
  | 'sell-device' | 'depannage' | 'shop' | 'contact'

interface AiSuggestion {
  label:    string
  href?:    string
  /** 'button' → CTA secondaire (Contact) | 'link' → lien texte lime */
  variant?: 'button' | 'link'
}

interface AiMessage {
  role:         'user' | 'assistant'
  content:      string
  suggestions?: AiSuggestion[]
  isError?:     boolean
}

/* ── Constants ── */
const MAX_SESSION_MESSAGES = CHATBOT_LIMITS.maxQuestionsPerConversation

/* ── Sub-components ── */

function Chip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="inline-flex items-center px-3.5 py-2 text-[13px] font-light rounded-lg border border-white/[0.12] bg-white/[0.04] text-foreground/80 transition-colors hover:border-accent/30 hover:text-accent hover:bg-accent/[0.05] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent text-left">
      {label}
    </button>
  )
}

function BackBtn({ to, label, onClick }: { to: GuidedScreen; label: string; onClick: (s: GuidedScreen) => void }) {
  return (
    <button type="button" onClick={() => onClick(to)}
      className="self-start text-[12px] font-light text-foreground/40 hover:text-foreground/70 transition-colors focus-visible:outline-none">
      {label}
    </button>
  )
}

function NavLink({ href, children, onClose }: { href: string; children: React.ReactNode; onClose?: () => void }) {
  const isExternal = href.startsWith('http')
  const cls = "inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-light rounded-lg border border-accent/25 text-accent transition-colors hover:border-accent/50 hover:bg-accent/[0.07] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
  if (isExternal) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children} <span aria-hidden>→</span></a>
  return <Link href={href} className={cls} onClick={onClose}>{children} <span aria-hidden>→</span></Link>
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 px-3.5 py-3 self-start max-w-[80%] rounded-xl rounded-tl-sm"
      style={{ background: 'rgba(242,242,242,0.06)', border: '1px solid rgba(242,242,242,0.08)' }}>
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  )
}

/* ── Main component ── */
export default function ClikClakAssistant({ locale }: { locale: ChatbotLocale }) {
  const { isOpen, close } = useChatbot()
  const T  = CHATBOT_I18N[locale]
  const lh = useCallback((href: string) => localizeChatbotHref(href, locale), [locale])

  const WELCOME_MSG: AiMessage = useMemo(() => ({ role: 'assistant', content: T.welcomeMessage }), [T])

  const BRANDS: { key: BrandKey; label: string }[] = useMemo(() => [
    { key: 'iphone',  label: 'iPhone'  },
    { key: 'samsung', label: 'Samsung' },
    { key: 'ipad',    label: 'iPad'    },
    { key: 'macbook', label: 'MacBook' },
    { key: 'huawei',  label: 'Huawei'  },
    { key: 'oppo',    label: 'OPPO'    },
    { key: 'other',   label: T.brandOther },
  ], [T])

  const QUICK_ACTIONS: { label: string; screen: GuidedScreen }[] = useMemo(() => [
    { label: T.qaFindPrice,        screen: 'find-price'     },
    { label: T.qaIdentifyModel,    screen: 'identify-model' },
    { label: T.qaDataRecovery,     screen: 'data-recovery'  },
    { label: T.qaSellDevice,       screen: 'sell-device'    },
    { label: T.qaDepannage,        screen: 'depannage'      },
    { label: T.qaShop,             screen: 'shop'           },
    { label: T.qaContact,          screen: 'contact'        },
  ], [T])

  /* Guided screens */
  const [screen,     setScreen]   = useState<GuidedScreen>('home')
  const [brand,      setBrand]    = useState<BrandKey | null>(null)
  const [selModel,   setSelModel] = useState<ModelResult | null>(null)
  const [modelQuery, setModelQ]   = useState('')
  const [shopQuery,  setShopQ]    = useState('')

  /* Chat */
  const [chatMessages, setChatMessages] = useState<AiMessage[]>([])
  const [inputValue,   setInputValue]   = useState('')
  const [isLoading,    setIsLoading]    = useState(false)
  const [msgCount,     setMsgCount]     = useState(0)
  const [qaOpen,       setQaOpen]       = useState(false)

  /* Refs */
  const panelRef  = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)
  const tweensRef = useRef<gsap.core.Tween[]>([])

  /* ── GSAP initial state ── */
  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const ctx = gsap.context(() => {
      gsap.set(panel, { autoAlpha: 0, y: 18, scale: 0.96, transformOrigin: 'bottom center' })
    })
    return () => ctx.revert()
  }, [])

  /* ── GSAP open / close animations ── */
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    tweensRef.current.forEach(t => t.kill())
    tweensRef.current = []

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (isOpen) {
      if (reduced) {
        gsap.set(panel, { autoAlpha: 1, y: 0, scale: 1 })
      } else {
        tweensRef.current.push(
          gsap.fromTo(panel,
            { autoAlpha: 0, y: 18, scale: 0.96 },
            { autoAlpha: 1, y: 0,  scale: 1, duration: 0.5, ease: 'expo.out' },
          ),
        )
      }
    } else {
      if (reduced) {
        gsap.set(panel, { autoAlpha: 0 })
      } else {
        tweensRef.current.push(
          gsap.to(panel, { autoAlpha: 0, y: 12, scale: 0.96, duration: 0.3, ease: 'power2.inOut' }),
        )
      }
    }
  }, [isOpen])

  /* Auto-scroll */
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatMessages, isLoading, isOpen])

  /* Welcome message on first open */
  useEffect(() => {
    if (isOpen && chatMessages.length === 0) {
      setChatMessages([WELCOME_MSG])
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Reset conversation on close */
  useEffect(() => {
    if (isOpen) return
    const t = setTimeout(() => {
      setScreen('home'); setBrand(null); setSelModel(null)
      setModelQ(''); setShopQ('')
      setChatMessages([]); setInputValue(''); setIsLoading(false)
      setMsgCount(0); setQaOpen(false)
    }, 350)
    return () => clearTimeout(t)
  }, [isOpen])

  /* Escape */
  useEffect(() => {
    if (!isOpen) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [isOpen, close])

  /* Click-outside — activé un frame après l'ouverture pour ignorer le clic d'ouverture */
  useEffect(() => {
    if (!isOpen) return

    let removeListener: (() => void) | null = null

    const rafId = requestAnimationFrame(() => {
      const handleOutside = (e: MouseEvent) => {
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
          close()
        }
      }
      document.addEventListener('mousedown', handleOutside)
      removeListener = () => document.removeEventListener('mousedown', handleOutside)
    })

    return () => {
      cancelAnimationFrame(rafId)
      removeListener?.()
    }
  }, [isOpen, close])

  /* Derived */
  const iPhoneModels = useMemo(() => searchIphoneModels(modelQuery, 8), [modelQuery])
  const repairs      = useMemo(() => selModel ? getIphoneRepairs(selModel.id) : [], [selModel])
  const shopResults  = useMemo(() => {
    const q  = shopQuery.toLowerCase().trim()
    const ps = SHOP_PRODUCTS.filter(p => p.availability === 'en-stock')
    if (!q) return ps.slice(0, 3)
    return ps.filter(p => p.name.toLowerCase().includes(q) || (p.brand ?? '').toLowerCase().includes(q)).slice(0, 5)
  }, [shopQuery])

  /* Navigation */
  const goBack = useCallback((s: GuidedScreen) => setScreen(s), [])

  const selectBrand = useCallback((key: BrandKey) => {
    setBrand(key)
    if (key === 'iphone') { setModelQ(''); setScreen('iphone-model') }
    else setScreen('other-brand')
  }, [])

  const handleQuickAction = useCallback((s: GuidedScreen) => {
    setScreen(s)
    setQaOpen(false)
  }, [])

  /* AI chat — V2 uniquement, sans fallback V1 */
  const sendToAI = useCallback(async (msg: string) => {
    const text = msg.trim()
    if (!text || isLoading || msgCount >= MAX_SESSION_MESSAGES) return

    const userMsg: AiMessage = { role: 'user', content: text }
    const updated = [...chatMessages, userMsg]
    setChatMessages(updated)
    setInputValue('')
    inputRef.current?.blur()
    setIsLoading(true)
    setMsgCount(c => c + 1)
    setScreen('home')

    try {
      const messages = updated
        .slice(-CHATBOT_LIMITS.maxHistoryMessages)
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/chatbot', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages, locale }),
      })

      /* Lecture JSON tolérante — évite les crashes si le body est vide */
      const data = await res.json().catch(() => ({}) as Record<string, unknown>)

      if (res.ok) {
        const d = data as {
          answer?:   string
          blocked?:  boolean
          actions?:  { label: string; href: string; variant?: 'button' | 'link' }[]
        }
        /* Priorité : actions du résolveur tarifaire > suggestions génériques */
        const suggestions: AiMessage['suggestions'] =
          d.actions && d.actions.length > 0
            ? d.actions.map(a => ({ label: a.label, href: a.href, variant: a.variant }))
            : d.blocked
              ? [{ label: T.viewServices, href: lh('/reparation-smartphone-express'), variant: 'link' as const }]
              : undefined

        setChatMessages(prev => [...prev, {
          role:        'assistant',
          content:     d.answer ?? T.fallbackAnswer,
          suggestions,
        }])
        return
      }

      /* Gestion des statuts d'erreur serveur */
      let content: string
      let suggestions: AiMessage['suggestions']

      if (res.status === 429) {
        content = T.errRateLimited
      } else if (res.status === 503) {
        content = T.errUnavailable
        suggestions = [{ label: T.contactClikClak, href: lh('/contact-clik-clak-lausanne') }]
      } else if (res.status === 413) {
        content = T.errTooLong
      } else {
        /* 400, 415 ou autre */
        content = T.errGeneric
      }

      setChatMessages(prev => [...prev, { role: 'assistant', content, isError: true, suggestions }])

    } catch {
      /* Réseau inaccessible */
      setChatMessages(prev => [...prev, {
        role:    'assistant',
        content: T.errNetwork,
        isError: true,
        suggestions: [{ label: T.contactClikClak, href: lh('/contact-clik-clak-lausanne') }],
      }])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, msgCount, chatMessages, locale, T, lh])

  /* ── Rendu centralisé des actions/suggestions ──────────────────── */

  /* Valide qu'une URL est interne — refuse toute URL externe */
  const isInternalUrl = (href: string) => href.startsWith('/')

  /* Style partagé pour les liens texte lime */
  const linkCls = [
    'text-[#CCFF33] underline underline-offset-4 text-[13px] font-light leading-snug',
    'transition-colors hover:text-white',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF33] rounded-sm',
  ].join(' ')

  const renderSuggestion = useCallback((s: AiSuggestion, key: number) => {
    /* Action sans href → bouton textuel qui envoie dans le chat */
    if (!s.href) {
      return (
        <button key={key} type="button" onClick={() => sendToAI(s.label)}
          className="inline-flex items-center px-2.5 py-1.5 text-[12px] font-light rounded-lg border border-white/[0.12] text-foreground/70 hover:border-accent/30 hover:text-accent transition-colors focus-visible:outline-none">
          {s.label}
        </button>
      )
    }

    /* Refuser silencieusement les URLs externes */
    if (!isInternalUrl(s.href)) return null

    /* Variante 'button' → CTA secondaire du projet (Contact) */
    if (s.variant === 'button') {
      return (
        <Button key={key} variant="secondary" size="sm" href={s.href} onClick={close}>
          {s.label}
        </Button>
      )
    }

    /* Variante 'link' (ou défaut) → lien texte lime souligné */
    return (
      <Link key={key} href={s.href} onClick={close} className={linkCls}>
        {s.label}
      </Link>
    )
  }, [sendToAI, close, linkCls])

  /* ── Guided screens ── */
  const renderGuidedScreen = () => {
    switch (screen) {
      case 'find-price':
        return (
          <div className="flex flex-col gap-4 p-4">
            <BackBtn to="home" label={T.back} onClick={goBack} />
            <p className="text-sm font-light text-foreground/70">{T.whichBrand}</p>
            <div className="flex flex-wrap gap-2">
              {BRANDS.map(b => <Chip key={b.key} label={b.label} onClick={() => selectBrand(b.key)} />)}
            </div>
          </div>
        )
      case 'iphone-model':
        return (
          <div className="flex flex-col gap-3 p-4">
            <BackBtn to="find-price" label={T.back} onClick={goBack} />
            <input type="search" value={modelQuery} onChange={e => setModelQ(e.target.value)}
              placeholder={T.searchIphoneModelPlaceholder}
              style={{ fontSize: 16 }}
              className="w-full px-3 py-2.5 font-light rounded-lg border border-white/[0.1] bg-white/[0.05] text-foreground/80 placeholder:text-foreground/35 focus:outline-none focus:border-accent/40" />
            <div className="flex flex-col gap-1.5">
              {iPhoneModels.map(m => (
                <button key={m.id} type="button" onClick={() => { setSelModel(m); setScreen('iphone-repair') }}
                  className="text-left px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.02] text-[13px] font-light text-foreground/80 hover:border-accent/25 hover:text-accent transition-colors focus-visible:outline-none">
                  {m.label}
                </button>
              ))}
              {iPhoneModels.length === 0 && <p className="text-[13px] font-light text-foreground/40">{T.noModelFound}</p>}
            </div>
          </div>
        )
      case 'iphone-repair':
        return (
          <div className="flex flex-col gap-4 p-4">
            <BackBtn to="iphone-model" label={T.back} onClick={goBack} />
            <p className="text-sm font-light" style={{ color: 'rgba(204,255,51,0.85)' }}>{selModel?.label}</p>
            <div className="flex flex-col gap-1.5">
              {repairs.map(r => (
                <div key={r.label} className="flex items-center justify-between px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.02]">
                  <span className="text-[13px] font-light text-foreground/80">{r.label}</span>
                  <span className="text-[13px] font-light text-accent">{r.price}</span>
                </div>
              ))}
            </div>
            {selModel && <NavLink href={lh(selModel.href)} onClose={close}>{T.viewFullPage}</NavLink>}
            <p className="text-[11px] font-light text-foreground/35">{T.pricesVaryNote}</p>
          </div>
        )
      case 'other-brand':
        return (
          <div className="flex flex-col gap-4 p-4">
            <BackBtn to="find-price" label={T.back} onClick={goBack} />
            <p className="text-sm font-light text-foreground/70">{T.pricesFor(brand ? BRAND_LABELS[brand] : '')}</p>
            {brand && brand !== 'other' ? (
              <>
                <NavLink href={lh(BRAND_PAGE_HREFS[brand])} onClose={close}>{T.viewBrandPrices(BRAND_LABELS[brand])}</NavLink>
                <p className="text-[11px] font-light text-foreground/35">{T.pricesVaryByModelNote}</p>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <NavLink href={lh('/reparation-smartphone-express')} onClose={close}>{T.navSmartphoneRepair}</NavLink>
                <NavLink href={lh('/reparation-tablette-express')}   onClose={close}>{T.navTabletRepair}</NavLink>
                <NavLink href={lh('/reparation-ordinateur-express')} onClose={close}>{T.navComputerRepair}</NavLink>
              </div>
            )}
          </div>
        )
      case 'identify-model':
        return (
          <div className="flex flex-col gap-4 p-4">
            <BackBtn to="home" label={T.back} onClick={goBack} />
            <p className="text-sm font-light text-foreground/80">{T.identifyModelTitle}</p>
            <div className="flex flex-col gap-3 text-[13px] font-light text-foreground/65 leading-relaxed">
              <div><span className="text-accent">iPhone / iPad</span><br />{T.identifySettingsIphone}</div>
              <div><span className="text-accent">Samsung / Android</span><br />{T.identifySettingsAndroid}</div>
              <div><span className="text-accent">MacBook / Mac</span><br />{T.identifySettingsMac}</div>
            </div>
            <NavLink href={lh('/contact-clik-clak-lausanne')} onClose={close}>{T.sendPhoto}</NavLink>
          </div>
        )
      case 'data-recovery':
        return (
          <div className="flex flex-col gap-4 p-4">
            <BackBtn to="home" label={T.back} onClick={goBack} />
            <p className="text-sm font-light text-foreground/80">{T.dataRecoveryTitle}</p>
            <p className="text-[13px] font-light text-foreground/60 leading-relaxed">{T.dataRecoveryNote}</p>
            <div className="flex flex-col gap-2">
              <NavLink href={lh('/services/recuperation-donnees')}  onClose={close}>{T.viewDataRecoveryPage}</NavLink>
              <NavLink href={lh('/contact-clik-clak-lausanne')}     onClose={close}>{T.contactClikClak}</NavLink>
            </div>
          </div>
        )
      case 'sell-device':
        return (
          <div className="flex flex-col gap-4 p-4">
            <BackBtn to="home" label={T.back} onClick={goBack} />
            <p className="text-sm font-light text-foreground/80">{T.sellDeviceTitle}</p>
            <p className="text-[13px] font-light text-foreground/60 leading-relaxed">{T.sellDeviceNote}</p>
            <NavLink href={lh('/services/rachat-de-votre-smartphone')} onClose={close}>{T.requestEstimate}</NavLink>
          </div>
        )
      case 'depannage':
        return (
          <div className="flex flex-col gap-4 p-4">
            <BackBtn to="home" label={T.back} onClick={goBack} />
            <p className="text-sm font-light text-foreground/80">{T.depannageTitle}</p>
            <p className="text-[13px] font-light text-foreground/60 leading-relaxed">{T.depannageNote}</p>
            <NavLink href={lh('/services/depannage-reparation-domicile')} onClose={close}>{T.requestDepannage}</NavLink>
          </div>
        )
      case 'shop':
        return (
          <div className="flex flex-col gap-3 p-4">
            <BackBtn to="home" label={T.back} onClick={goBack} />
            <input type="search" value={shopQuery} onChange={e => setShopQ(e.target.value)}
              placeholder={T.searchProductPlaceholder}
              style={{ fontSize: 16 }}
              className="w-full px-3 py-2.5 font-light rounded-lg border border-white/[0.1] bg-white/[0.05] text-foreground/80 placeholder:text-foreground/35 focus:outline-none focus:border-accent/40" />
            <div className="flex flex-col gap-1.5">
              {shopResults.map(p => (
                <Link key={p.id} href={lh(`/shop-reparation-smartphone-lausanne/${p.slug}`)} onClick={close}
                  className="flex items-center justify-between px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:border-accent/20 transition-colors focus-visible:outline-none">
                  <span className="text-[13px] font-light text-foreground/80 truncate mr-2">{p.name}</span>
                  <span className="text-[13px] font-light text-accent shrink-0">
                    {p.price != null ? `CHF ${p.price.toFixed(0)}` : T.priceOnRequest}
                  </span>
                </Link>
              ))}
              {shopResults.length === 0 && <p className="text-[13px] font-light text-foreground/40">{T.noProductFound}</p>}
            </div>
            <NavLink href={lh('/shop-reparation-smartphone-lausanne')} onClose={close}>{T.viewFullShop}</NavLink>
          </div>
        )
      case 'contact':
        return (
          <div className="flex flex-col gap-4 p-4">
            <BackBtn to="home" label={T.back} onClick={goBack} />
            <p className="text-sm font-light text-foreground/80">{T.contactTitle}</p>
            <p className="text-[13px] font-light text-foreground/60 leading-relaxed">{T.contactNote}</p>
            <NavLink href={lh('/contact-clik-clak-lausanne')} onClose={close}>{T.contactForm}</NavLink>
          </div>
        )
      default: return null
    }
  }

  /* ── Render ── */
  return (
    <>
      {/* Overlay mobile — assombrit le site derrière le chatbot ouvert.
          z-[54] : sous le panel (z-55), au-dessus de tout le contenu.
          md:hidden : desktop inchangé.
          Clic sur l'overlay → ferme le chatbot. */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[54] md:hidden"
          style={{
            background:            'rgba(0,0,0,0.55)',
            backdropFilter:        'blur(2px)',
            WebkitBackdropFilter:  'blur(2px)',
          }}
          onClick={close}
          aria-hidden
        />
      )}

      {/* Panel — GSAP gère autoAlpha + transform, ne pas mettre opacity/visibility/transform ici */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={T.dialogAriaLabel}
        aria-hidden={!isOpen}
        className="fixed z-[55] flex flex-col bottom-[104px] md:bottom-[88px] inset-x-2 md:inset-x-auto md:right-[84px] md:left-auto md:w-[380px]"
      style={{
        maxHeight:    'calc(100svh - 140px)',
        background:   '#111',
        border:       '1px solid rgba(242,242,242,0.12)',
        borderRadius: 12,
        overflow:     'hidden',
        /* Lueur lime subtile quand ouvert */
        boxShadow: isOpen
          ? '0 0 0 1px rgba(204,255,51,0.2), 0 0 32px rgba(204,255,51,0.12), 0 0 72px rgba(204,255,51,0.06), 0 8px 40px rgba(0,0,0,0.6)'
          : '0 8px 40px rgba(0,0,0,0.6)',
        transition: 'box-shadow 0.5s ease',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(242,242,242,0.08)' }}>
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/chatbot/icon-chatbot-chatbox.svg" alt="" aria-hidden
            width={36} height={36} style={{ display: 'block', flexShrink: 0 }} />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-light leading-tight" style={{ color: 'rgba(242,242,242,0.9)' }}>
              {T.botName}
            </span>
            <span className="text-[10px] font-light leading-none" style={{ color: 'rgba(242,242,242,0.35)' }}>
              {T.botSubtitle}
            </span>
          </div>
        </div>
        <button type="button" onClick={close} aria-label={T.closeAriaLabel}
          className="inline-flex items-center justify-center p-1 shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
          style={{ background: 'transparent', border: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/ui/icon-close.svg" alt="" aria-hidden width={52} height={52} style={{ display: 'block', opacity: 1 }} />
        </button>
      </div>

      {/* Content area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
        {screen !== 'home' ? renderGuidedScreen() : (
          <div className="flex flex-col gap-3 p-4">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-3 py-2.5 rounded-xl text-base font-light leading-snug max-w-[85%] ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                  style={msg.role === 'user' ? {
                    background: 'rgba(204,255,51,0.12)', border: '1px solid rgba(204,255,51,0.2)', color: 'rgba(242,242,242,0.9)',
                  } : {
                    background: msg.isError ? 'rgba(255,80,80,0.08)' : 'rgba(242,242,242,0.06)',
                    border: `1px solid ${msg.isError ? 'rgba(255,80,80,0.15)' : 'rgba(242,242,242,0.08)'}`,
                    color: 'rgba(242,242,242,0.85)',
                  }}
                >
                  {msg.content}
                </div>
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 max-w-[90%]">
                    {msg.suggestions.map((s, si) => renderSuggestion(s, si))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && <LoadingDots />}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 px-3 pt-3 pb-2" style={{ borderTop: '1px solid rgba(242,242,242,0.08)' }}>
        {msgCount >= MAX_SESSION_MESSAGES ? (
          <div className="flex flex-col gap-2 pb-1">
            <p className="text-[12px] font-light text-foreground/55 leading-relaxed">
              {T.sessionLimitReached}
            </p>
            <NavLink href={lh('/contact-clik-clak-lausanne')} onClose={close}>{T.contactClikClak}</NavLink>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <form onSubmit={e => { e.preventDefault(); if (inputValue.trim() && !isLoading) sendToAI(inputValue) }}
              className="flex items-stretch gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={T.inputPlaceholder}
                maxLength={CHATBOT_LIMITS.maxInputCharacters}
                disabled={isLoading}
                style={{ fontSize: 16, background: '#f2f2f2', color: '#191919' }}
                className="flex-1 px-3 py-2 font-light rounded-lg border border-[rgba(25,25,25,0.15)] placeholder:text-black/40 focus:outline-none focus:border-[rgba(25,25,25,0.4)] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                aria-label={T.sendAriaLabel}
                className="flex items-center justify-center px-3 rounded-lg transition-colors focus-visible:outline-none shrink-0 disabled:opacity-40"
                style={{ background: '#ccff33', border: 'none' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/chatbot/icon-send-chatbot.svg" alt="" aria-hidden
                  width={18} height={18} style={{ display: 'block' }} />
              </button>
            </form>
            {/* Compteur restant — affiché quand ≤ 4 questions restantes */}
            {MAX_SESSION_MESSAGES - msgCount <= 4 && MAX_SESSION_MESSAGES - msgCount > 0 && (
              <p className="text-[11px] font-light text-foreground/35 text-right pr-1">
                {T.questionsRemaining(MAX_SESSION_MESSAGES - msgCount)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quick actions toggle */}
      <div className="shrink-0" style={{ borderTop: '1px solid rgba(242,242,242,0.06)' }}>
        <button type="button" onClick={() => setQaOpen(prev => !prev)}
          className="flex items-center justify-between w-full px-4 py-2.5 text-[12px] font-light transition-colors focus-visible:outline-none"
          style={{ color: '#ccff33' }}>
          <span>{T.quickActionsToggle}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qaOpen ? '/assets/ui/icon-chevron-toggle-up.svg' : '/assets/ui/icon-chevron-toggle-down.svg'}
            alt="" aria-hidden width={12} height={12} style={{ display: 'block' }} />
        </button>
        {qaOpen && (
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {QUICK_ACTIONS.map(a => (
              <Chip key={a.screen} label={a.label} onClick={() => handleQuickAction(a.screen)} />
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  )
}
