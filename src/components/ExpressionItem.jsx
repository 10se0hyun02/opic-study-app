import { useState } from 'react'

const NUANCES = ['원어민 표현', '고득점 문형']

export default function ExpressionItem({ expr, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(expr.text)
  const [nuance, setNuance] = useState(expr.nuance)

  function save() {
    if (!text.trim()) return
    onUpdate(expr.id, { text: text.trim(), nuance })
    setEditing(false)
  }

  return (
    <div className={`group flex items-start gap-2 px-3 py-2 rounded-lg transition-colors ${expr.memorized ? 'bg-green-50' : 'bg-gray-50'}`}>
      <input
        type="checkbox"
        checked={expr.memorized}
        onChange={(e) => onUpdate(expr.id, { memorized: e.target.checked })}
        className="mt-0.5 accent-green-500 cursor-pointer shrink-0"
      />
      {editing ? (
        <div className="flex-1">
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            className="w-full text-sm border border-gray-300 rounded px-2 py-1 mb-1 outline-none focus:border-indigo-400"
          />
          <select
            value={nuance}
            onChange={(e) => setNuance(e.target.value)}
            className="text-xs border border-gray-200 rounded px-1 py-0.5"
          >
            {NUANCES.map((n) => <option key={n}>{n}</option>)}
          </select>
          <div className="flex gap-1 mt-1">
            <button onClick={save} className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded">저장</button>
            <button onClick={() => { setEditing(false); setText(expr.text); setNuance(expr.nuance) }} className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">취소</button>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${expr.memorized ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{expr.text}</p>
          {expr.korean && (
            <p className="text-[11px] text-gray-400 mt-0.5">{expr.korean}</p>
          )}
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${
            expr.nuance === '고득점 문형'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-sky-100 text-sky-700'
          }`}>
            {expr.nuance}
          </span>
        </div>
      )}
      <div className="opacity-0 group-hover:opacity-100 flex gap-1 shrink-0">
        <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-gray-600 text-xs">✏️</button>
      </div>
    </div>
  )
}
