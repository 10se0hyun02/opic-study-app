import { useState } from 'react'
import { useOpicData } from './hooks/useOpicData'
import StudyTab from './pages/StudyTab'
import PracticeTab from './pages/PracticeTab'
import DataManager from './components/DataManager'

const TABS = [
  { id: 'study', label: '📚 학습' },
  { id: 'practice', label: '🎤 실전연습' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('study')
  const data = useOpicData()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-end h-14">
            <DataManager onExport={data.exportData} onImport={data.importData} />
          </div>
          <div className="flex gap-1 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'study' && <StudyTab data={data} />}
        {activeTab === 'practice' && <PracticeTab data={data} />}
      </main>
    </div>
  )
}
