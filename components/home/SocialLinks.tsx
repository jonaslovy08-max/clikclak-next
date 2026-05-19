export default function SocialLinks() {
  return (
    <div className="flex items-center gap-5">
      <a
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="ClikClak sur Instagram"
        className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/icons/icon-instagram.svg"
          alt=""
          aria-hidden
          width={18}
          height={18}
        />
        <span>Instagram</span>
      </a>
      <a
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="ClikClak sur Facebook"
        className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/icons/icon-facebook.svg"
          alt=""
          aria-hidden
          width={18}
          height={18}
        />
        <span>Facebook</span>
      </a>
    </div>
  )
}
