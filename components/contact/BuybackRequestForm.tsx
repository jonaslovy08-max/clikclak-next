'use client'

/*
  BuybackRequestForm — formulaire multi-étapes d'estimation rachat appareil.

  5 étapes :
    1. Appareil   — type, marque, modèle, capacité
    2. État       — condition, écran, batterie, allumage, verrouillage, accessoires
    3. Photos     — upload compressé + message libre
    4. Coordonnées — prénom, nom, email, téléphone, adresse complète, pays
    5. Récap      — résumé + préférence paiement + mode remise + 2 confirmations + Turnstile + envoi

  API : /api/contact — serviceLabel "Estimation rachat appareil"
  Référence : générée côté serveur, affichée dans le message de succès
  Email client : envoyé automatiquement (non bloquant)
*/

import { useState, useRef, useId } from 'react'
import Link from 'next/link'
import TurnstileWidget from '@/components/forms/TurnstileWidget'

type FormState = 'idle' | 'sending' | 'success' | 'error'
type Step = 1 | 2 | 3 | 4 | 5
interface CompressedImage { base64: string; originalSize: number; compressedSize: number; filename: string }

/* Turnstile requis si la clé publique est configurée (build-time) */
const SITE_KEY_CONFIGURED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

/* ── Listes ── */
const DEVICE_TYPES = ['Smartphone','Tablette','Ordinateur portable','Ordinateur fixe','MacBook','iMac','Mac mini','Mac Studio','Montre connectée','Écouteurs','Accessoire','Autre']
const BRANDS       = ['Apple','Samsung','Huawei','OPPO','Xiaomi','Sony','Google Pixel','Asus','HP','Lenovo','Dell','Garmin','Autre']
const CAPACITIES   = ['32 GB','64 GB','128 GB','256 GB','512 GB','1 TB','2 TB','Je ne sais pas','Non applicable']
const CONDITIONS   = ['Comme neuf','Très bon état','Bon état','Usé','Cassé / pour pièces']
const SCREENS      = ['Intact','Rayé','Fissuré','Affichage défectueux','Ne s\'allume pas','Non applicable','Je ne sais pas']
const BATTERIES    = ['Bonne autonomie','Autonomie faible','Batterie à remplacer','Batterie gonflée','Non applicable','Je ne sais pas']
const POWERS       = ['Oui','Non','Parfois','Non applicable']
const LOCKS        = ['iCloud / Localiser / compte Google / compte constructeur désactivé','Encore activé','Je ne sais pas','Non applicable']
const ACCESSORIES  = ['Boîte','Chargeur','Câble','Écouteurs','Bracelet','Aucun']
const PAYMENT_OPTS = ['Virement bancaire','TWINT','Paiement / reprise en magasin','Bon d\'achat ClikClak']
const DELIVERY_OPTS= ['Dépôt en boutique à Lausanne','Envoi gratuit selon conditions','À définir avec ClikClak']
const STEP_LABELS  = ['Appareil','État','Photos','Coordonnées','Récapitulatif']

/* Messages selon préférence paiement */
const PAYMENT_HINTS: Record<string, string> = {
  'Virement bancaire':             'L\'IBAN sera demandé uniquement après validation de l\'offre finale par ClikClak.',
  'TWINT':                         'Le numéro TWINT sera confirmé après validation de l\'offre finale.',
  'Paiement / reprise en magasin': 'La reprise pourra être finalisée en boutique après contrôle de l\'appareil.',
  'Bon d\'achat ClikClak':         'Le bon d\'achat éventuel sera confirmé après validation de l\'offre finale.',
}

/* ── Styles ── */
const IS: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(242,242,242,0.13)', borderRadius:8, padding:'12px 16px', fontSize:15, fontWeight:300, color:'rgba(242,242,242,0.9)', outline:'none', appearance:'none', WebkitAppearance:'none' }
const LS: React.CSSProperties = { display:'block', fontSize:12, fontWeight:300, textTransform:'uppercase', letterSpacing:'0.1em', color:'rgba(242,242,242,0.4)', marginBottom:8 }
const ES: React.CSSProperties = { fontSize:12, fontWeight:300, color:'rgba(255,100,100,0.85)', marginTop:6 }
const BS: React.CSSProperties = { border:'1px solid rgba(242,242,242,0.08)', background:'rgba(255,255,255,0.02)', borderRadius:12, padding:24, display:'flex', flexDirection:'column', gap:16 }
const rg = (f:string,n:string): React.CSSProperties => f===n?{borderColor:'rgba(204,255,51,0.55)',boxShadow:'0 0 0 2px rgba(204,255,51,0.1)'}:{}

