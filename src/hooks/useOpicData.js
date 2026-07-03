import { useLocalStorage } from './useLocalStorage'

const CATEGORY_TYPES = ['intro', 'combo', 'roleplay', 'surprise', 'filler']

export function useOpicData() {
  const [categories, setCategories] = useLocalStorage('opic_categories', [])
  const [cards, setCards] = useLocalStorage('opic_cards', [])

  // ── Category CRUD ──
  function addCategory(name, type = 'combo') {
    const newCat = {
      id: crypto.randomUUID(),
      name,
      type,
      order: categories.length,
    }
    setCategories((prev) => [...prev, newCat])
    return newCat.id
  }

  function updateCategory(id, patch) {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    )
  }

  function deleteCategory(id) {
    setCategories((prev) => reorder(prev.filter((c) => c.id !== id)))
    setCards((prev) => prev.filter((card) => card.categoryId !== id))
  }

  function reorderCategories(orderedIds) {
    setCategories((prev) => {
      const map = Object.fromEntries(prev.map((c) => [c.id, c]))
      return orderedIds.map((id, i) => ({ ...map[id], order: i }))
    })
  }

  // ── Card CRUD ──
  function addCard(categoryId, korean) {
    const siblings = cards.filter((c) => c.categoryId === categoryId)
    const newCard = {
      id: crypto.randomUUID(),
      categoryId,
      order: siblings.length,
      korean,
      expressions: [],
    }
    setCards((prev) => [...prev, newCard])
    return newCard.id
  }

  function updateCard(id, patch) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  function deleteCard(id) {
    const card = cards.find((c) => c.id === id)
    if (!card) return
    setCards((prev) => {
      const filtered = prev.filter((c) => c.id !== id)
      return filtered.map((c) =>
        c.categoryId === card.categoryId && c.order > card.order
          ? { ...c, order: c.order - 1 }
          : c
      )
    })
  }

  function reorderCards(categoryId, orderedIds) {
    setCards((prev) => {
      const map = Object.fromEntries(prev.map((c) => [c.id, c]))
      const others = prev.filter((c) => c.categoryId !== categoryId)
      const reordered = orderedIds.map((id, i) => ({ ...map[id], order: i }))
      return [...others, ...reordered]
    })
  }

  // ── Expression CRUD ──
  function addExpression(cardId, text, nuance = '원어민 표현') {
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? {
              ...c,
              expressions: [
                ...c.expressions,
                { id: crypto.randomUUID(), text, nuance, memorized: false },
              ],
            }
          : c
      )
    )
  }

  function updateExpression(cardId, exprId, patch) {
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? {
              ...c,
              expressions: c.expressions.map((e) =>
                e.id === exprId ? { ...e, ...patch } : e
              ),
            }
          : c
      )
    )
  }

  function deleteExpression(cardId, exprId) {
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? { ...c, expressions: c.expressions.filter((e) => e.id !== exprId) }
          : c
      )
    )
  }

  // ── Helpers ──
  function cardsForCategory(categoryId) {
    return cards
      .filter((c) => c.categoryId === categoryId)
      .sort((a, b) => a.order - b.order)
  }

  function sortedCategories() {
    return [...categories].sort((a, b) => a.order - b.order)
  }

  // ── Data export/import ──
  function exportData() {
    return JSON.stringify({ categories, cards }, null, 2)
  }

  function importData(jsonString) {
    try {
      const data = JSON.parse(jsonString)
      if (data.categories) setCategories(data.categories)
      if (data.cards) setCards(data.cards)
      return true
    } catch {
      return false
    }
  }

  return {
    categories,
    cards,
    CATEGORY_TYPES,
    sortedCategories,
    cardsForCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    addCard,
    updateCard,
    deleteCard,
    reorderCards,
    addExpression,
    updateExpression,
    deleteExpression,
    exportData,
    importData,
  }
}

function reorder(arr) {
  return arr.map((item, i) => ({ ...item, order: i }))
}
