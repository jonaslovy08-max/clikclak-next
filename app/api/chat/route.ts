/*
  app/api/chat/route.ts — Route V1 désactivée.

  Cette route ne traite plus aucune requête Anthropic.
  Elle retourne HTTP 410 Gone pour indiquer que l'endpoint n'existe plus.
  Les fichiers lib/chatbot/ associés (outils, index, prompts V1) sont conservés.
*/

import { NextResponse } from 'next/server'

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    {
      error: 'Cette version du chatbot n\'est plus disponible.',
      code:  'LEGACY_CHATBOT_DISABLED',
    },
    { status: 410 },
  )
}
