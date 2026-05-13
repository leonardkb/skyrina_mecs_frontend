export default function Button({ title, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-xl text-white font-medium transition
        ${color}
      `}
    >
      {title}
    </button>
  )
}