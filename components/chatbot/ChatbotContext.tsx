'use client'

import { createContext, useContext, useState } from 'react'

interface ChatbotCtx {
  isOpen: boolean
  open:   () => void
  close:  () => void
}

const ChatbotContext = createContext<ChatbotCtx>({
  isOpen: false,
  open:   () => {},
  close:  () => {},
})

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <ChatbotContext.Provider value={{
      isOpen,
      open:  () => setIsOpen(true),
      close: () => setIsOpen(false),
    }}>
      {children}
    </ChatbotContext.Provider>
  )
}

export const useChatbot = () => useContext(ChatbotContext)
