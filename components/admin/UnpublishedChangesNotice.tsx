/*
  components/admin/UnpublishedChangesNotice.tsx

  Bandeau compact indiquant que les modifications ne sont pas encore
  visibles sur le site public. Ne mentionne pas "Supabase" au client.

  À supprimer lorsque le site public sera synchronisé avec l'administration.
*/

export function UnpublishedChangesNotice() {
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 rounded-btn bg-white/[0.04] border border-white/8">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5 text-foreground/30" aria-hidden>
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
        <path d="M7 5v3M7 9.5h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <div>
        <p className="text-xs font-rubik font-medium text-foreground/50">
          Modifications non publiées
        </p>
        <p className="text-[11px] font-rubik text-foreground/30 mt-0.5 leading-relaxed">
          Les changements sont enregistrés dans l&apos;administration, mais ne sont pas encore visibles sur le site public.
        </p>
      </div>
    </div>
  )
}
