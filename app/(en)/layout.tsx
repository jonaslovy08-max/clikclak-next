import { Rubik } from 'next/font/google'
import '../globals.css'
import RootProviders from '@/components/layout/RootProviders'

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-rubik',
  display: 'swap',
})

/*
  Root layout ANGLAIS — route group (en).
  Produit nativement <html lang="en">.
  Aucun script client, aucun workaround.
  Le chatbot français est masqué (showChatbot={false}) jusqu'à la Phase 2.
*/
export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={rubik.variable}>
        <RootProviders showChatbot={false}>
          {children}
        </RootProviders>
      </body>
    </html>
  )
}
