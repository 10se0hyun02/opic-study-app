import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import CategoryPanel from '../components/CategoryPanel'
import CardItem from '../components/CardItem'

function FullAnswerView({ cards }) {
  const [copied, setCopied] = useState(false)
  const [showKorean, setShowKorean] = useState(false)

  const items = cards
    .map((card) => ({ english: card.expressions[0]?.text, korean: card.korean }))
    .filter((item) => item.english)

  const fullText = items.map((item) => item.english).join(' ')

  function handleCopy() {
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400">
        <p className="text-sm">영어 표현이 아직 없어요.</p>
        <p className="text-xs mt-1">카드 보기에서 영어 표현을 추가해주세요.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-400">{items.length}문장</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKorean((v) => !v)}
            className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1 transition-colors"
          >
            {showKorean ? '한국어 숨기기' : '한국어 보기'}
          </button>
          <button
            onClick={handleCopy}
            className={`text-xs px-3 py-1 rounded-lg transition-colors ${
              copied
                ? 'bg-green-100 text-green-600'
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            }`}
          >
            {copied ? '복사됨 ✓' : '복사'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3">
            <span className="shrink-0 w-5 text-right text-xs font-mono text-gray-300 mt-0.5">
              {i + 1}.
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 leading-relaxed">{item.english}</p>
              {showKorean && (
                <p className="text-xs text-gray-400 mt-1">{item.korean}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StudyTab({ data }) {
  const {
    sortedCategories,
    cardsForCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    addCard,
    updateCard,
    deleteCard,
    reorderCards,
    addExpression,
    updateExpression,
    deleteExpression,
  } = data

  const [selectedCatId, setSelectedCatId] = useState(null)
  const [newKorean, setNewKorean] = useState('')
  const [addingCard, setAddingCard] = useState(false)
  const [viewMode, setViewMode] = useState('cards')

  const categories = sortedCategories()
  const selectedCat = categories.find((c) => c.id === selectedCatId)
  const cards = selectedCatId ? cardsForCategory(selectedCatId) : []

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = cards.findIndex((c) => c.id === active.id)
    const newIndex = cards.findIndex((c) => c.id === over.id)
    const reordered = arrayMove(cards, oldIndex, newIndex)
    reorderCards(selectedCatId, reordered.map((c) => c.id))
  }

  function handleAddCard() {
    if (!newKorean.trim() || !selectedCatId) return
    addCard(selectedCatId, newKorean.trim())
    setNewKorean('')
    setAddingCard(false)
  }

  function handleSelectCategory(id) {
    setSelectedCatId(id)
    setViewMode('cards')
    setAddingCard(false)
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <CategoryPanel
        categories={categories}
        selectedId={selectedCatId}
        onSelect={handleSelectCategory}
        onAdd={addCategory}
        onUpdate={updateCategory}
        onDelete={(id) => {
          deleteCategory(id)
          if (selectedCatId === id) setSelectedCatId(null)
        }}
        cardsForCategory={cardsForCategory}
      />

      <div className="flex-1 min-w-0">
        {!selectedCat ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-sm">왼쪽에서 카테고리를 선택하세요</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">{selectedCat.name}</h2>
              <div className="flex items-center gap-2">
                {/* 뷰 토글 */}
                <div className="flex rounded-xl overflow-hidden border border-gray-200 text-sm">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-1.5 transition-colors ${
                      viewMode === 'cards'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    카드
                  </button>
                  <button
                    onClick={() => setViewMode('full')}
                    className={`px-3 py-1.5 transition-colors ${
                      viewMode === 'full'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    전체 답변
                  </button>
                </div>
                {viewMode === 'cards' && (
                  <button
                    onClick={() => setAddingCard(true)}
                    className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    + 카드 추가
                  </button>
                )}
              </div>
            </div>

            {viewMode === 'full' ? (
              <FullAnswerView cards={cards} />
            ) : (
              <>
                {addingCard && (
                  <div className="bg-white border border-indigo-200 rounded-2xl p-3 mb-3 shadow-sm">
                    <input
                      autoFocus
                      value={newKorean}
                      onChange={(e) => setNewKorean(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCard()}
                      placeholder="한국어 흐름 입력 (예: 저는 서울에 살고 있어요.)"
                      className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-400 mb-2"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleAddCard} className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-xl">추가</button>
                      <button onClick={() => { setAddingCard(false); setNewKorean('') }} className="text-sm bg-gray-100 text-gray-600 px-4 py-1.5 rounded-xl">취소</button>
                    </div>
                  </div>
                )}

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {cards.map((card, index) => (
                        <CardItem
                          key={card.id}
                          card={card}
                          index={index}
                          onUpdate={updateCard}
                          onDelete={deleteCard}
                          onAddExpr={addExpression}
                          onUpdateExpr={updateExpression}
                          onDeleteExpr={deleteExpression}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {cards.length === 0 && !addingCard && (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <p className="text-sm">아직 카드가 없어요.</p>
                    <p className="text-xs mt-1">위 "+ 카드 추가" 버튼을 눌러 시작하세요.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