/* ── Compression ── */
function compressImage(file:File): Promise<CompressedImage> {
  return new Promise((resolve,reject) => {
    if (!file.type.startsWith('image/')) { reject(new Error('Fichier doit être une image.')); return }
    if (file.size > 10*1024*1024) { reject(new Error('Fichier trop lourd (max 10 Mo).')); return }
    const r=new FileReader()
    r.onerror=()=>reject(new Error('Lecture impossible.'))
    r.onload=ev=>{
      const img=new window.Image()
      img.onerror=()=>reject(new Error('Décodage impossible.'))
      img.onload=()=>{
        let{width:w,height:h}=img
        if(w>1600||h>1600){if(w>=h){h=Math.round(h*1600/w);w=1600}else{w=Math.round(w*1600/h);h=1600}}
        const c=document.createElement('canvas');c.width=w;c.height=h
        const ctx=c.getContext('2d');if(!ctx){reject(new Error('Canvas indisponible.'));return}
        ctx.drawImage(img,0,0,w,h)
        c.toBlob(blob=>{
          if(!blob){reject(new Error('Compression échouée.'));return}
          const r2=new FileReader()
          r2.onload=e2=>resolve({base64:e2.target?.result as string,originalSize:file.size,compressedSize:blob.size,filename:file.name})
          r2.readAsDataURL(blob)
        },'image/jpeg',0.75)
      }
      img.src=ev.target?.result as string
    }
    r.readAsDataURL(file)
  })
}
const fmt=(b:number)=>b<1048576?`${(b/1024).toFixed(0)} Ko`:`${(b/1048576).toFixed(1)} Mo`

/* ── Boutons navigation ── */
function BtnNext({onClick}:{onClick:()=>void}) {
  return (
    <button type="button" onClick={onClick}
      className="inline-flex items-center justify-center gap-2 font-rubik font-medium leading-none whitespace-nowrap rounded-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background shiny-cta shiny-cta-primary text-primary-foreground h-12 px-8 text-sm">
      Suivant →
    </button>
  )
}
function BtnPrev({onClick,disabled}:{onClick:()=>void,disabled?:boolean}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="inline-flex items-center gap-2 h-12 px-6 text-sm font-rubik font-medium rounded-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40"
      style={{border:'1px solid rgba(242,242,242,0.15)',color:'rgba(242,242,242,0.6)'}}>
      ← Précédent
    </button>
  )
}

