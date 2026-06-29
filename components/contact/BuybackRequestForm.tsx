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
  locale : 'fr' | 'en' — n'affecte pas l'endpoint ni la logique métier
*/

import { useState, useRef, useId } from 'react'
import Link from 'next/link'
import TurnstileWidget from '@/components/forms/TurnstileWidget'

type FormState = 'idle' | 'sending' | 'success' | 'error'
type Step = 1 | 2 | 3 | 4 | 5
interface CompressedImage { base64: string; originalSize: number; compressedSize: number; filename: string }

const SITE_KEY_CONFIGURED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

/* ── Chaînes de traduction ───────────────────────────────────────── */
const T = {
  fr: {
    deviceTypes:  ['Smartphone','Tablette','Ordinateur portable','Ordinateur fixe','MacBook','iMac','Mac mini','Mac Studio','Montre connectée','Écouteurs','Accessoire','Autre'],
    brands:       ['Apple','Samsung','Huawei','OPPO','Xiaomi','Sony','Google Pixel','Asus','HP','Lenovo','Dell','Garmin','Autre'],
    capacities:   ['32 GB','64 GB','128 GB','256 GB','512 GB','1 TB','2 TB','Je ne sais pas','Non applicable'],
    conditions:   ['Comme neuf','Très bon état','Bon état','Usé','Cassé / pour pièces'],
    screens:      ['Intact','Rayé','Fissuré','Affichage défectueux','Ne s\'allume pas','Non applicable','Je ne sais pas'],
    batteries:    ['Bonne autonomie','Autonomie faible','Batterie à remplacer','Batterie gonflée','Non applicable','Je ne sais pas'],
    powers:       ['Oui','Non','Parfois','Non applicable'],
    locks:        ['iCloud / Localiser / compte Google / compte constructeur désactivé','Encore activé','Je ne sais pas','Non applicable'],
    accessories:  ['Boîte','Chargeur','Câble','Écouteurs','Bracelet','Aucun'],
    paymentOpts:  ['Virement bancaire','TWINT','Paiement / reprise en magasin','Bon d\'achat ClikClak'],
    deliveryOpts: ['Dépôt en boutique à Lausanne','Envoi gratuit selon conditions','À définir avec ClikClak'],
    stepLabels:   ['Appareil','État','Photos','Coordonnées','Récapitulatif'],
    paymentHints: {
      'Virement bancaire':             'L\'IBAN sera demandé uniquement après validation de l\'offre finale par ClikClak.',
      'TWINT':                         'Le numéro TWINT sera confirmé après validation de l\'offre finale.',
      'Paiement / reprise en magasin': 'La reprise pourra être finalisée en boutique après contrôle de l\'appareil.',
      'Bon d\'achat ClikClak':         'Le bon d\'achat éventuel sera confirmé après validation de l\'offre finale.',
    } as Record<string, string>,
    /* Labels */
    selectPlaceholder:  '— Sélectionner —',
    btnNext:            'Suivant →',
    btnPrev:            '← Précédent',
    /* Erreurs */
    errDeviceType:  'Veuillez sélectionner un type d\'appareil.',
    errBrand:       'Veuillez sélectionner une marque.',
    errCondGeneral: 'Veuillez indiquer l\'état général.',
    errCondScreen:  'Veuillez indiquer l\'état de l\'écran.',
    errCondBattery: 'Veuillez indiquer l\'état de la batterie.',
    errPowersOn:    'Veuillez indiquer si l\'appareil s\'allume.',
    errLockState:   'Veuillez indiquer l\'état du verrouillage.',
    errFirstName:   'Veuillez indiquer votre prénom.',
    errLastName:    'Veuillez indiquer votre nom.',
    errEmail:       'Veuillez indiquer votre email.',
    errEmailFmt:    'Email invalide.',
    errPhone:       'Veuillez indiquer votre téléphone.',
    errStreet:      'Veuillez indiquer la rue.',
    errHouseNum:    'Veuillez indiquer le numéro.',
    errPostal:      'Veuillez indiquer le code postal.',
    errCity:        'Veuillez indiquer la localité.',
    errCountry:     'Veuillez indiquer le pays.',
    errPaymentPref: 'Veuillez sélectionner une préférence de paiement.',
    errDelivery:    'Veuillez sélectionner un mode de remise.',
    errConfirms:    'Les deux confirmations sont obligatoires.',
    errTurnstile:   'Veuillez valider la protection anti-spam avant d\'envoyer le formulaire.',
    /* Étape 1 */
    step1Title:     'Votre appareil',
    labelDeviceType:'Type d\'appareil',
    labelBrand:     'Marque',
    labelModel:     'Modèle exact',
    modelPlaceholder:'iPhone 15 Pro, Galaxy S23, MacBook Pro 14", Apple Watch Series 9…',
    labelCapacity:  'Capacité',
    /* Étape 2 */
    step2Title:     'État de l\'appareil',
    labelCondGeneral:'État général',
    labelCondScreen: 'État de l\'écran',
    labelCondBattery:'État de la batterie',
    labelPowersOn:  'L\'appareil s\'allume ?',
    labelLockState: 'Verrouillage (iCloud / Google / Samsung)',
    step2Accessories:'Accessoires inclus',
    /* Étape 3 */
    step3PhotoTitle: 'Photo',
    step3PhotoOpt:   '(optionnel mais recommandé)',
    step3PhotoDesc:  'Ajoutez une photo de face, de dos et de l\'écran si possible. L\'image est compressée avant l\'envoi.',
    step3Delete:     'Supprimer',
    step3Loading:    'Compression…',
    step3Choose:     'Choisir une image',
    step3MsgTitle:   'Message',
    step3MsgOpt:     '(optionnel)',
    step3MsgPlaceholder: 'Ajoutez toute information utile : panne connue, réparation déjà effectuée, état batterie, accessoires, urgence.',
    /* Étape 4 */
    step4Title:     'Vos coordonnées',
    labelFirstName: 'Prénom',
    labelLastName:  'Nom',
    labelEmail:     'Email',
    emailPlaceholder:'votre@email.com',
    labelPhone:     'Téléphone',
    step4AddrTitle: 'Adresse',
    labelStreet:    'Rue',
    streetPlaceholder:'Rue du Petit-Chêne',
    labelHouseNum:  'Numéro',
    labelPostal:    'Code postal',
    labelCity:      'Localité',
    labelCountry:   'Pays',
    defaultCountry: 'Suisse',
    /* Étape 5 */
    step5RecapTitle: 'Récapitulatif de votre demande',
    recapDevice:    'Appareil',
    recapType:      'Type',
    recapBrand:     'Marque',
    recapModel:     'Modèle',
    recapCapacity:  'Capacité',
    recapState:     'État',
    recapGeneral:   'Général',
    recapScreen:    'Écran',
    recapBattery:   'Batterie',
    recapPower:     'Allumage',
    recapLock:      'Verrouillage',
    recapAccessories:'Accessoires',
    recapContact:   'Coordonnées',
    recapName:      'Nom',
    recapEmail:     'Email',
    recapPhone:     'Téléphone',
    recapAddress:   'Adresse',
    recapPhoto:     'Photo',
    recapMsg:       'Message',
    noneLabel:      'Aucun',
    paymentTitle:   'Préférence de paiement',
    deliveryTitle:  'Mode de remise de l\'appareil',
    deliveryNote:   'L\'envoi gratuit peut être proposé selon les conditions de reprise et après validation de la demande.',
    confirmsTitle:  'Confirmations obligatoires',
    confirm1Link:   'conditions de reprise',
    confirm1Href:   '/cgv#conditions-reprise',
    confirm1After:  ' et je confirme être propriétaire de l\'appareil ou autorisé à le vendre.',
    confirm1Before: 'J\'accepte les',
    confirm2Link:   'politique de confidentialité',
    confirm2Href:   '/politique-confidentialite',
    confirm2After:  ' et je comprends que je dois sauvegarder et supprimer mes données avant toute vente définitive.',
    confirm2Before: 'J\'accepte la',
    errPhone2:      'Vous pouvez aussi nous appeler au',
    submitBtn:      'Recevoir mon offre',
    sendingBtn:     'Envoi en cours…',
    stepProgress:   (step: number, label: string) => `Étape ${step} / 5 — ${label}`,
    successMsg:     'Votre demande d\'estimation a bien été envoyée.',
    successRef:     'Référence',
    successRefNote: 'Conservez cette référence pour tout échange avec ClikClak.',
    successEmail:   (email: string) => `Un email de confirmation a été envoyé à ${email}. ClikClak vous répondra avec une offre ou une demande d'information complémentaire.`,
    errImgLoad:     'Erreur image.',
    errNetwork:     'Erreur réseau.',
    errGeneric:     'Une erreur est survenue.',
    imgAlt:         'Aperçu',
  },
  en: {
    deviceTypes:  ['Smartphone','Tablet','Laptop','Desktop computer','MacBook','iMac','Mac mini','Mac Studio','Smartwatch','Earphones','Accessory','Other'],
    brands:       ['Apple','Samsung','Huawei','OPPO','Xiaomi','Sony','Google Pixel','Asus','HP','Lenovo','Dell','Garmin','Other'],
    capacities:   ['32 GB','64 GB','128 GB','256 GB','512 GB','1 TB','2 TB','I don\'t know','Not applicable'],
    conditions:   ['Like new','Very good','Good','Worn','Broken / for parts'],
    screens:      ['Intact','Scratched','Cracked','Display fault','Does not turn on','Not applicable','I don\'t know'],
    batteries:    ['Good battery life','Weak battery life','Battery needs replacing','Swollen battery','Not applicable','I don\'t know'],
    powers:       ['Yes','No','Sometimes','Not applicable'],
    locks:        ['iCloud / Find My / Google account / manufacturer account disabled','Still active','I don\'t know','Not applicable'],
    accessories:  ['Box','Charger','Cable','Earphones','Strap','None'],
    paymentOpts:  ['Bank transfer','TWINT','In-store payment / drop-off','ClikClak gift voucher'],
    deliveryOpts: ['In-store drop-off in Lausanne','Free shipping (conditions apply)','To be agreed with ClikClak'],
    stepLabels:   ['Device','Condition','Photos','Contact','Summary'],
    paymentHints: {
      'Bank transfer':               'Your IBAN will only be requested after final offer validation by ClikClak.',
      'TWINT':                       'Your TWINT number will be confirmed after final offer validation.',
      'In-store payment / drop-off': 'The buyback can be finalised in-store after device inspection.',
      'ClikClak gift voucher':       'Any gift voucher will be confirmed after final offer validation.',
    } as Record<string, string>,
    selectPlaceholder:  '— Select —',
    btnNext:            'Next →',
    btnPrev:            '← Previous',
    errDeviceType:  'Please select a device type.',
    errBrand:       'Please select a brand.',
    errCondGeneral: 'Please indicate the general condition.',
    errCondScreen:  'Please indicate the screen condition.',
    errCondBattery: 'Please indicate the battery condition.',
    errPowersOn:    'Please indicate whether the device powers on.',
    errLockState:   'Please indicate the lock status.',
    errFirstName:   'Please enter your first name.',
    errLastName:    'Please enter your last name.',
    errEmail:       'Please enter your email address.',
    errEmailFmt:    'Invalid email address.',
    errPhone:       'Please enter your phone number.',
    errStreet:      'Please enter your street name.',
    errHouseNum:    'Please enter your house number.',
    errPostal:      'Please enter your postcode.',
    errCity:        'Please enter your city.',
    errCountry:     'Please enter your country.',
    errPaymentPref: 'Please select a payment preference.',
    errDelivery:    'Please select a delivery method.',
    errConfirms:    'Both confirmations are required.',
    errTurnstile:   'Please complete the anti-spam verification before submitting.',
    step1Title:     'Your device',
    labelDeviceType:'Device type',
    labelBrand:     'Brand',
    labelModel:     'Exact model',
    modelPlaceholder:'iPhone 15 Pro, Galaxy S23, MacBook Pro 14", Apple Watch Series 9…',
    labelCapacity:  'Capacity',
    step2Title:     'Device condition',
    labelCondGeneral:'General condition',
    labelCondScreen: 'Screen condition',
    labelCondBattery:'Battery condition',
    labelPowersOn:  'Does the device power on?',
    labelLockState: 'Lock status (iCloud / Google / Samsung)',
    step2Accessories:'Included accessories',
    step3PhotoTitle: 'Photo',
    step3PhotoOpt:   '(optional but recommended)',
    step3PhotoDesc:  'Add a front, back and screen photo if possible. The image is compressed before sending.',
    step3Delete:     'Delete',
    step3Loading:    'Compressing…',
    step3Choose:     'Choose an image',
    step3MsgTitle:   'Message',
    step3MsgOpt:     '(optional)',
    step3MsgPlaceholder: 'Add any useful information: known issue, previous repair, battery condition, accessories, urgency.',
    step4Title:     'Your contact details',
    labelFirstName: 'First name',
    labelLastName:  'Last name',
    labelEmail:     'Email',
    emailPlaceholder:'your@email.com',
    labelPhone:     'Phone',
    step4AddrTitle: 'Address',
    labelStreet:    'Street',
    streetPlaceholder:'Rue du Petit-Chêne',
    labelHouseNum:  'Number',
    labelPostal:    'Postcode',
    labelCity:      'City',
    labelCountry:   'Country',
    defaultCountry: 'Switzerland',
    step5RecapTitle: 'Request summary',
    recapDevice:    'Device',
    recapType:      'Type',
    recapBrand:     'Brand',
    recapModel:     'Model',
    recapCapacity:  'Capacity',
    recapState:     'Condition',
    recapGeneral:   'General',
    recapScreen:    'Screen',
    recapBattery:   'Battery',
    recapPower:     'Powers on',
    recapLock:      'Lock status',
    recapAccessories:'Accessories',
    recapContact:   'Contact',
    recapName:      'Name',
    recapEmail:     'Email',
    recapPhone:     'Phone',
    recapAddress:   'Address',
    recapPhoto:     'Photo',
    recapMsg:       'Message',
    noneLabel:      'None',
    paymentTitle:   'Payment preference',
    deliveryTitle:  'Device delivery method',
    deliveryNote:   'Free shipping may be offered subject to buyback conditions and after request validation.',
    confirmsTitle:  'Required confirmations',
    confirm1Link:   'buyback terms',
    confirm1Href:   '/en/terms-and-conditions',
    confirm1After:  ' and I confirm I am the owner of the device or authorised to sell it.',
    confirm1Before: 'I accept the',
    confirm2Link:   'privacy policy',
    confirm2Href:   '/en/privacy-policy',
    confirm2After:  ' and I understand that I must back up and delete my data before any final sale.',
    confirm2Before: 'I accept the',
    errPhone2:      'You can also call us on',
    submitBtn:      'Get my offer',
    sendingBtn:     'Sending…',
    stepProgress:   (step: number, label: string) => `Step ${step} / 5 — ${label}`,
    successMsg:     'Your estimate request has been sent successfully.',
    successRef:     'Reference',
    successRefNote: 'Keep this reference for any further communication with ClikClak.',
    successEmail:   (email: string) => `A confirmation email has been sent to ${email}. ClikClak will reply with an offer or request for additional information.`,
    errImgLoad:     'Image error.',
    errNetwork:     'Network error.',
    errGeneric:     'An error occurred.',
    imgAlt:         'Preview',
  },
} as const

