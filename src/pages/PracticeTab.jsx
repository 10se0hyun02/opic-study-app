import { useState, useEffect, useRef, Fragment } from 'react'

const TYPE_ORDER = ['intro', 'combo', 'combo', 'roleplay', 'surprise']
const TYPE_LABELS = { intro: '도입부', combo: '콤보셋', roleplay: '롤플레이', surprise: '돌발질문' }
const TYPE_COLORS = {
  intro: 'bg-blue-100 text-blue-700 border-blue-200',
  combo: 'bg-green-100 text-green-700 border-green-200',
  roleplay: 'bg-purple-100 text-purple-700 border-purple-200',
  surprise: 'bg-orange-100 text-orange-700 border-orange-200',
}

function buildSession(categories, cardsForCategory) {
  const fillerCards = categories
    .filter((c) => c.type === 'filler')
    .flatMap((c) => cardsForCategory(c.id))

  function pickFillerHints(n = 2) {
    const shuffled = [...fillerCards].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, n).map((card) => ({
      situation: card.korean,
      expression: card.expressions[0]?.text ?? '',
    }))
  }

  const byType = {}
  for (const cat of categories) {
    if (cat.type === 'filler') continue
    const cards = cardsForCategory(cat.id)
    if (cards.length === 0) continue
    if (!byType[cat.type]) byType[cat.type] = []
    byType[cat.type].push({ cat, cards })
  }

  const session = []
  const usedIds = new Set()

  for (const type of TYPE_ORDER) {
    const pool = byType[type] || []
    const available = pool.filter((item) => !usedIds.has(item.cat.id))
    if (available.length === 0) continue
    const pick = available[Math.floor(Math.random() * available.length)]
    session.push({ type, cat: pick.cat, cards: pick.cards, fillerHints: pickFillerHints(2) })
    usedIds.add(pick.cat.id)
  }

  return session
}

function useTimer(initialSeconds) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (running && seconds > 0) {
      ref.current = setInterval(() => setSeconds((s) => s - 1), 1000)
    } else if (seconds === 0) {
      setRunning(false)
    }
    return () => clearInterval(ref.current)
  }, [running, seconds])

  function start() { setRunning(true) }
  function pause() { setRunning(false) }
  function reset(s = initialSeconds) { setRunning(false); setSeconds(s) }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return { display: `${mm}:${ss}`, seconds, running, start, pause, reset, done: seconds === 0 }
}

export default function PracticeTab({ data }) {
  const { sortedCategories, cardsForCategory } = data
  const [timerMinutes, setTimerMinutes] = useState(2)
  const [session, setSession] = useState(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const timer = useTimer(timerMinutes * 60)

  const categories = sortedCategories()

  function startSession() {
    const s = buildSession(categories, cardsForCategory)
    if (s.length === 0) return
    setSession(s)
    setCurrentIdx(0)
    setCompletedCount(0)
    setFinished(false)
    timer.reset(timerMinutes * 60)
  }

  function nextQuestion() {
    const next = currentIdx + 1
    setCompletedCount((c) => c + 1)
    if (next >= session.length) {
      setFinished(true)
    } else {
      setCurrentIdx(next)
      timer.reset(timerMinutes * 60)
    }
  }

  const hasEnoughData = categories.some((c) => cardsForCategory(c.id).length > 0)
  const current = session && !finished ? session[currentIdx] : null

  if (!hasEnoughData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <p className="text-4xl mb-3">🎤</p>
        <p className="text-sm font-medium text-gray-600">아직 데이터가 없어요</p>
        <p className="text-xs mt-1">학습 탭에서 카테고리와 카드를 먼저 추가해주세요.</p>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <p className="text-5xl">🎉</p>
        <h2 className="text-2xl font-bold text-gray-800">세트 완료!</h2>
        <p className="text-gray-500">{completedCount + 1}문제를 완주했어요.</p>
        <button
          onClick={startSession}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          다시 시작
        </button>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
          <p className="text-4xl mb-3">🎤</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">실전 연습</h2>
          <p className="text-sm text-gray-500 mb-6">도입부 → 콤보셋 → 롤플레이 → 돌발질문 순으로 랜덤 세트가 구성됩니다.</p>

          <div className="flex items-center justify-center gap-3 mb-6">
            <label className="text-sm text-gray-600">문제당 타이머</label>
            <select
              value={timerMinutes}
              onChange={(e) => setTimerMinutes(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
            >
              {[1, 1.5, 2, 3].map((v) => (
                <option key={v} value={v}>{v}분</option>
              ))}
            </select>
          </div>

          <button
            onClick={startSession}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            연습 시작
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* 진행 표시 */}
      <div className="flex items-center gap-2 mb-4">
        {session.map((item, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < currentIdx ? 'bg-indigo-400' : i === currentIdx ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          />
        ))}
        <span className="text-xs text-gray-400 shrink-0">{currentIdx + 1}/{session.length}</span>
      </div>

      {/* 문제 카드 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-4">
        <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border mb-3 ${TYPE_COLORS[current.type]}`}>
          {TYPE_LABELS[current.type]}
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">{current.cat.name}</h3>

        <div className="space-y-1.5">
          {current.cards.map((card, i) => {
            const len = current.cards.length
            const hints = current.fillerHints || []
            const positions = [Math.floor(len * 0.25), Math.floor(len * 0.65)]
            return (
              <Fragment key={card.id}>
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-gray-400 shrink-0 font-mono text-xs mt-0.5">{i + 1}.</span>
                  <span>{card.korean}</span>
                </div>
                {positions.map((pos, hi) =>
                  i === pos && hints[hi] ? (
                    <div key={hi} className="flex items-center gap-1.5 pl-5 py-0.5">
                      <span className="text-[10px] text-gray-400 shrink-0">{hints[hi].situation}</span>
                      <span className="text-[10px] text-gray-300">›</span>
                      <span className="text-[10px] font-medium text-indigo-400 italic">"{hints[hi].expression}"</span>
                    </div>
                  ) : null
                )}
              </Fragment>
            )
          })}
        </div>
      </div>

      {/* 타이머 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4">
        <div className={`text-4xl font-mono font-bold text-center mb-3 ${timer.done ? 'text-red-500' : 'text-gray-800'}`}>
          {timer.display}
        </div>
        {timer.done && <p className="text-center text-sm text-red-400 mb-2">시간 초과!</p>}
        <div className="flex gap-2 justify-center">
          {!timer.running ? (
            <button onClick={timer.start} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-700">시작</button>
          ) : (
            <button onClick={timer.pause} className="bg-yellow-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-yellow-600">일시정지</button>
          )}
          <button onClick={() => timer.reset(timerMinutes * 60)} className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-200">리셋</button>
        </div>
      </div>

      {/* 다음 버튼 */}
      <button
        onClick={nextQuestion}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
      >
        {currentIdx + 1 === session.length ? '완료' : '다음 문제 →'}
      </button>
    </div>
  )
}
