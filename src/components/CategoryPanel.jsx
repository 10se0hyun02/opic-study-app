import { useState } from 'react'

const TYPE_LABELS = {
  intro: '도입부',
  combo: '콤보셋',
  roleplay: '롤플레이',
  surprise: '돌발질문',
  filler: '추임새',
}

const TYPE_COLORS = {
  intro: 'bg-blue-100 text-blue-700',
  combo: 'bg-green-100 text-green-700',
  roleplay: 'bg-purple-100 text-purple-700',
  surprise: 'bg-orange-100 text-orange-700',
  filler: 'bg-gray-100 text-gray-500',
}

export default function CategoryPanel({
  categories,
  selectedId,
  onSelect,
  onAdd,
  onUpdate,
  onDelete,
  cardsForCategory,
}) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('combo')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState('combo')

  function handleAdd() {
    if (!newName.trim()) return
    onAdd(newName.trim(), newType)
    setNewName('')
    setNewType('combo')
    setAdding(false)
  }

  function startEdit(cat) {
    setEditId(cat.id)
    setEditName(cat.name)
    setEditType(cat.type)
  }

  function handleEdit() {
    if (!editName.trim()) return
    onUpdate(editId, { name: editName.trim(), type: editType })
    setEditId(null)
  }

  function progressFor(catId) {
    const cards = cardsForCategory(catId)
    const total = cards.reduce((s, c) => s + c.expressions.length, 0)
    const done = cards.reduce(
      (s, c) => s + c.expressions.filter((e) => e.memorized).length,
      0
    )
    return { total, done }
  }

  return (
    <div className="w-full md:w-72 shrink-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">카테고리</h2>
        <button
          onClick={() => setAdding(true)}
          className="text-indigo-600 hover:text-indigo-800 text-xl font-bold leading-none"
          title="카테고리 추가"
        >
          +
        </button>
      </div>

      {adding && (
        <div className="mb-2 p-2 bg-white rounded-xl border border-indigo-200 shadow-sm">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="카테고리 이름"
            className="w-full text-sm border-0 outline-none mb-1"
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded p-1 mb-2"
          >
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <div className="flex gap-1">
            <button onClick={handleAdd} className="flex-1 text-xs bg-indigo-600 text-white rounded py-1">추가</button>
            <button onClick={() => setAdding(false)} className="flex-1 text-xs bg-gray-100 text-gray-600 rounded py-1">취소</button>
          </div>
        </div>
      )}

      <ul className="space-y-1">
        {categories.map((cat, idx) => {
          const { total, done } = progressFor(cat.id)
          const pct = total === 0 ? 0 : Math.round((done / total) * 100)
          const showDivider = cat.type === 'filler' && (idx === 0 || categories[idx - 1].type !== 'filler')
          return (
            <li key={cat.id}>
              {showDivider && (
                <div className="flex items-center gap-2 my-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[10px] text-gray-400 font-medium tracking-wide">연습 보조</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              )}
              {editId === cat.id ? (
                <div className="p-2 bg-white rounded-xl border border-indigo-200 shadow-sm">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                    className="w-full text-sm border-0 outline-none mb-1"
                  />
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded p-1 mb-2"
                  >
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  <div className="flex gap-1">
                    <button onClick={handleEdit} className="flex-1 text-xs bg-indigo-600 text-white rounded py-1">저장</button>
                    <button onClick={() => setEditId(null)} className="flex-1 text-xs bg-gray-100 text-gray-600 rounded py-1">취소</button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => onSelect(cat.id)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                    selectedId === cat.id
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium truncate">{cat.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        selectedId === cat.id ? 'bg-white/20 text-white' : TYPE_COLORS[cat.type]
                      }`}>
                        {TYPE_LABELS[cat.type]}
                      </span>
                    </div>
                    {total > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className={`flex-1 h-1 rounded-full ${selectedId === cat.id ? 'bg-white/30' : 'bg-gray-200'}`}>
                          <div
                            className={`h-1 rounded-full transition-all ${selectedId === cat.id ? 'bg-white' : 'bg-indigo-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={`text-[10px] ${selectedId === cat.id ? 'text-white/80' : 'text-gray-400'}`}>{pct}%</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 ml-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(cat) }}
                      className={`text-xs p-0.5 rounded hover:bg-black/10 ${selectedId === cat.id ? 'text-white/80' : 'text-gray-400'}`}
                    >✏️</button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {categories.length === 0 && !adding && (
        <p className="text-xs text-gray-400 text-center mt-4">+ 버튼으로 카테고리를 추가하세요</p>
      )}
    </div>
  )
}
