export default function Badge({ text, color }) {
  return (
    <div className={`
      px-3 py-1 rounded-full text-xs font-semibold text-white
      ${color}
    `}>
      {text}
    </div>
  )
}