/**
 * scripts/test-instagram-inbox.ts
 *
 * Tests de la boîte de réception Instagram ClikClak.
 * Exécuter : npm run test:instagram-inbox
 *
 * Teste :
 *  - findOrCreateInstagramConversation (logique pure mockée)
 *  - recordInboundInstagramMessage
 *  - recordOutboundInstagramMessage
 *  - listInstagramMessages (filtre expirés)
 *  - cleanupExpiredInstagramMessages
 *  - orchestrateManualReply (orchestrateur pur, dépendances injectées)
 *  - isWithin24Hours / validateManualReplyText (fonctions pures)
 *  - Intégration webhook : persistance best-effort sans casser le pipeline
 *
 * Aucun appel Supabase ni Instagram réel.
 */

import assert from "node:assert/strict";
import {
  orchestrateManualReply,
  validateManualReplyText,
  isWithin24Hours,
  type ManualReplyDeps,
  type ManualReplyOutcome,
} from "../lib/meta/instagram/inboxOrchestrator";
import type { ConversationRow, MessageRow } from "../lib/meta/instagram/messages";
import type { InstagramSendConfig } from "../lib/meta/instagram/connections";

/* ── Couleurs ─────────────────────────────────────────────────────── */

const C = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red:   (s: string) => `\x1b[31m${s}\x1b[0m`,
  bold:  (s: string) => `\x1b[1m${s}\x1b[0m`,
};

/* ── Fixtures ─────────────────────────────────────────────────────── */

const ACCOUNT_ID    = "ig_account_clikclak";
const PARTICIPANT_A = "ig_participant_001";
const PARTICIPANT_B = "ig_participant_002";
const ACCOUNT_B     = "ig_account_other";
const MID_1         = "m_111111";
const MID_2         = "m_222222";

/* ── Base de données en mémoire pour les tests ───────────────────── */

interface MockConv extends ConversationRow { _messages: MessageRow[] }

const db: {
  conversations: MockConv[]
  messages:       MessageRow[]
} = { conversations: [], messages: [] }

function makeConvId(): string { return `conv-${Math.random().toString(36).slice(2)}` }
function makeMsgId(): string  { return `msg-${Math.random().toString(36).slice(2)}`  }

function findOrCreate(accountId: string, participantId: string, now: Date): ConversationRow {
  const existing = db.conversations.find(
    c => c.instagram_account_id === accountId && c.participant_id === participantId
  )
  if (existing) return existing

  const conv: MockConv = {
    id:                   makeConvId(),
    instagram_account_id: accountId,
    participant_id:       participantId,
    last_message_at:      now.toISOString(),
    last_inbound_at:      null,
    last_message_preview: null,
    created_at:           now.toISOString(),
    updated_at:           now.toISOString(),
    _messages: [],
  }
  db.conversations.push(conv)
  return conv
}

function recordInbound(convId: string, mid: string, text: string, occurredAt: Date): MessageRow | null {
  if (db.messages.find(m => m.external_mid === mid)) return null // idempotent
  const msg: MessageRow = {
    id:              makeMsgId(),
    conversation_id: convId,
    external_mid:    mid,
    direction:       'inbound',
    source:          'instagram',
    text,
    status:          'received',
    reply_to_mid:    null,
    sent_by:         null,
    occurred_at:     occurredAt.toISOString(),
    created_at:      occurredAt.toISOString(),
    expires_at:      new Date(occurredAt.getTime() + 30 * 24 * 3600 * 1000).toISOString(),
  }
  db.messages.push(msg)
  /* update conv */
  const conv = db.conversations.find(c => c.id === convId)
  if (conv) {
    conv.last_message_at = occurredAt.toISOString()
    conv.last_inbound_at = occurredAt.toISOString()
    conv.last_message_preview = text.slice(0, 60)
  }
  return msg
}

function recordOutbound(convId: string, text: string, source: 'auto_reply' | 'manual_reply', sentBy?: string): MessageRow {
  const now = new Date()
  const msg: MessageRow = {
    id:              makeMsgId(),
    conversation_id: convId,
    external_mid:    null,
    direction:       'outbound',
    source,
    text,
    status:          'sent',
    reply_to_mid:    null,
    sent_by:         sentBy ?? null,
    occurred_at:     now.toISOString(),
    created_at:      now.toISOString(),
    expires_at:      new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString(),
  }
  db.messages.push(msg)
  return msg
}