/* ── Select helper ── */
function Sel({id,label,required,value,onChange,options,disabled,error,focused,setFocused,clearErr}:{
  id:string,label:string,required?:boolean,value:string,onChange:(v:string)=>void,
  options:string[],disabled?:boolean,error?:string,focused:string,
  setFocused:(n:string)=>void,clearErr?:(k:string)=>void
}) {
  return (
    <div>
      <label htmlFor={id} style={LS}>{label} {required&&<span style={{color:'#ccff33'}}>*</span>}</label>
      <select id={id} disabled={disabled} value={value}
        onChange={e=>{onChange(e.target.value);clearErr?.(id)}}
        onFocus={()=>setFocused(id)} onBlur={()=>setFocused('')}
        style={{...IS,...rg(focused,id),cursor:'pointer'}}>
        <option value="">— Sélectionner —</option>
        {options.map(o=><option key={o}>{o}</option>)}
      </select>
      {error&&<p style={ES}>{error}</p>}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════ */
export default function BuybackRequestForm() {
  const uid=useId()
  const [step,setStep]=useState<Step>(1)

  /* ── Étape 1 ── */
  const [deviceType,setDeviceType]=useState('')
  const [brand,setBrand]=useState('')
  const [model,setModel]=useState('')
  const [capacity,setCapacity]=useState('')

  /* ── Étape 2 ── */
  const [condGeneral,setCondGeneral]=useState('')
  const [condScreen,setCondScreen]=useState('')
  const [condBattery,setCondBattery]=useState('')
  const [powersOn,setPowersOn]=useState('')
  const [lockState,setLockState]=useState('')
  const [accs,setAccs]=useState<Set<string>>(new Set())

  /* ── Étape 3 ── */
  const [message,setMessage]=useState('')
  const [image,setImage]=useState<CompressedImage|null>(null)
  const [imgPreview,setImgPreview]=useState('')
  const [imgErr,setImgErr]=useState('')
  const [imgLoading,setImgLoading]=useState(false)
  const fileRef=useRef<HTMLInputElement>(null)

  /* ── Étape 4 ── */
  const [firstName,setFirstName]=useState('')
  const [lastName,setLastName]=useState('')
  const [email,setEmail]=useState('')
  const [phone,setPhone]=useState('')
  const [street,setStreet]=useState('')
  const [houseNum,setHouseNum]=useState('')
  const [postal,setPostal]=useState('')
  const [city,setCity]=useState('')
  const [country,setCountry]=useState('Suisse')

  /* ── Étape 5 ── */
  const [paymentPref,setPaymentPref]=useState('')
  const [deliveryMode,setDeliveryMode]=useState('')
  const [confirms,setConfirms]=useState<Set<number>>(new Set())
  const [turnstileToken,setTurnstileToken]=useState('')

  /* ── Formulaire ── */
  const [errors,setErrors]=useState<Record<string,string>>({})
  const [fState,setFState]=useState<FormState>('idle')
  const [apiErr,setApiErr]=useState('')
  const [reference,setReference]=useState('')
  const [focused,setFocused]=useState('')

  const clearErr=(k:string)=>setErrors(p=>{const n={...p};delete n[k];return n})

  /* ── Accessoires toggle ── */
  const toggleAcc=(a:string)=>setAccs(p=>{const n=new Set(p);if(n.has(a))n.delete(a);else{if(a==='Aucun')n.clear();else n.delete('Aucun');n.add(a)};return n})

  /* ── Confirmations toggle ── */
  const toggleConfirm=(i:number)=>setConfirms(p=>{const n=new Set(p);if(n.has(i)){n.delete(i)}else{n.add(i)};return n})

  /* ── Upload image ── */
  const handleFile=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0];if(!f)return
    setImgErr('');setImgLoading(true)
    try{const c=await compressImage(f);setImage(c);setImgPreview(c.base64)}
    catch(err){setImgErr(err instanceof Error?err.message:'Erreur image.')}
    finally{setImgLoading(false);if(fileRef.current)fileRef.current.value=''}
  }
  const removeImage=()=>{setImage(null);setImgPreview('');setImgErr('');if(fileRef.current)fileRef.current.value=''}

  /* ── Validation par étape ── */
  const validateStep=(s:Step):boolean=>{
    const e:Record<string,string>={}
    if(s===1){
      if(!deviceType)e.deviceType='Veuillez sélectionner un type d\'appareil.'
      if(!brand)e.brand='Veuillez sélectionner une marque.'
    }
    if(s===2){
      if(!condGeneral)e.condGeneral='Veuillez indiquer l\'état général.'
      if(!condScreen)e.condScreen='Veuillez indiquer l\'état de l\'écran.'
      if(!condBattery)e.condBattery='Veuillez indiquer l\'état de la batterie.'
      if(!powersOn)e.powersOn='Veuillez indiquer si l\'appareil s\'allume.'
      if(!lockState)e.lockState='Veuillez indiquer l\'état du verrouillage.'
    }
    if(s===4){
      if(!firstName.trim())e.firstName='Veuillez indiquer votre prénom.'
      if(!lastName.trim())e.lastName='Veuillez indiquer votre nom.'
      if(!email.trim())e.email='Veuillez indiquer votre email.'
      else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))e.email='Email invalide.'
      if(!phone.trim())e.phone='Veuillez indiquer votre téléphone.'
      if(!street.trim())e.street='Veuillez indiquer la rue.'
      if(!houseNum.trim())e.houseNum='Veuillez indiquer le numéro.'
      if(!postal.trim())e.postal='Veuillez indiquer le code postal.'
      if(!city.trim())e.city='Veuillez indiquer la localité.'
      if(!country.trim())e.country='Veuillez indiquer le pays.'
    }
    if(s===5){
      if(!paymentPref)e.paymentPref='Veuillez sélectionner une préférence de paiement.'
      if(!deliveryMode)e.deliveryMode='Veuillez sélectionner un mode de remise.'
      if(confirms.size<2)e.confirms='Les deux confirmations sont obligatoires.'
      if(SITE_KEY_CONFIGURED&&!turnstileToken)e.turnstile='Veuillez valider la protection anti-spam avant d\'envoyer le formulaire.'
    }
    setErrors(e)
    return Object.keys(e).length===0
  }

  const nextStep=()=>{if(validateStep(step))setStep(s=>(s+1)as Step)}
  const prevStep=()=>{setErrors({});setStep(s=>(s-1)as Step)}

  /* ── Envoi ── */
  const handleSubmit=async(ev:React.FormEvent)=>{
    ev.preventDefault()
    if(!validateStep(5))return
    setFState('sending');setApiErr('')

    const payload:Record<string,unknown>={
      name:`${firstName.trim()} ${lastName.trim()}`,
      firstName:firstName.trim(),lastName:lastName.trim(),
      email:email.trim(),phone:phone.trim(),
      serviceLabel:'Estimation rachat appareil',
      deviceType,brand,model:model.trim(),deviceCapacity:capacity,
      conditionGeneral:condGeneral,conditionScreen:condScreen,conditionBattery:condBattery,
      powerState:powersOn,lockState,accessories:Array.from(accs).join(', ')||'Aucun',
      addrStreet:street.trim(),addrNumber:houseNum.trim(),addrPostal:postal.trim(),
      addrCity:city.trim(),addrCountry:country.trim(),
      paymentPref,deliveryMode,message:message.trim(),
      consent:true,_hp:'',
      turnstileToken,
    }
    if(image){payload.imageBase64=image.base64;payload.imageFilename=image.filename;payload.imageOriginalSize=image.originalSize;payload.imageCompressedSize=image.compressedSize}

    try{
      const res=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      const json=await res.json()
      if(!res.ok){setApiErr(json.error??'Une erreur est survenue.');setFState('error')}
      else{setReference(json.reference??'');setFState('success')}
    }catch{setApiErr('Erreur réseau.');setFState('error')}
  }

  /* ── Succès ── */
  if(fState==='success'){
    return(
      <div className="flex flex-col gap-5 items-start p-8 rounded-xl" style={{border:'1px solid rgba(204,255,51,0.25)',background:'rgba(204,255,51,0.04)'}}>
        <span className="text-3xl" aria-hidden>✓</span>
        <div className="flex flex-col gap-3">
          <p className="text-base font-light" style={{color:'rgba(242,242,242,0.9)'}}>Votre demande d&apos;estimation a bien été envoyée.</p>
          {reference&&(
            <div className="flex flex-col gap-1">
              <p className="text-xs font-light uppercase tracking-[0.12em]" style={{color:'rgba(242,242,242,0.4)'}}>Référence</p>
              <p className="text-lg font-light" style={{color:'#ccff33'}}>{reference}</p>
              <p className="text-xs font-light" style={{color:'rgba(242,242,242,0.4)'}}>Conservez cette référence pour tout échange avec ClikClak.</p>
            </div>
          )}
          <p className="text-sm font-light" style={{color:'rgba(242,242,242,0.5)'}}>
            Un email de confirmation a été envoyé à <strong className="font-normal" style={{color:'rgba(242,242,242,0.8)'}}>{email}</strong>.
            ClikClak vous répondra avec une offre ou une demande d&apos;information complémentaire.
          </p>
        </div>
      </div>
    )
  }

  const isSending=fState==='sending'

  /* ── Barre de progression ── */
  const StepBar=()=>(
    <div className="flex flex-col gap-2 mb-6">
      <div className="flex items-center gap-1.5">
        {([1,2,3,4,5]as Step[]).map(n=>(
          <div key={n} style={{height:4,borderRadius:2,flex:n<=step?2:1,background:n<=step?'#ccff33':'rgba(242,242,242,0.12)',transition:'flex 250ms ease,background 250ms ease'}}/>
        ))}
      </div>
      <p className="text-xs font-light" style={{color:'rgba(242,242,242,0.4)'}}>
        Étape {step} / 5 — {STEP_LABELS[step-1]}
      </p>
    </div>
  )

  const selProps={focused,setFocused,clearErr}

  return(
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-0">
      {/* Honeypot anti-spam — ne jamais remplir */}
      <div aria-hidden style={{position:'absolute',left:'-9999px',width:1,height:1,overflow:'hidden'}}>
        <input
          type="text"
          name="org_url"
          tabIndex={-1}
          autoComplete="nope"
          aria-hidden="true"
          data-1p-ignore="true"
          data-lpignore="true"
          data-form-type="other"
          defaultValue=""
        />
      </div>
      <StepBar/>

      {/* ══ ÉTAPE 1 ══ Appareil */}
      {step===1&&(
        <div className="flex flex-col gap-5">
          <div style={BS}>
            <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>Votre appareil</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Sel id={`${uid}-dt`} label="Type d'appareil" required value={deviceType} onChange={v=>{setDeviceType(v);clearErr(`${uid}-dt`)}} options={DEVICE_TYPES} error={errors.deviceType} {...selProps}/>
              <Sel id={`${uid}-br`} label="Marque" required value={brand} onChange={v=>{setBrand(v);clearErr(`${uid}-br`)}} options={BRANDS} error={errors.brand} {...selProps}/>
            </div>
            <div>
              <label htmlFor={`${uid}-mo`} style={LS}>Modèle exact</label>
              <input id={`${uid}-mo`} type="text" disabled={isSending}
                placeholder='iPhone 15 Pro, Galaxy S23, MacBook Pro 14", Apple Watch Series 9…'
                value={model} onChange={e=>setModel(e.target.value)}
                onFocus={()=>setFocused(`${uid}-mo`)} onBlur={()=>setFocused('')}
                style={{...IS,...rg(focused,`${uid}-mo`)}}/>
            </div>
            <Sel id={`${uid}-cap`} label="Capacité" value={capacity} onChange={setCapacity} options={CAPACITIES} {...selProps}/>
          </div>
          <div className="flex justify-end"><BtnNext onClick={nextStep}/></div>
        </div>
      )}

      {/* ══ ÉTAPE 2 ══ État */}
      {step===2&&(
        <div className="flex flex-col gap-5">
          <div style={BS}>
            <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>État de l&apos;appareil</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Sel id={`${uid}-cg`} label="État général" required value={condGeneral} onChange={v=>{setCondGeneral(v);clearErr(`${uid}-cg`)}} options={CONDITIONS} error={errors.condGeneral} {...selProps}/>
              <Sel id={`${uid}-cs`} label="État de l'écran" required value={condScreen} onChange={v=>{setCondScreen(v);clearErr(`${uid}-cs`)}} options={SCREENS} error={errors.condScreen} {...selProps}/>
              <Sel id={`${uid}-cb`} label="État de la batterie" required value={condBattery} onChange={v=>{setCondBattery(v);clearErr(`${uid}-cb`)}} options={BATTERIES} error={errors.condBattery} {...selProps}/>
              <Sel id={`${uid}-po`} label="L'appareil s'allume ?" required value={powersOn} onChange={v=>{setPowersOn(v);clearErr(`${uid}-po`)}} options={POWERS} error={errors.powersOn} {...selProps}/>
            </div>
            <Sel id={`${uid}-ls`} label="Verrouillage (iCloud / Google / Samsung)" required value={lockState} onChange={v=>{setLockState(v);clearErr(`${uid}-ls`)}} options={LOCKS} error={errors.lockState} {...selProps}/>
          </div>
          <div style={BS}>
            <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>Accessoires inclus</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ACCESSORIES.map(a=>{const checked=accs.has(a);return(
                <label key={a} className="flex items-center gap-2 cursor-pointer select-none rounded-lg px-3 py-2"
                  style={{border:`1px solid ${checked?'rgba(204,255,51,0.3)':'rgba(242,242,242,0.08)'}`,background:checked?'rgba(204,255,51,0.05)':'rgba(255,255,255,0.02)',transition:'border-color 150ms,background 150ms'}}>
                  <input type="checkbox" checked={checked} disabled={isSending} onChange={()=>toggleAcc(a)} className="w-4 h-4 accent-[#ccff33] shrink-0 cursor-pointer"/>
                  <span className="text-sm font-light" style={{color:checked?'rgba(242,242,242,0.9)':'rgba(242,242,242,0.6)'}}>{a}</span>
                </label>
              )})}
            </div>
          </div>
          <div className="flex justify-between gap-4"><BtnPrev onClick={prevStep}/><BtnNext onClick={nextStep}/></div>
        </div>
      )}

      {/* ══ ÉTAPE 3 ══ Photos + message */}
      {step===3&&(
        <div className="flex flex-col gap-5">
          <div style={BS}>
            <div>
              <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>Photo <span style={{color:'rgba(242,242,242,0.25)',textTransform:'none',fontSize:11,letterSpacing:0}}>(optionnel mais recommandé)</span></p>
              <p className="text-xs font-light mt-1" style={{color:'rgba(242,242,242,0.4)'}}>Ajoutez une photo de face, de dos et de l&apos;écran si possible. L&apos;image est compressée avant l&apos;envoi.</p>
            </div>
            {imgPreview&&image?(
              <div className="flex flex-col gap-3">
                <div className="relative w-full max-w-sm rounded-lg overflow-hidden" style={{border:'1px solid rgba(242,242,242,0.12)'}}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgPreview} alt="Aperçu" className="w-full object-contain" style={{maxHeight:220}}/>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs font-light" style={{color:'rgba(242,242,242,0.4)'}}>{image.filename} — {fmt(image.originalSize)} → <span style={{color:'rgba(204,255,51,0.7)'}}>{fmt(image.compressedSize)}</span></p>
                  <button type="button" onClick={removeImage} className="text-xs font-light underline underline-offset-4 focus-visible:outline-none" style={{color:'rgba(242,242,242,0.4)'}}>Supprimer</button>
                </div>
              </div>
            ):(
              <div>
                <input ref={fileRef} type="file" accept="image/*" id={`${uid}-ph`} disabled={isSending||imgLoading} onChange={handleFile} className="sr-only"/>
                <label htmlFor={`${uid}-ph`} style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',border:'1px dashed rgba(242,242,242,0.2)',borderRadius:8,fontSize:14,fontWeight:300,color:imgLoading?'rgba(242,242,242,0.3)':'rgba(242,242,242,0.6)',cursor:isSending?'not-allowed':'pointer'}}>
                  {imgLoading?'Compression…':'Choisir une image'}
                </label>
                {imgErr&&<p style={{...ES,marginTop:8}}>{imgErr}</p>}
              </div>
            )}
          </div>
          <div style={BS}>
            <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>Message <span style={{color:'rgba(242,242,242,0.25)',textTransform:'none',fontSize:11,letterSpacing:0}}>(optionnel)</span></p>
            <textarea rows={4} disabled={isSending}
              placeholder="Ajoutez toute information utile : panne connue, réparation déjà effectuée, état batterie, accessoires, urgence."
              value={message} onChange={e=>setMessage(e.target.value)}
              onFocus={()=>setFocused('msg')} onBlur={()=>setFocused('')}
              style={{...IS,...rg(focused,'msg'),resize:'vertical',minHeight:90,lineHeight:1.7}}/>
          </div>
          <div className="flex justify-between gap-4"><BtnPrev onClick={prevStep}/><BtnNext onClick={nextStep}/></div>
        </div>
      )}

      {/* ══ ÉTAPE 4 ══ Coordonnées */}
      {step===4&&(
        <div className="flex flex-col gap-5">
          <div style={BS}>
            <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>Vos coordonnées</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([['fn','Prénom',firstName,setFirstName],['ln','Nom',lastName,setLastName]] as const).map(([k,l,v,s])=>(
                <div key={k}>
                  <label htmlFor={`${uid}-${k}`} style={LS}>{l} <span style={{color:'#ccff33'}}>*</span></label>
                  <input id={`${uid}-${k}`} type="text" disabled={isSending} autoComplete={k==='fn'?'given-name':'family-name'}
                    value={v} onChange={e=>{s(e.target.value);clearErr(k)}}
                    onFocus={()=>setFocused(k)} onBlur={()=>setFocused('')}
                    style={{...IS,...rg(focused,k)}}/>
                  {errors[k]&&<p style={ES}>{errors[k]}</p>}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`${uid}-em`} style={LS}>Email <span style={{color:'#ccff33'}}>*</span></label>
                <input id={`${uid}-em`} type="email" autoComplete="email" placeholder="votre@email.com" disabled={isSending}
                  value={email} onChange={e=>{setEmail(e.target.value);clearErr('email')}}
                  onFocus={()=>setFocused('email')} onBlur={()=>setFocused('')}
                  style={{...IS,...rg(focused,'email')}}/>
                {errors.email&&<p style={ES}>{errors.email}</p>}
              </div>
              <div>
                <label htmlFor={`${uid}-ph2`} style={LS}>Téléphone <span style={{color:'#ccff33'}}>*</span></label>
                <input id={`${uid}-ph2`} type="tel" autoComplete="tel" placeholder="021 XXX XX XX" disabled={isSending}
                  value={phone} onChange={e=>{setPhone(e.target.value);clearErr('phone')}}
                  onFocus={()=>setFocused('phone')} onBlur={()=>setFocused('')}
                  style={{...IS,...rg(focused,'phone')}}/>
                {errors.phone&&<p style={ES}>{errors.phone}</p>}
              </div>
            </div>
          </div>
          <div style={BS}>
            <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>Adresse</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor={`${uid}-st`} style={LS}>Rue <span style={{color:'#ccff33'}}>*</span></label>
                <input id={`${uid}-st`} type="text" placeholder="Rue du Petit-Chêne" disabled={isSending}
                  value={street} onChange={e=>{setStreet(e.target.value);clearErr('street')}}
                  onFocus={()=>setFocused('street')} onBlur={()=>setFocused('')}
                  style={{...IS,...rg(focused,'street')}}/>
                {errors.street&&<p style={ES}>{errors.street}</p>}
              </div>
              <div>
                <label htmlFor={`${uid}-hn`} style={LS}>Numéro <span style={{color:'#ccff33'}}>*</span></label>
                <input id={`${uid}-hn`} type="text" placeholder="9b" disabled={isSending}
                  value={houseNum} onChange={e=>{setHouseNum(e.target.value);clearErr('houseNum')}}
                  onFocus={()=>setFocused('hn')} onBlur={()=>setFocused('')}
                  style={{...IS,...rg(focused,'hn')}}/>
                {errors.houseNum&&<p style={ES}>{errors.houseNum}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor={`${uid}-po`} style={LS}>Code postal <span style={{color:'#ccff33'}}>*</span></label>
                <input id={`${uid}-po`} type="text" placeholder="1003" disabled={isSending}
                  value={postal} onChange={e=>{setPostal(e.target.value);clearErr('postal')}}
                  onFocus={()=>setFocused('postal')} onBlur={()=>setFocused('')}
                  style={{...IS,...rg(focused,'postal')}}/>
                {errors.postal&&<p style={ES}>{errors.postal}</p>}
              </div>
              <div>
                <label htmlFor={`${uid}-ci`} style={LS}>Localité <span style={{color:'#ccff33'}}>*</span></label>
                <input id={`${uid}-ci`} type="text" placeholder="Lausanne" disabled={isSending}
                  value={city} onChange={e=>{setCity(e.target.value);clearErr('city')}}
                  onFocus={()=>setFocused('city')} onBlur={()=>setFocused('')}
                  style={{...IS,...rg(focused,'city')}}/>
                {errors.city&&<p style={ES}>{errors.city}</p>}
              </div>
              <div>
                <label htmlFor={`${uid}-co`} style={LS}>Pays <span style={{color:'#ccff33'}}>*</span></label>
                <input id={`${uid}-co`} type="text" disabled={isSending}
                  value={country} onChange={e=>{setCountry(e.target.value);clearErr('country')}}
                  onFocus={()=>setFocused('country')} onBlur={()=>setFocused('')}
                  style={{...IS,...rg(focused,'country')}}/>
                {errors.country&&<p style={ES}>{errors.country}</p>}
              </div>
            </div>
          </div>
          <div className="flex justify-between gap-4"><BtnPrev onClick={prevStep}/><BtnNext onClick={nextStep}/></div>
        </div>
      )}

      {/* ══ ÉTAPE 5 ══ Récapitulatif + paiement + confirmations */}
      {step===5&&(
        <div className="flex flex-col gap-5">

          {/* Récapitulatif */}
          <div style={BS}>
            <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>Récapitulatif de votre demande</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-light uppercase tracking-[0.1em]" style={{color:'rgba(242,242,242,0.35)'}}>Appareil</p>
                {[[deviceType,'Type'],[brand,'Marque'],[model||'—','Modèle'],[capacity||'—','Capacité']].map(([v,l])=>(
                  <div key={l as string} className="flex flex-col gap-0.5">
                    <span className="text-xs font-light" style={{color:'rgba(242,242,242,0.35)'}}>{l}</span>
                    <span className="text-sm font-light" style={{color:'rgba(242,242,242,0.85)'}}>{v||'—'}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-xs font-light uppercase tracking-[0.1em]" style={{color:'rgba(242,242,242,0.35)'}}>État</p>
                {[[condGeneral,'Général'],[condScreen,'Écran'],[condBattery,'Batterie'],[powersOn,'Allumage'],[lockState,'Verrouillage'],[Array.from(accs).join(', ')||'Aucun','Accessoires']].map(([v,l])=>(
                  <div key={l as string} className="flex flex-col gap-0.5">
                    <span className="text-xs font-light" style={{color:'rgba(242,242,242,0.35)'}}>{l}</span>
                    <span className="text-sm font-light" style={{color:'rgba(242,242,242,0.85)'}}>{v||'—'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2" style={{borderTop:'1px solid rgba(242,242,242,0.07)'}}>
              <p className="text-xs font-light uppercase tracking-[0.1em] mb-3" style={{color:'rgba(242,242,242,0.35)'}}>Coordonnées</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  [`${firstName} ${lastName}`,'Nom'],
                  [email,'Email'],
                  [phone,'Téléphone'],
                  [`${street} ${houseNum}, ${postal} ${city}, ${country}`,'Adresse'],
                ].map(([v,l])=>(
                  <div key={l as string} className="flex flex-col gap-0.5">
                    <span className="text-xs font-light" style={{color:'rgba(242,242,242,0.35)'}}>{l}</span>
                    <span className="text-sm font-light" style={{color:'rgba(242,242,242,0.85)'}}>{v||'—'}</span>
                  </div>
                ))}
              </div>
            </div>

            {image&&<p className="text-xs font-light" style={{color:'rgba(242,242,242,0.4)'}}>Photo : {image.filename} ({fmt(image.compressedSize)})</p>}
            {message&&(
              <div className="pt-2" style={{borderTop:'1px solid rgba(242,242,242,0.07)'}}>
                <p className="text-xs font-light uppercase tracking-[0.1em] mb-1" style={{color:'rgba(242,242,242,0.35)'}}>Message</p>
                <p className="text-sm font-light" style={{color:'rgba(242,242,242,0.7)'}}>{message}</p>
              </div>
            )}
          </div>

          {/* Préférence paiement */}
          <div style={BS}>
            <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>Préférence de paiement <span style={{color:'#ccff33'}}>*</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PAYMENT_OPTS.map(opt=>{const sel=paymentPref===opt;return(
                <label key={opt} className="flex items-center gap-3 cursor-pointer select-none rounded-lg px-3 py-3"
                  style={{border:`1px solid ${sel?'rgba(204,255,51,0.3)':'rgba(242,242,242,0.08)'}`,background:sel?'rgba(204,255,51,0.05)':'rgba(255,255,255,0.02)',transition:'border-color 150ms,background 150ms'}}>
                  <input type="radio" name="payment" checked={sel} disabled={isSending}
                    onChange={()=>{setPaymentPref(opt);clearErr('paymentPref')}}
                    className="w-4 h-4 accent-[#ccff33] shrink-0"/>
                  <span className="text-sm font-light" style={{color:sel?'rgba(242,242,242,0.9)':'rgba(242,242,242,0.6)'}}>{opt}</span>
                </label>
              )})}
            </div>
            {paymentPref&&PAYMENT_HINTS[paymentPref]&&(
              <p className="text-xs font-light leading-relaxed pl-3" style={{color:'rgba(242,242,242,0.5)',borderLeft:'2px solid rgba(204,255,51,0.3)'}}>{PAYMENT_HINTS[paymentPref]}</p>
            )}
            {errors.paymentPref&&<p style={ES}>{errors.paymentPref}</p>}
          </div>

          {/* Mode de remise */}
          <div style={BS}>
            <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>Mode de remise de l&apos;appareil <span style={{color:'#ccff33'}}>*</span></p>
            <div className="flex flex-col gap-2">
              {DELIVERY_OPTS.map(opt=>{const sel=deliveryMode===opt;return(
                <label key={opt} className="flex items-center gap-3 cursor-pointer select-none rounded-lg px-3 py-3"
                  style={{border:`1px solid ${sel?'rgba(204,255,51,0.3)':'rgba(242,242,242,0.08)'}`,background:sel?'rgba(204,255,51,0.05)':'rgba(255,255,255,0.02)',transition:'border-color 150ms,background 150ms'}}>
                  <input type="radio" name="delivery" checked={sel} disabled={isSending}
                    onChange={()=>{setDeliveryMode(opt);clearErr('deliveryMode')}}
                    className="w-4 h-4 accent-[#ccff33] shrink-0"/>
                  <span className="text-sm font-light" style={{color:sel?'rgba(242,242,242,0.9)':'rgba(242,242,242,0.6)'}}>{opt}</span>
                </label>
              )})}
            </div>
            <p className="text-xs font-light leading-relaxed" style={{color:'rgba(242,242,242,0.4)'}}>
              L&apos;envoi gratuit peut être proposé selon les conditions de reprise et après validation de la demande.
            </p>
            {errors.deliveryMode&&<p style={ES}>{errors.deliveryMode}</p>}
          </div>

          {/* Confirmations — 2 cases obligatoires */}
          <div style={BS}>
            <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>Confirmations obligatoires</p>
            <div className="flex flex-col gap-3">

              {/* Checkbox 1 — Conditions de reprise + propriété */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={confirms.has(0)} disabled={isSending} onChange={()=>toggleConfirm(0)} className="mt-[3px] w-4 h-4 accent-[#ccff33] shrink-0 cursor-pointer"/>
                <span className="text-sm font-light leading-relaxed" style={{color:'rgba(242,242,242,0.7)'}}>
                  J&apos;accepte les{' '}
                  <Link href="/cgv#conditions-reprise" className="underline underline-offset-4 focus-visible:outline-none" style={{color:'rgba(204,255,51,0.7)'}}>conditions de reprise</Link>
                  {' '}et je confirme être propriétaire de l&apos;appareil ou autorisé à le vendre.{' '}
                  <span style={{color:'#ccff33'}}>*</span>
                </span>
              </label>

              {/* Checkbox 2 — Politique confidentialité + données */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={confirms.has(1)} disabled={isSending} onChange={()=>toggleConfirm(1)} className="mt-[3px] w-4 h-4 accent-[#ccff33] shrink-0 cursor-pointer"/>
                <span className="text-sm font-light leading-relaxed" style={{color:'rgba(242,242,242,0.7)'}}>
                  J&apos;accepte la{' '}
                  <Link href="/politique-confidentialite" className="underline underline-offset-4 focus-visible:outline-none" style={{color:'rgba(204,255,51,0.7)'}}>politique de confidentialité</Link>
                  {' '}et je comprends que je dois sauvegarder et supprimer mes données avant toute vente définitive.{' '}
                  <span style={{color:'#ccff33'}}>*</span>
                </span>
              </label>

            </div>
            {errors.confirms&&<p style={ES}>{errors.confirms}</p>}
          </div>

          {/* Protection anti-spam Turnstile */}
          <TurnstileWidget onToken={t=>{ setTurnstileToken(t??''); clearErr('turnstile') }}/>
          {errors.turnstile&&<p style={ES}>{errors.turnstile}</p>}

          {fState==='error'&&apiErr&&(
            <div className="p-4 rounded-lg text-sm font-light leading-relaxed" style={{border:'1px solid rgba(255,100,100,0.25)',background:'rgba(255,100,100,0.05)',color:'rgba(255,150,150,0.9)'}}>
              {apiErr}{' '}
              <span style={{color:'rgba(242,242,242,0.4)'}}>Vous pouvez aussi nous appeler au{' '}
                <a href="tel:+41213204477" className="underline underline-offset-4" style={{color:'rgba(204,255,51,0.7)'}}>021 320 44 77</a>.
              </span>
            </div>
          )}

          <div className="flex justify-between gap-4">
            <BtnPrev onClick={prevStep} disabled={isSending}/>
            <button type="submit" disabled={isSending}
              className="inline-flex items-center justify-center gap-2 font-rubik font-medium leading-none whitespace-nowrap rounded-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40 disabled:cursor-not-allowed shiny-cta shiny-cta-primary text-primary-foreground h-12 px-8 text-sm">
              <span className="inline-flex items-center gap-2">{isSending?'Envoi en cours…':'Recevoir mon offre'}</span>
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
