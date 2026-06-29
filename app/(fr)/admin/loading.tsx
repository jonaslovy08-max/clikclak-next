export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <p className="text-foreground/40 text-sm font-rubik">Chargement…</p>
      </div>
    </div>
  )
}