/* ── Styles ── */
const IS: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(242,242,242,0.13)', borderRadius:8, padding:'12px 16px', fontSize:15, fontWeight:300, color:'rgba(242,242,242,0.9)', outline:'none', appearance:'none', WebkitAppearance:'none' }
const LS: React.CSSProperties = { display:'block', fontSize:12, fontWeight:300, textTransform:'uppercase', letterSpacing:'0.1em', color:'rgba(242,242,242,0.4)', marginBottom:8 }
const ES: React.CSSProperties = { fontSize:12, fontWeight:300, color:'rgba(255,100,100,0.85)', marginTop:6 }
const BS: React.CSSProperties = { border:'1px solid rgba(242,242,242,0.08)', background:'rgba(255,255,255,0.02)', borderRadius:12, padding:24, display:'flex', flexDirection:'column', gap:16 }
const rg = (f:string,n:string): React.CSSProperties => f===n?{borderColor:'rgba(204,255,51,0.55)',boxShadow:'0 0 0 2px rgba(204,255,51,0.1)'}:{}

/* ── Compression ── */
function compressImage(file:File): Promise<CompressedImage> {
  return new Promise((resolve,reject) => {
    if (!file.type.startsWith('image/')) { reject(new Error('File must be an image.')); return }
    if (file.size > 10*1024*1024) { reject(new Error('File too large (max 10 MB).')); return }
    const r=new FileReader()
    r.onerror=()=>reject(new Error('Could not read file.'))
    r.onload=ev=>{
      const img=new window.Image()
      img.onerror=()=>reject(new Error('Could not decode image.'))
      img.onload=()=>{
        let{width:w,height:h}=img
        if(w>1600||h>1600){if(w>=h){h=Math.round(h*1600/w);w=1600}else{w=Math.round(w*1600/h);h=1600}}
        const c=document.createElement('canvas');c.width=w;c.height=h
        const ctx=c.getContext('2d');if(!ctx){reject(new Error('Canvas unavailable.'));return}
        ctx.drawImage(img,0,0,w,h)
        c.toBlob(blob=>{
          if(!blob){reject(new Error('Compression failed.'));return}
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
const fmt=(b:number)=>b<1048576?`${(b/1024).toFixed(0)} KB`:`${(b/1048576).toFixed(1)} MB`

/* ════════════════════════════════════════════════════════════════════ */
export default function BuybackRequestForm({ locale = 'fr' }: { locale?: 'fr' | 'en' }) {
  const L = T[locale]
  const uid=useId()
  const [step,setStep]=useState<Step>(1)

  const [deviceType,setDeviceType]=useState('')
  const [brand,setBrand]=useState('')
  const [model,setModel]=useState('')
  const [capacity,setCapacity]=useState('')

  const [condGeneral,setCondGeneral]=useState('')
  const [condScreen,setCondScreen]=useState('')
  const [condBattery,setCondBattery]=useState('')
  const [powersOn,setPowersOn]=useState('')
  const [lockState,setLockState]=useState('')
  const [accs,setAccs]=useState<Set<string>>(new Set())

  const [message,setMessage]=useState('')
  const [image,setImage]=useState<CompressedImage|null>(null)
  const [imgPreview,setImgPreview]=useState('')
  const [imgErr,setImgErr]=useState('')
  const [imgLoading,setImgLoading]=useState(false)
  const fileRef=useRef<HTMLInputElement>(null)

  const [firstName,setFirstName]=useState('')
  const [lastName,setLastName]=useState('')
  const [email,setEmail]=useState('')
  const [phone,setPhone]=useState('')
  const [street,setStreet]=useState('')
  const [houseNum,setHouseNum]=useState('')
  const [postal,setPostal]=useState('')
  const [city,setCity]=useState('')
  const [country,setCountry]=useState<string>(L.defaultCountry)

  const [paymentPref,setPaymentPref]=useState('')
  const [deliveryMode,setDeliveryMode]=useState('')
  const [confirms,setConfirms]=useState<Set<number>>(new Set())
  const [turnstileToken,setTurnstileToken]=useState('')

  const [errors,setErrors]=useState<Record<string,string>>({})
  const [fState,setFState]=useState<FormState>('idle')
  const [apiErr,setApiErr]=useState('')
  const [reference,setReference]=useState('')
  const [focused,setFocused]=useState('')

  const clearErr=(k:string)=>setErrors(p=>{const n={...p};delete n[k];return n})

  const toggleAcc=(a:string)=>setAccs(p=>{const n=new Set(p);if(n.has(a))n.delete(a);else{const noneVal=L.accessories[L.accessories.length-1];if(a===noneVal)n.clear();else n.delete(noneVal);n.add(a)};return n})
  const toggleConfirm=(i:number)=>setConfirms(p=>{const n=new Set(p);if(n.has(i)){n.delete(i)}else{n.add(i)};return n})

  const handleFile=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0];if(!f)return
    setImgErr('');setImgLoading(true)
    try{const c=await compressImage(f);setImage(c);setImgPreview(c.base64)}
    catch(err){setImgErr(err instanceof Error?err.message:L.errImgLoad)}
    finally{setImgLoading(false);if(fileRef.current)fileRef.current.value=''}
  }
  const removeImage=()=>{setImage(null);setImgPreview('');setImgErr('');if(fileRef.current)fileRef.current.value=''}

  const validateStep=(s:Step):boolean=>{
    const e:Record<string,string>={}
    if(s===1){
      if(!deviceType)e.deviceType=L.errDeviceType
      if(!brand)e.brand=L.errBrand
    }
    if(s===2){
      if(!condGeneral)e.condGeneral=L.errCondGeneral
      if(!condScreen)e.condScreen=L.errCondScreen
      if(!condBattery)e.condBattery=L.errCondBattery
      if(!powersOn)e.powersOn=L.errPowersOn
      if(!lockState)e.lockState=L.errLockState
    }
    if(s===4){
      if(!firstName.trim())e.firstName=L.errFirstName
      if(!lastName.trim())e.lastName=L.errLastName
      if(!email.trim())e.email=L.errEmail
      else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))e.email=L.errEmailFmt
      if(!phone.trim())e.phone=L.errPhone
      if(!street.trim())e.street=L.errStreet
      if(!houseNum.trim())e.houseNum=L.errHouseNum
      if(!postal.trim())e.postal=L.errPostal
      if(!city.trim())e.city=L.errCity
      if(!country.trim())e.country=L.errCountry
    }
    if(s===5){
      if(!paymentPref)e.paymentPref=L.errPaymentPref
      if(!deliveryMode)e.deliveryMode=L.errDelivery
      if(confirms.size<2)e.confirms=L.errConfirms
      if(SITE_KEY_CONFIGURED&&!turnstileToken)e.turnstile=L.errTurnstile
    }
    setErrors(e)
    return Object.keys(e).length===0
  }

  const nextStep=()=>{if(validateStep(step))setStep(s=>(s+1)as Step)}
  const prevStep=()=>{setErrors({});setStep(s=>(s-1)as Step)}

  const handleSubmit=async(ev:React.FormEvent)=>{
    ev.preventDefault()
    if(!validateStep(5))return
    setFState('sending');setApiErr('')

    const payload:Record<string,unknown>={
      name:`${firstName.trim()} ${lastName.trim()}`,
      firstName:firstName.trim(),lastName:lastName.trim(),
      email:email.trim(),phone:phone.trim(),
      serviceLabel:'Estimation rachat appareil',
      locale,
      deviceType,brand,model:model.trim(),deviceCapacity:capacity,
      conditionGeneral:condGeneral,conditionScreen:condScreen,conditionBattery:condBattery,
      powerState:powersOn,lockState,accessories:Array.from(accs).join(', ')||L.noneLabel,
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
      if(!res.ok){setApiErr(json.error??L.errGeneric);setFState('error')}
      else{setReference(json.reference??'');setFState('success')}
    }catch{setApiErr(L.errNetwork);setFState('error')}
  }

  if(fState==='success'){
    return(
      <div className="flex flex-col gap-5 items-start p-8 rounded-xl" style={{border:'1px solid rgba(204,255,51,0.25)',background:'rgba(204,255,51,0.04)'}}>
        <span className="text-3xl" aria-hidden>✓</span>
        <div className="flex flex-col gap-3">
          <p className="text-base font-light" style={{color:'rgba(242,242,242,0.9)'}}>{L.successMsg}</p>
          {reference&&(
            <div className="flex flex-col gap-1">
              <p className="text-xs font-light uppercase tracking-[0.12em]" style={{color:'rgba(242,242,242,0.4)'}}>{L.successRef}</p>
              <p className="text-lg font-light" style={{color:'#ccff33'}}>{reference}</p>
              <p className="text-xs font-light" style={{color:'rgba(242,242,242,0.4)'}}>{L.successRefNote}</p>
            </div>
          )}
          <p className="text-sm font-light" style={{color:'rgba(242,242,242,0.5)'}}>{L.successEmail(email)}</p>
        </div>
      </div>
    )
  }

  const isSending=fState==='sending'

  const StepBar=()=>(
    <div className="flex flex-col gap-2 mb-6">
      <div className="flex items-center gap-1.5">
        {([1,2,3,4,5]as Step[]).map(n=>(
          <div key={n} style={{height:4,borderRadius:2,flex:n<=step?2:1,background:n<=step?'#ccff33':'rgba(242,242,242,0.12)',transition:'flex 250ms ease,background 250ms ease'}}/>
        ))}
      </div>
      <p className="text-xs font-light" style={{color:'rgba(242,242,242,0.4)'}}>
        {L.stepProgress(step, L.stepLabels[step-1])}
      </p>
    </div>
  )

  function BtnNext({onClick}:{onClick:()=>void}) {
    return (
      <button type="button" onClick={onClick}
        className="inline-flex items-center justify-center gap-2 font-rubik font-medium leading-none whitespace-nowrap rounded-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background shiny-cta shiny-cta-primary text-primary-foreground h-12 px-8 text-sm">
        {L.btnNext}
      </button>
    )
  }
  function BtnPrev({onClick,disabled}:{onClick:()=>void,disabled?:boolean}) {
    return (
      <button type="button" onClick={onClick} disabled={disabled}
        className="inline-flex items-center gap-2 h-12 px-6 text-sm font-rubik font-medium rounded-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40"
        style={{border:'1px solid rgba(242,242,242,0.15)',color:'rgba(242,242,242,0.6)'}}>
        {L.btnPrev}
      </button>
    )
  }

  function Sel({id,label,required,value,onChange,options,disabled,error}:{
    id:string,label:string,required?:boolean,value:string,onChange:(v:string)=>void,
    options:readonly string[],disabled?:boolean,error?:string
  }) {
    return (
      <div>
        <label htmlFor={id} style={LS}>{label} {required&&<span style={{color:'#ccff33'}}>*</span>}</label>
        <select id={id} disabled={disabled} value={value}
          onChange={e=>{onChange(e.target.value);clearErr(id)}}
          onFocus={()=>setFocused(id)} onBlur={()=>setFocused('')}
          style={{...IS,...rg(focused,id),cursor:'pointer'}}>
          <option value="">{L.selectPlaceholder}</option>
          {options.map(o=><option key={o}>{o}</option>)}
        </select>
        {error&&<p style={ES}>{error}</p>}
      </div>
    )
  }

  return(
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-0">
      {/* Honeypot anti-spam */}
      <div aria-hidden style={{position:'absolute',left:'-9999px',width:1,height:1,overflow:'hidden'}}>
        <input type="text" name="org_url" tabIndex={-1} autoComplete="nope" aria-hidden="true"
          data-1p-ignore="true" data-lpignore="true" data-form-type="other" defaultValue=""/>
      </div>
      <StepBar/>

      {/* ══ STEP 1 ══ */}
      {step===1&&(
        <div className="flex flex-col gap-5">
          <div style={BS}>
            <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>{L.step1Title}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Sel id={`${uid}-dt`} label={L.labelDeviceType} required value={deviceType} onChange={v=>{setDeviceType(v);clearErr(`${uid}-dt`)}} options={L.deviceTypes} error={errors.deviceType}/>
              <Sel id={`${uid}-br`} label={L.labelBrand} required value={brand} onChange={v=>{setBrand(v);clearErr(`${uid}-br`)}} options={L.brands} error={errors.brand}/>
            </div>
            <div>
              <label htmlFor={`${uid}-mo`} style={LS}>{L.labelModel}</label>
              <input id={`${uid}-mo`} type="text" disabled={isSending}
                placeholder={L.modelPlaceholder}
                value={model} onChange={e=>setModel(e.target.value)}
                onFocus={()=>setFocused(`${uid}-mo`)} onBlur={()=>setFocused('')}
                style={{...IS,...rg(focused,`${uid}-mo`)}}/>
            </div>
            <Sel id={`${uid}-cap`} label={L.labelCapacity} value={capacity} onChange={setCapacity} options={L.capacities}/>
          </div>
          <div className="flex justify-end"><BtnNext onClick={nextStep}/></div>
        </div>
      )}

      {/* ══ STEP 2 ══ */}
      {step===2&&(
        <div className="flex flex-col gap-5">
          <div style={BS}>
            <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>{L.step2Title}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Sel id={`${uid}-cg`} label={L.labelCondGeneral} required value={condGeneral} onChange={v=>{setCondGeneral(v);clearErr(`${uid}-cg`)}} options={L.conditions} error={errors.condGeneral}/>
              <Sel id={`${uid}-cs`} label={L.labelCondScreen} required value={condScreen} onChange={v=>{setCondScreen(v);clearErr(`${uid}-cs`)}} options={L.screens} error={errors.condScreen}/>
              <Sel id={`${uid}-cb`} label={L.labelCondBattery} required value={condBattery} onChange={v=>{setCondBattery(v);clearErr(`${uid}-cb`)}} options={L.batteries} error={errors.condBattery}/>
              <Sel id={`${uid}-po`} label={L.labelPowersOn} required value={powersOn} onChange={v=>{setPowersOn(v);clearErr(`${uid}-po`)}} options={L.powers} error={errors.powersOn}/>
            </div>
            <Sel id={`${uid}-ls`} label={L.labelLockState} required value={lockState} onChange={v=>{setLockState(v);clearErr(`${uid}-ls`)}} options={L.locks} error={errors.lockState}/>
          </div>
          <div style={BS}>
            <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>{L.step2Accessories}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {L.accessories.map(a=>{const checked=accs.has(a);return(
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

      {/* ══ STEP 3 ══ */}
      {step===3&&(
        <div className="flex flex-col gap-5">
          <div style={BS}>
            <div>
              <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>{L.step3PhotoTitle} <span style={{color:'rgba(242,242,242,0.25)',textTransform:'none',fontSize:11,letterSpacing:0}}>{L.step3PhotoOpt}</span></p>
              <p className="text-xs font-light mt-1" style={{color:'rgba(242,242,242,0.4)'}}>{L.step3PhotoDesc}</p>
            </div>
            {imgPreview&&image?(
              <div className="flex flex-col gap-3">
                <div className="relative w-full max-w-sm rounded-lg overflow-hidden" style={{border:'1px solid rgba(242,242,242,0.12)'}}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgPreview} alt={L.imgAlt} className="w-full object-contain" style={{maxHeight:220}}/>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs font-light" style={{color:'rgba(242,242,242,0.4)'}}>{image.filename} — {fmt(image.originalSize)} → <span style={{color:'rgba(204,255,51,0.7)'}}>{fmt(image.compressedSize)}</span></p>
                  <button type="button" onClick={removeImage} className="text-xs font-light underline underline-offset-4 focus-visible:outline-none" style={{color:'rgba(242,242,242,0.4)'}}>{L.step3Delete}</button>
                </div>
              </div>
            ):(
              <div>
                <input ref={fileRef} type="file" accept="image/*" id={`${uid}-ph`} disabled={isSending||imgLoading} onChange={handleFile} className="sr-only"/>
                <label htmlFor={`${uid}-ph`} style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',border:'1px dashed rgba(242,242,242,0.2)',borderRadius:8,fontSize:14,fontWeight:300,color:imgLoading?'rgba(242,242,242,0.3)':'rgba(242,242,242,0.6)',cursor:isSending?'not-allowed':'pointer'}}>
                  {imgLoading?L.step3Loading:L.step3Choose}
                </label>
                {imgErr&&<p style={{...ES,marginTop:8}}>{imgErr}</p>}
              </div>
            )}
          </div>
          <div style={BS}>
            <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>{L.step3MsgTitle} <span style={{color:'rgba(242,242,242,0.25)',textTransform:'none',fontSize:11,letterSpacing:0}}>{L.step3MsgOpt}</span></p>
            <textarea rows={4} disabled={isSending}
              placeholder={L.step3MsgPlaceholder}
              value={message} onChange={e=>setMessage(e.target.value)}
              onFocus={()=>setFocused('msg')} onBlur={()=>setFocused('')}
              style={{...IS,...rg(focused,'msg'),resize:'vertical',minHeight:90,lineHeight:1.7}}/>
          </div>
          <div className="flex justify-between gap-4"><BtnPrev onClick={prevStep}/><BtnNext onClick={nextStep}/></div>
        </div>
      )}

      {/* ══ STEP 4 ══ */}
      {step===4&&(
        <div className="flex flex-col gap-5">
          <div style={BS}>
            <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>{L.step4Title}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([['fn',L.labelFirstName,firstName,setFirstName],['ln',L.labelLastName,lastName,setLastName]] as const).map(([k,l,v,s])=>(
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
                <label htmlFor={`${uid}-em`} style={LS}>{L.labelEmail} <span style={{color:'#ccff33'}}>*</span></label>
                <input id={`${uid}-em`} type="email" autoComplete="email" placeholder={L.emailPlaceholder} disabled={isSending}
                  value={email} onChange={e=>{setEmail(e.target.value);clearErr('email')}}
                  onFocus={()=>setFocused('email')} onBlur={()=>setFocused('')}
                  style={{...IS,...rg(focused,'email')}}/>
                {errors.email&&<p style={ES}>{errors.email}</p>}
              </div>
              <div>
                <label htmlFor={`${uid}-ph2`} style={LS}>{L.labelPhone} <span style={{color:'#ccff33'}}>*</span></label>
                <input id={`${uid}-ph2`} type="tel" autoComplete="tel" placeholder="021 XXX XX XX" disabled={isSending}
                  value={phone} onChange={e=>{setPhone(e.target.value);clearErr('phone')}}
                  onFocus={()=>setFocused('phone')} onBlur={()=>setFocused('')}
                  style={{...IS,...rg(focused,'phone')}}/>
                {errors.phone&&<p style={ES}>{errors.phone}</p>}
              </div>
            </div>
          </div>
          <div style={BS}>
            <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>{L.step4AddrTitle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor={`${uid}-st`} style={LS}>{L.labelStreet} <span style={{color:'#ccff33'}}>*</span></label>
                <input id={`${uid}-st`} type="text" placeholder={L.streetPlaceholder} disabled={isSending}
                  value={street} onChange={e=>{setStreet(e.target.value);clearErr('street')}}
                  onFocus={()=>setFocused('street')} onBlur={()=>setFocused('')}
                  style={{...IS,...rg(focused,'street')}}/>
                {errors.street&&<p style={ES}>{errors.street}</p>}
              </div>
              <div>
                <label htmlFor={`${uid}-hn`} style={LS}>{L.labelHouseNum} <span style={{color:'#ccff33'}}>*</span></label>
                <input id={`${uid}-hn`} type="text" placeholder="9b" disabled={isSending}
                  value={houseNum} onChange={e=>{setHouseNum(e.target.value);clearErr('houseNum')}}
                  onFocus={()=>setFocused('hn')} onBlur={()=>setFocused('')}
                  style={{...IS,...rg(focused,'hn')}}/>
                {errors.houseNum&&<p style={ES}>{errors.houseNum}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor={`${uid}-po`} style={LS}>{L.labelPostal} <span style={{color:'#ccff33'}}>*</span></label>
                <input id={`${uid}-po`} type="text" placeholder="1003" disabled={isSending}
                  value={postal} onChange={e=>{setPostal(e.target.value);clearErr('postal')}}
                  onFocus={()=>setFocused('postal')} onBlur={()=>setFocused('')}
                  style={{...IS,...rg(focused,'postal')}}/>
                {errors.postal&&<p style={ES}>{errors.postal}</p>}
              </div>
              <div>
                <label htmlFor={`${uid}-ci`} style={LS}>{L.labelCity} <span style={{color:'#ccff33'}}>*</span></label>
                <input id={`${uid}-ci`} type="text" placeholder="Lausanne" disabled={isSending}
                  value={city} onChange={e=>{setCity(e.target.value);clearErr('city')}}
                  onFocus={()=>setFocused('city')} onBlur={()=>setFocused('')}
                  style={{...IS,...rg(focused,'city')}}/>
                {errors.city&&<p style={ES}>{errors.city}</p>}
              </div>
              <div>
                <label htmlFor={`${uid}-co`} style={LS}>{L.labelCountry} <span style={{color:'#ccff33'}}>*</span></label>
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

      {/* ══ STEP 5 ══ */}
      {step===5&&(
        <div className="flex flex-col gap-5">
          <div style={BS}>
            <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>{L.step5RecapTitle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-light uppercase tracking-[0.1em]" style={{color:'rgba(242,242,242,0.35)'}}>{L.recapDevice}</p>
                {[[deviceType,L.recapType],[brand,L.recapBrand],[model||'—',L.recapModel],[capacity||'—',L.recapCapacity]].map(([v,l])=>(
                  <div key={l as string} className="flex flex-col gap-0.5">
                    <span className="text-xs font-light" style={{color:'rgba(242,242,242,0.35)'}}>{l}</span>
                    <span className="text-sm font-light" style={{color:'rgba(242,242,242,0.85)'}}>{v||'—'}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-xs font-light uppercase tracking-[0.1em]" style={{color:'rgba(242,242,242,0.35)'}}>{L.recapState}</p>
                {[[condGeneral,L.recapGeneral],[condScreen,L.recapScreen],[condBattery,L.recapBattery],[powersOn,L.recapPower],[lockState,L.recapLock],[Array.from(accs).join(', ')||L.noneLabel,L.recapAccessories]].map(([v,l])=>(
                  <div key={l as string} className="flex flex-col gap-0.5">
                    <span className="text-xs font-light" style={{color:'rgba(242,242,242,0.35)'}}>{l}</span>
                    <span className="text-sm font-light" style={{color:'rgba(242,242,242,0.85)'}}>{v||'—'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2" style={{borderTop:'1px solid rgba(242,242,242,0.07)'}}>
              <p className="text-xs font-light uppercase tracking-[0.1em] mb-3" style={{color:'rgba(242,242,242,0.35)'}}>{L.recapContact}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  [`${firstName} ${lastName}`,L.recapName],
                  [email,L.recapEmail],
                  [phone,L.recapPhone],
                  [`${street} ${houseNum}, ${postal} ${city}, ${country}`,L.recapAddress],
                ].map(([v,l])=>(
                  <div key={l as string} className="flex flex-col gap-0.5">
                    <span className="text-xs font-light" style={{color:'rgba(242,242,242,0.35)'}}>{l}</span>
                    <span className="text-sm font-light" style={{color:'rgba(242,242,242,0.85)'}}>{v||'—'}</span>
                  </div>
                ))}
              </div>
            </div>
            {image&&<p className="text-xs font-light" style={{color:'rgba(242,242,242,0.4)'}}>{L.recapPhoto} : {image.filename} ({fmt(image.compressedSize)})</p>}
            {message&&(
              <div className="pt-2" style={{borderTop:'1px solid rgba(242,242,242,0.07)'}}>
                <p className="text-xs font-light uppercase tracking-[0.1em] mb-1" style={{color:'rgba(242,242,242,0.35)'}}>{L.recapMsg}</p>
                <p className="text-sm font-light" style={{color:'rgba(242,242,242,0.7)'}}>{message}</p>
              </div>
            )}
          </div>

          <div style={BS}>
            <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>{L.paymentTitle} <span style={{color:'#ccff33'}}>*</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {L.paymentOpts.map(opt=>{const sel=paymentPref===opt;return(
                <label key={opt} className="flex items-center gap-3 cursor-pointer select-none rounded-lg px-3 py-3"
                  style={{border:`1px solid ${sel?'rgba(204,255,51,0.3)':'rgba(242,242,242,0.08)'}`,background:sel?'rgba(204,255,51,0.05)':'rgba(255,255,255,0.02)',transition:'border-color 150ms,background 150ms'}}>
                  <input type="radio" name="payment" checked={sel} disabled={isSending}
                    onChange={()=>{setPaymentPref(opt);clearErr('paymentPref')}}
                    className="w-4 h-4 accent-[#ccff33] shrink-0"/>
                  <span className="text-sm font-light" style={{color:sel?'rgba(242,242,242,0.9)':'rgba(242,242,242,0.6)'}}>{opt}</span>
                </label>
              )})}
            </div>
            {paymentPref&&L.paymentHints[paymentPref]&&(
              <p className="text-xs font-light leading-relaxed pl-3" style={{color:'rgba(242,242,242,0.5)',borderLeft:'2px solid rgba(204,255,51,0.3)'}}>{L.paymentHints[paymentPref]}</p>
            )}
            {errors.paymentPref&&<p style={ES}>{errors.paymentPref}</p>}
          </div>

          <div style={BS}>
            <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>{L.deliveryTitle} <span style={{color:'#ccff33'}}>*</span></p>
            <div className="flex flex-col gap-2">
              {L.deliveryOpts.map(opt=>{const sel=deliveryMode===opt;return(
                <label key={opt} className="flex items-center gap-3 cursor-pointer select-none rounded-lg px-3 py-3"
                  style={{border:`1px solid ${sel?'rgba(204,255,51,0.3)':'rgba(242,242,242,0.08)'}`,background:sel?'rgba(204,255,51,0.05)':'rgba(255,255,255,0.02)',transition:'border-color 150ms,background 150ms'}}>
                  <input type="radio" name="delivery" checked={sel} disabled={isSending}
                    onChange={()=>{setDeliveryMode(opt);clearErr('deliveryMode')}}
                    className="w-4 h-4 accent-[#ccff33] shrink-0"/>
                  <span className="text-sm font-light" style={{color:sel?'rgba(242,242,242,0.9)':'rgba(242,242,242,0.6)'}}>{opt}</span>
                </label>
              )})}
            </div>
            <p className="text-xs font-light leading-relaxed" style={{color:'rgba(242,242,242,0.4)'}}>{L.deliveryNote}</p>
            {errors.deliveryMode&&<p style={ES}>{errors.deliveryMode}</p>}
          </div>

          <div style={BS}>
            <p className="text-xs font-light uppercase tracking-[0.15em]" style={{color:'#ccff33'}}>{L.confirmsTitle}</p>
            <div className="flex flex-col gap-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={confirms.has(0)} disabled={isSending} onChange={()=>toggleConfirm(0)} className="mt-[3px] w-4 h-4 accent-[#ccff33] shrink-0 cursor-pointer"/>
                <span className="text-sm font-light leading-relaxed" style={{color:'rgba(242,242,242,0.7)'}}>
                  {L.confirm1Before}{' '}
                  <Link href={L.confirm1Href} className="underline underline-offset-4 focus-visible:outline-none" style={{color:'rgba(204,255,51,0.7)'}}>{L.confirm1Link}</Link>
                  {L.confirm1After}{' '}
                  <span style={{color:'#ccff33'}}>*</span>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={confirms.has(1)} disabled={isSending} onChange={()=>toggleConfirm(1)} className="mt-[3px] w-4 h-4 accent-[#ccff33] shrink-0 cursor-pointer"/>
                <span className="text-sm font-light leading-relaxed" style={{color:'rgba(242,242,242,0.7)'}}>
                  {L.confirm2Before}{' '}
                  <Link href={L.confirm2Href} className="underline underline-offset-4 focus-visible:outline-none" style={{color:'rgba(204,255,51,0.7)'}}>{L.confirm2Link}</Link>
                  {L.confirm2After}{' '}
                  <span style={{color:'#ccff33'}}>*</span>
                </span>
              </label>
            </div>
            {errors.confirms&&<p style={ES}>{errors.confirms}</p>}
          </div>

          <TurnstileWidget onToken={t=>{ setTurnstileToken(t??''); clearErr('turnstile') }}/>
          {errors.turnstile&&<p style={ES}>{errors.turnstile}</p>}

          {fState==='error'&&apiErr&&(
            <div className="p-4 rounded-lg text-sm font-light leading-relaxed" style={{border:'1px solid rgba(255,100,100,0.25)',background:'rgba(255,100,100,0.05)',color:'rgba(255,150,150,0.9)'}}>
              {apiErr}{' '}
              <span style={{color:'rgba(242,242,242,0.4)'}}>{L.errPhone2}{' '}
                <a href="tel:+41213204477" className="underline underline-offset-4" style={{color:'rgba(204,255,51,0.7)'}}>021 320 44 77</a>.
              </span>
            </div>
          )}

          <div className="flex justify-between gap-4">
            <BtnPrev onClick={prevStep} disabled={isSending}/>
            <button type="submit" disabled={isSending}
              className="inline-flex items-center justify-center gap-2 font-rubik font-medium leading-none whitespace-nowrap rounded-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40 disabled:cursor-not-allowed shiny-cta shiny-cta-primary text-primary-foreground h-12 px-8 text-sm">
              <span className="inline-flex items-center gap-2">{isSending?L.sendingBtn:L.submitBtn}</span>
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