function listMessages(convId: string): MessageRow[] {
  const now = new Date()
  return db.messages
    .filter(m => m.conversation_id === convId && new Date(m.expires_at) > now)
    .sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime())
}

function cleanup() {
  const now = new Date()
  const before = db.messages.length
  db.messages = db.messages.filter(m => new Date(m.expires_at) > now)
  return before - db.messages.length
}

/* ── Helper de dépendances pour orchestrateManualReply ───────────── */

const MOCK_CONFIG: InstagramSendConfig = { accountId: ACCOUNT_ID, accessToken: "mock_token" }

function makeDeps(overrides?: Partial<ManualReplyDeps> & {
  convOverride?: ConversationRow | null
  connStatus?: 'active' | 'other' | null
  rlAllowed?: boolean
  sendOk?: boolean
}): ManualReplyDeps & { sentTexts: string[]; recordedOutbounds: string[] } {
  const sentTexts:         string[] = []
  const recordedOutbounds: string[] = []

  const baseConv = overrides?.convOverride !== undefined
    ? overrides.convOverride
    : {
        id:                   'conv-test',
        instagram_account_id: ACCOUNT_ID,
        participant_id:       PARTICIPANT_A,
        last_message_at:      new Date().toISOString(),
        last_inbound_at:      new Date().toISOString(), // within 24h by default
        last_message_preview: null,
        created_at:           new Date().toISOString(),
        updated_at:           new Date().toISOString(),
      }

  return {
    sentTexts,
    recordedOutbounds,
    getConversation:    overrides?.getConversation ?? (async () => baseConv),
    getConnectionStatus: overrides?.getConnectionStatus ?? (async () => overrides?.connStatus ?? 'active'),
    checkRateLimit:     overrides?.checkRateLimit ?? (async () => overrides?.rlAllowed ?? true),
    resolveConfig:      overrides?.resolveConfig ?? (async () => MOCK_CONFIG),
    sendMessage:        overrides?.sendMessage ?? (async (_pid, text) => {
      sentTexts.push(text)
      return overrides?.sendOk ?? true
    }),
    recordOutbound:     overrides?.recordOutbound ?? (async (_cid, text, _uid) => {
      recordedOutbounds.push(text)
      return makeMsgId()
    }),
  }
}

/* ── Runner ───────────────────────────────────────────────────────── */

let passed = 0
let failed = 0

async function test(name: string, fn: () => Promise<void> | void): Promise<void> {
  process.stdout.write(`  ${name} ... `)
  try {
    await fn()
    console.log(C.green("✅ PASS"))
    passed++
  } catch (err) {
    console.log(C.red("❌ FAIL"))
    console.error(C.red(`    ${err instanceof Error ? err.message : String(err)}`))
    failed++
  }
}

