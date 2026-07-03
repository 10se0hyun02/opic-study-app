import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ExpressionItem from './ExpressionItem'

const MAX_EXPRESSIONS = 4

export default function CardItem({ card, index, onUpdate, onDelete, onAddExpr, onUpdateExpr, onDeleteExpr }) {
  const [open, setOpen] = useState(false)
  const [editingKorean, setEditingKorean] = useState(false)
  const [korean, setKorean] = useState(card.korean)
  const [newExprText, setNewExprText] = useState('')
  const [newExprNuance, setNewExprNuance] = useState('원어민 표현')
  const [addingExpr, setAddingExpr] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  function saveKorean() {
    if (!korean.trim()) return
    onUpdate(card.id, { korean: korean.trim() })
    setEditingKorean(false)
  }

  function handleAddExpr() {
    if (!newExprText.trim()) return
    onAddExpr(card.id, newExprText.trim(), newExprNuance)
    setNewExprText('')
    setNewExprNuance('원어민 표현')
    setAddingExpr(false)
  }

  const memorizedCount = card.expressions.filter((e) => e.memorized).length
  const totalCount = card.expressions.length

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3">
        {/* 드래그 핸들 */}
        <button
          {...attributes}
          {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0 touch-none"
        >
          ⠿
        </button>

        {/* 번호 뱃지 */}
        <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0 select-none">
          {index + 1}
        </span>

        {/* 한국어 텍스트 */}
        <div className="flex-1 min-w-0" onClick={() => !editingKorean && setOpen((v) => !v)}>
          {editingKorean ? (
            <input
              autoFocus
              value={korean}
              onChange={(e) => setKorean(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveKorean()}
              onClick={(e) => e.stopPropagation()}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:border-indigo-400"
            />
          ) : (
            <p className="text-sm font-bold text-gray-800 cursor-pointer truncate">{card.korean}</p>
          )}
          {totalCount > 0 && !editingKorean && (
            <p className="text-xs text-gray-400 mt-0.5">{memorizedCount}/{totalCount} 암기</p>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-1 shrink-0">
          {editingKorean ? (
            <>
              <button onClick={saveKorean} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">저장</button>
              <button onClick={() => { setEditingKorean(false); setKorean(card.korean) }} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">취소</button>
            </>
          ) : (
            <>
              <button onClick={(e) => { e.stopPropagation(); setEditingKorean(true) }} className="text-gray-400 hover:text-gray-600 text-sm">✏️</button>
              <button onClick={() => setOpen((v) => !v)} className="text-gray-400 text-sm ml-1">
                {open ? '▲' : '▼'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 아코디언 — 영어 표현 */}
      {open && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-2">
          {card.expressions.map((expr) => (
            <ExpressionItem
              key={expr.id}
              expr={expr}
              onUpdate={(exprId, patch) => onUpdateExpr(card.id, exprId, patch)}
              onDelete={(exprId) => onDeleteExpr(card.id, exprId)}
            />
          ))}

          {addingExpr ? (
            <div className="bg-gray-50 rounded-lg p-2">
              <input
                autoFocus
                value={newExprText}
                onChange={(e) => setNewExprText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddExpr()}
                placeholder="영어 표현 입력..."
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 mb-1 outline-none focus:border-indigo-400"
              />
              <select
                value={newExprNuance}
                onChange={(e) => setNewExprNuance(e.target.value)}
                className="text-xs border border-gray-200 rounded px-1 py-0.5 mb-2"
              >
                <option>원어민 표현</option>
                <option>고득점 문형</option>
              </select>
              <div className="flex gap-1">
                <button onClick={handleAddExpr} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded">추가</button>
                <button onClick={() => setAddingExpr(false)} className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded">취소</button>
              </div>
            </div>
          ) : totalCount < MAX_EXPRESSIONS ? (
            <button
              onClick={() => setAddingExpr(true)}
              className="w-full text-xs text-indigo-500 hover:text-indigo-700 border border-dashed border-indigo-200 rounded-lg py-2 transition-colors"
            >
              + 영어 표현 추가
            </button>
          ) : (
            <p className="text-xs text-gray-400 text-center">최대 {MAX_EXPRESSIONS}개까지 추가 가능</p>
          )}
        </div>
      )}
    </div>
  )
}
