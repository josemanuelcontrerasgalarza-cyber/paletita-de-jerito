interface Props {
  icon: string
  title: string
  subtitle: string
}

export function EmptyState({ icon, title, subtitle }: Props) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-5xl mb-3 opacity-40">{icon}</div>
      <div className="text-base font-semibold text-white mb-1">{title}</div>
      <div className="text-sm text-[#94A3B8]">{subtitle}</div>
    </div>
  )
}