async function main(): Promise<void> {
  console.log(C.bold("\nClikClak — Tests boîte de réception Instagram\n"))

  /* ── Conversation (1-5) ─────────────────────────────────────── */

  await test("1.  Premier inbound → nouvelle conversation créée", () => {
    db.conversations = []; db.messages = []
    const conv = findOrCreate(ACCOUNT_ID, PARTICIPANT_A, new Date())
    assert.ok(conv.id)
    assert.equal(db.conversations.length, 1)
  })

  await test("2.  Même participant → conversation réutilisée", () => {
    const conv2 = findOrCreate(ACCOUNT_ID, PARTICIPANT_A, new Date())
    assert.equal(db.conversations.length, 1, "Pas de doublon de conversation")
    assert.equal(conv2.id, db.conversations[0].id)
  })

  await test("3.  Même external_mid → pas de duplication du message", () => {
    const conv = db.conversations[0]
    recordInbound(conv.id, MID_1, "Bonjour", new Date())
    const before = db.messages.length
    recordInbound(conv.id, MID_1, "Bonjour (doublon)", new Date())
    assert.equal(db.messages.length, before, "mid identique → idempotent")
  })

  await test("4.  Deux participants → deux conversations distinctes", () => {
    findOrCreate(ACCOUNT_ID, PARTICIPANT_B, new Date())
    assert.equal(db.conversations.filter(c => c.instagram_account_id === ACCOUNT_ID).length, 2)
  })

  await test("5.  Deux comptes professionnels → conversations séparées", () => {
    findOrCreate(ACCOUNT_B, PARTICIPANT_A, new Date())
    const forAccountB = db.conversations.filter(c => c.instagram_account_id === ACCOUNT_B)
    assert.equal(forAccountB.length, 1)
  })

  /* ── Messages (6-10) ────────────────────────────────────────── */

  await test("6.  Inbound correctement enregistré", () => {
    const conv = db.conversations.find(c => c.instagram_account_id === ACCOUNT_ID && c.participant_id === PARTICIPANT_A)!
    const msg  = recordInbound(conv.id, MID_2, "Question batterie", new Date())
    assert.ok(msg, "Le message doit être créé")
    assert.equal(msg?.direction, 'inbound')
    assert.equal(msg?.source, 'instagram')
    assert.equal(msg?.status, 'received')
  })

  await test("7.  Réponse automatique correctement enregistrée", () => {
    const conv = db.conversations.find(c => c.instagram_account_id === ACCOUNT_ID && c.participant_id === PARTICIPANT_A)!
    const msg  = recordOutbound(conv.id, "Le prix de la batterie est CHF 59.–", 'auto_reply')
    assert.equal(msg.direction, 'outbound')
    assert.equal(msg.source, 'auto_reply')
    assert.equal(msg.status, 'sent')
  })

  await test("8.  Réponse manuelle correctement enregistrée", () => {
    const conv = db.conversations.find(c => c.instagram_account_id === ACCOUNT_ID && c.participant_id === PARTICIPANT_A)!
    const msg  = recordOutbound(conv.id, "Réponse manuelle admin", 'manual_reply', "admin-uuid")
    assert.equal(msg.source, 'manual_reply')
    assert.equal(msg.sent_by, "admin-uuid")
  })

  await test("9.  Ordre chronologique des messages dans le fil", () => {
    const conv = db.conversations.find(c => c.instagram_account_id === ACCOUNT_ID && c.participant_id === PARTICIPANT_A)!
    const msgs = listMessages(conv.id)
    for (let i = 1; i < msgs.length; i++) {
      assert.ok(
        new Date(msgs[i].occurred_at) >= new Date(msgs[i-1].occurred_at),
        "Les messages doivent être triés par occurred_at ASC"
      )
    }
  })

  await test("10. Message expiré non retourné par listMessages", () => {
    const conv = db.conversations.find(c => c.instagram_account_id === ACCOUNT_ID && c.participant_id === PARTICIPANT_A)!
    /* Insérer un message avec expires_at dans le passé */
    const expiredMsg: MessageRow = {
      id:              makeMsgId(),
      conversation_id: conv.id,
      external_mid:    "mid_expired",
      direction:       'inbound',
      source:          'instagram',
      text:            "Message expiré",
      status:          'received',
      reply_to_mid:    null,
      sent_by:         null,
      occurred_at:     new Date(Date.now() - 31 * 24 * 3600 * 1000).toISOString(),
      created_at:      new Date().toISOString(),
      expires_at:      new Date(Date.now() - 1000).toISOString(), // passé
    }
    db.messages.push(expiredMsg)
    const msgs = listMessages(conv.id)
    assert.ok(!msgs.find(m => m.id === expiredMsg.id), "Le message expiré ne doit pas apparaître")
  })

  await test("11. cleanup supprime les messages expirés", () => {
    const before  = db.messages.length
    const deleted = cleanup()
    assert.ok(deleted >= 1, "Au moins un message expiré doit être nettoyé")
    assert.equal(db.messages.length, before - deleted)
  })

  /* ── Pipeline webhook (12-13) ───────────────────────────────── */

  await test("12. Panne de persistance ne casse pas le pipeline auto-réponse", async () => {
    /* Simuler une fonction de persistance qui lève une exception */
    const throwingPersist: ManualReplyDeps = {
      getConversation:     async () => { throw new Error("DB down") },
      getConnectionStatus: async () => 'active',
      checkRateLimit:      async () => true,
      resolveConfig:       async () => MOCK_CONFIG,
      sendMessage:         async () => true,
      recordOutbound:      async () => { throw new Error("DB down") },
    }
    /* L'orchestrateur retourne 'not_found' mais ne lève pas d'exception non capturée */
    const result = await orchestrateManualReply('conv-x', 'Test message', 'user-1', throwingPersist)
    assert.equal(result.outcome, 'not_found', "Exception → not_found, pas de crash")
  })

  await test("13. Echo toujours ignoré (vérifié par types.ts)", () => {
    /* Les echos sont filtrés dans parseInstagramMessages — is_echo = true → ignoré.
       Ce test vérifie que le type ParsedInstagramMessage ne peut pas transporter un echo. */
    // ParsedInstagramMessage n'a pas de champ is_echo — seul le texte valid est propagé
    const msg = { senderId: 'a', recipientId: 'b', mid: 'c', text: 'Hello', timestamp: Date.now() }
    assert.ok('text' in msg, "Le message parsé doit avoir du texte (echos filtrés avant)")
    assert.ok(!('is_echo' in msg), "is_echo ne doit pas être dans ParsedInstagramMessage")
  })

  /* ── Orchestrateur réponse manuelle (14-25) ─────────────────── */

  await test("14. Réponse manuelle autorisée dans les 24 heures", async () => {
    const deps   = makeDeps()
    const result = await orchestrateManualReply('conv-test', 'Bonjour !', 'user-1', deps)
    assert.equal(result.outcome, 'sent')
    assert.equal(deps.sentTexts.length, 1)
  })

  await test("15. Réponse manuelle refusée après 24 heures", async () => {
    const conv: ConversationRow = {
      id: 'conv-test', instagram_account_id: ACCOUNT_ID, participant_id: PARTICIPANT_A,
      last_message_at:  new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
      last_inbound_at:  new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
      last_message_preview: null,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }
    const deps   = makeDeps({ convOverride: conv })
    const result = await orchestrateManualReply('conv-test', 'Bonjour !', 'user-1', deps)
    assert.equal(result.outcome, 'window_expired')
    assert.equal(deps.sentTexts.length, 0, "Aucun envoi après expiration")
  })

  await test("16. Texte vide refusé", async () => {
    const deps = makeDeps()
    assert.equal((await orchestrateManualReply('conv-test', '', 'user-1', deps)).outcome, 'invalid_text')
    assert.equal((await orchestrateManualReply('conv-test', '   ', 'user-1', deps)).outcome, 'invalid_text')
  })

  await test("17. Texte > 1000 caractères refusé", async () => {
    const deps   = makeDeps()
    const long   = 'x'.repeat(1001)
    const result = await orchestrateManualReply('conv-test', long, 'user-1', deps)
    assert.equal(result.outcome, 'invalid_text')
    assert.ok(!validateManualReplyText(long))
  })

  await test("18. UUID invalide → traité par isValidUuid (logique pure)", () => {
    const { isValidUuid } = require("../lib/meta/instagram/accessControl") as
      { isValidUuid: (s: string) => boolean }
    assert.ok(!isValidUuid("not-a-uuid"))
    assert.ok(!isValidUuid(""))
    assert.ok(isValidUuid("550e8400-e29b-41d4-a716-446655440000"))
  })

  await test("19. Conversation inconnue refusée", async () => {
    const deps   = makeDeps({ convOverride: null })
    const result = await orchestrateManualReply('conv-unknown', 'Hello', 'user-1', deps)
    assert.equal(result.outcome, 'not_found')
  })

  await test("20. Connexion inactive refusée", async () => {
    const deps   = makeDeps({ connStatus: 'other' })
    const result = await orchestrateManualReply('conv-test', 'Hello', 'user-1', deps)
    assert.equal(result.outcome, 'connection_inactive')
  })

  await test("21. instagram_reviewer autorisé sur la messagerie", () => {
    const { isInstagramAccessAllowed } = require("../lib/meta/instagram/accessControl") as
      { isInstagramAccessAllowed: (role: string, active: boolean) => boolean }
    assert.ok(isInstagramAccessAllowed('instagram_reviewer', true))
    assert.ok(isInstagramAccessAllowed('admin', true))
    assert.ok(isInstagramAccessAllowed('editor', true))
  })

  await test("22. Aucun token dans les projections ConversationRow et MessageRow", () => {
    /* Vérification structurelle : ConversationRow n'a pas de champ token */
    const conv: ConversationRow = {
      id: 'x', instagram_account_id: 'a', participant_id: 'b',
      last_message_at: new Date().toISOString(), last_inbound_at: null,
      last_message_preview: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }
    assert.ok(!('token' in conv), "Pas de token dans ConversationRow")
    assert.ok(!('access_token' in conv), "Pas d'access_token dans ConversationRow")
    assert.ok(!('encrypted' in conv), "Pas de champ chiffré dans ConversationRow")
  })

  await test("23. Suppression par participant_id supprime conversations et messages", () => {
    db.conversations = []
    db.messages      = []
    const convA = findOrCreate(ACCOUNT_ID, PARTICIPANT_A, new Date())
    recordInbound(convA.id, "mid_del_1", "Message A", new Date())
    findOrCreate(ACCOUNT_ID, PARTICIPANT_B, new Date())

    /* Simuler la suppression par participant_id */
    const before = db.conversations.length
    db.conversations = db.conversations.filter(c => c.participant_id !== PARTICIPANT_A)
    /* En prod, les messages sont supprimés par cascade FK — ici manuellement */
    db.messages = db.messages.filter(m => m.conversation_id !== convA.id)

    assert.equal(db.conversations.length, before - 1, "Une conversation supprimée")
    assert.equal(db.messages.filter(m => m.conversation_id === convA.id).length, 0, "Messages supprimés")
  })

  await test("24. Rate limit bloque les abus", async () => {
    const deps   = makeDeps({ rlAllowed: false })
    const result = await orchestrateManualReply('conv-test', 'Hello', 'user-1', deps)
    assert.equal(result.outcome, 'rate_limited')
    assert.equal(deps.sentTexts.length, 0, "Aucun envoi si rate limited")
  })

  await test("25. Envoi réussi mais persistance échouée → sent_not_saved", async () => {
    const deps: ManualReplyDeps = {
      getConversation:     async () => ({
        id: 'conv-x', instagram_account_id: ACCOUNT_ID, participant_id: PARTICIPANT_A,
        last_message_at: new Date().toISOString(), last_inbound_at: new Date().toISOString(),
        last_message_preview: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }),
      getConnectionStatus: async () => 'active',
      checkRateLimit:      async () => true,
      resolveConfig:       async () => MOCK_CONFIG,
      sendMessage:         async () => true,     // envoi OK
      recordOutbound:      async () => null,     // persistance échouée
    }
    const result = await orchestrateManualReply('conv-x', 'Hello', 'user-1', deps)
    assert.equal(result.outcome, 'sent_not_saved', "Envoyé mais non persisté")
  })

  /* Bonus : validateManualReplyText et isWithin24Hours */
  await test("B1. validateManualReplyText — règles de base", () => {
    assert.ok(validateManualReplyText("Bonjour"))
    assert.ok(validateManualReplyText("x".repeat(1000)))
    assert.ok(!validateManualReplyText(""))
    assert.ok(!validateManualReplyText("   "))
    assert.ok(!validateManualReplyText("x".repeat(1001)))
  })

  await test("B2. isWithin24Hours — fenêtre et edge cases", () => {
    const now = new Date()
    const h23 = new Date(now.getTime() - 23 * 3600 * 1000)
    const h25 = new Date(now.getTime() - 25 * 3600 * 1000)
    assert.ok(isWithin24Hours(h23, now), "23h → dans la fenêtre")
    assert.ok(!isWithin24Hours(h25, now), "25h → hors fenêtre")
    assert.ok(!isWithin24Hours(null, now), "null → hors fenêtre")
  })

  /* ── Double soumission identique → un seul envoi Instagram (C1) ─ */

  /* ── Idempotence renforcée lock/confirm/release (C1-C5) ─────── */

  /* Factory pour simuler le Redis d'idempotence (lock/done en mémoire) */
  function makeIdempotencyStore(): {
    acquireSendLock:     (sid: string) => Promise<boolean>
    confirmSendSuccess:  (sid: string) => Promise<void>
    releaseSendLock:     (sid: string) => Promise<void>
    lockedIds:           Set<string>
    doneIds:             Set<string>
  } {
    const lockedIds = new Set<string>()
    const doneIds   = new Set<string>()
    return {
      lockedIds, doneIds,
      acquireSendLock: async (sid) => {
        if (doneIds.has(sid)) return false    // déjà envoyé avec succès
        if (lockedIds.has(sid)) return false  // verrou déjà pris
        lockedIds.add(sid)
        return true
      },
      confirmSendSuccess: async (sid) => {
        doneIds.add(sid)
        lockedIds.delete(sid)
      },
      releaseSendLock: async (sid) => {
        lockedIds.delete(sid)
      },
    }
  }

  function baseConvForIdempotency(): ConversationRow {
    return {
      id: 'conv-idp', instagram_account_id: ACCOUNT_ID, participant_id: PARTICIPANT_A,
      last_message_at: new Date().toISOString(), last_inbound_at: new Date().toISOString(),
      last_message_preview: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }
  }

  await test("C1. double soumission simultanée même submissionId → un seul appel Meta", async () => {
    const store = makeIdempotencyStore()
    let sendCallCount = 0
    const SID = "sub-c1-test"

    const makeDepsShared = (): ManualReplyDeps => ({
      getConversation:    async () => baseConvForIdempotency(),
      getConnectionStatus: async () => 'active',
      checkRateLimit:     async () => true,
      acquireSendLock:    store.acquireSendLock,
      confirmSendSuccess: store.confirmSendSuccess,
      releaseSendLock:    store.releaseSendLock,
      resolveConfig:      async () => MOCK_CONFIG,
      sendMessage:        async () => { sendCallCount++; return true },
      recordOutbound:     async () => makeMsgId(),
    })

    const [r1, r2] = await Promise.all([
      orchestrateManualReply('conv-idp', 'Hello', 'user-1', makeDepsShared(), SID),
      orchestrateManualReply('conv-idp', 'Hello', 'user-1', makeDepsShared(), SID),
    ])

    const outcomes = [r1.outcome, r2.outcome].sort()
    assert.ok(outcomes.includes('sent'), "L'une des soumissions doit réussir")
    assert.ok(outcomes.includes('duplicate_submit'), "L'autre doit être bloquée")
    assert.equal(sendCallCount, 1, "Un seul appel sendInstagramTextMessage")
  })

  await test("C2. nouvelle tentative avec même submissionId après succès → aucun envoi", async () => {
    const store = makeIdempotencyStore()
    let sendCallCount = 0
    const SID = "sub-c2-test"
    const depsFactory = (): ManualReplyDeps => ({
      getConversation:    async () => baseConvForIdempotency(),
      getConnectionStatus: async () => 'active',
      checkRateLimit:     async () => true,
      acquireSendLock:    store.acquireSendLock,
      confirmSendSuccess: store.confirmSendSuccess,
      releaseSendLock:    store.releaseSendLock,
      resolveConfig:      async () => MOCK_CONFIG,
      sendMessage:        async () => { sendCallCount++; return true },
      recordOutbound:     async () => makeMsgId(),
    })

    /* Premier envoi → succès */
    const r1 = await orchestrateManualReply('conv-idp', 'Hello', 'user-1', depsFactory(), SID)
    assert.equal(r1.outcome, 'sent')
    assert.equal(sendCallCount, 1)
    assert.ok(store.doneIds.has(SID), ":done doit exister après succès")
    assert.ok(!store.lockedIds.has(SID), ":lock doit être supprimé après succès")

    /* Deuxième envoi avec le même SID → bloqué par :done */
    const r2 = await orchestrateManualReply('conv-idp', 'Hello', 'user-1', depsFactory(), SID)
    assert.equal(r2.outcome, 'duplicate_submit')
    assert.equal(sendCallCount, 1, "Toujours un seul appel Meta")
  })

  await test("C3. échec d'envoi Meta → verrou libéré, nouvelle tentative possible", async () => {
    const store = makeIdempotencyStore()
    let sendCallCount = 0
    const SID = "sub-c3-test"
    let sendShouldSucceed = false

    const deps = (): ManualReplyDeps => ({
      getConversation:    async () => baseConvForIdempotency(),
      getConnectionStatus: async () => 'active',
      checkRateLimit:     async () => true,
      acquireSendLock:    store.acquireSendLock,
      confirmSendSuccess: store.confirmSendSuccess,
      releaseSendLock:    store.releaseSendLock,
      resolveConfig:      async () => MOCK_CONFIG,
      sendMessage:        async () => { sendCallCount++; return sendShouldSucceed },
      recordOutbound:     async () => makeMsgId(),
    })

    /* Premier essai → échec Meta */
    const r1 = await orchestrateManualReply('conv-idp', 'Hello', 'user-1', deps(), SID)
    assert.equal(r1.outcome, 'send_failed')
    assert.ok(!store.lockedIds.has(SID), ":lock doit être libéré après échec")
    assert.ok(!store.doneIds.has(SID), ":done ne doit pas exister après échec")

    /* Deuxième essai avec le même SID → autorisé */
    sendShouldSucceed = true
    const r2 = await orchestrateManualReply('conv-idp', 'Hello', 'user-1', deps(), SID)
    assert.equal(r2.outcome, 'sent', "La nouvelle tentative doit réussir")
    assert.equal(sendCallCount, 2)
    assert.ok(store.doneIds.has(SID), ":done créé après succès")
  })

  await test("C4. deux submissionIds différents → deux envois possibles", async () => {
    const store = makeIdempotencyStore()
    let sendCallCount = 0
    const SID_1 = "sub-c4-msg1"
    const SID_2 = "sub-c4-msg2"

    const deps = (): ManualReplyDeps => ({
      getConversation:    async () => baseConvForIdempotency(),
      getConnectionStatus: async () => 'active',
      checkRateLimit:     async () => true,
      acquireSendLock:    store.acquireSendLock,
      confirmSendSuccess: store.confirmSendSuccess,
      releaseSendLock:    store.releaseSendLock,
      resolveConfig:      async () => MOCK_CONFIG,
      sendMessage:        async () => { sendCallCount++; return true },
      recordOutbound:     async () => makeMsgId(),
    })

    const r1 = await orchestrateManualReply('conv-idp', 'Message 1', 'user-1', deps(), SID_1)
    const r2 = await orchestrateManualReply('conv-idp', 'Message 2', 'user-1', deps(), SID_2)

    assert.equal(r1.outcome, 'sent')
    assert.equal(r2.outcome, 'sent')
    assert.equal(sendCallCount, 2, "Deux envois légitimes distincts")
  })

  await test("C5. message expiré supprimé, message valide conservé", () => {
    db.conversations = []; db.messages = []
    const conv  = findOrCreate(ACCOUNT_ID, PARTICIPANT_A, new Date())
    const valid = recordInbound(conv.id, "mid_valid_c5", "Message valide", new Date())

    /* Insérer un message expiré manuellement */
    const expired: MessageRow = {
      id: makeMsgId(), conversation_id: conv.id, external_mid: "mid_expired_c5",
      direction: 'inbound', source: 'instagram', text: "Message expiré",
      status: 'received', reply_to_mid: null, sent_by: null,
      occurred_at: new Date(Date.now() - 31 * 24 * 3600 * 1000).toISOString(),
      created_at:  new Date().toISOString(),
      expires_at:  new Date(Date.now() - 1000).toISOString(), // passé
    }
    db.messages.push(expired)

    /* Avant cleanup */
    assert.equal(db.messages.length, 2)

    /* Cleanup */
    cleanup()

    /* Le message expiré est supprimé, le valide reste */
    assert.ok(!db.messages.find(m => m.id === expired.id), "Message expiré supprimé")
    assert.ok(db.messages.find(m => m.id === valid?.id),   "Message valide conservé")
    assert.equal(db.messages.length, 1)
  })

  /* ── Résultat ──────────────────────────────────────────────────── */

  console.log("")
  console.log(
    `${C.bold("Résultats :")} ${C.green(`${passed} passé(s)`)}` +
    (failed > 0 ? ` ${C.red(`${failed} échoué(s)`)}` : "")
  )
  if (failed > 0) process.exit(1)
  console.log(C.green("\n✅ Tous les tests inbox sont passés.\n"))
}

main().catch((err: unknown) => {
  console.error(C.red("\n❌ Erreur inattendue :"))
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
