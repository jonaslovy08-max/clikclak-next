import Link from 'next/link'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'

export default function EnNotFound() {
  return (
    <>
      <Header locale="en" />
      <main className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-8">
        <div className="flex flex-col gap-4">
          <span className="text-8xl font-light text-accent">404</span>
          <h1 className="text-[2rem] font-light leading-tight">
            Page not found
          </h1>
          <p className="text-foreground/55 font-light max-w-md">
            This page does not exist or has been moved. Check the URL or return to the home page.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/en"
            className="px-6 py-3 rounded-lg border border-accent/40 text-accent hover:bg-accent/10 transition-colors font-light"
          >
            Back to home
          </Link>
          <Link
            href="/en/contact"
            className="px-6 py-3 rounded-lg border border-white/15 text-foreground/60 hover:border-white/30 hover:text-foreground transition-colors font-light"
          >
            Contact us
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
