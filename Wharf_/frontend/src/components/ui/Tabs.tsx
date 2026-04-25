import { useState, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface TabItem {
  id: string
  label: string
  content: ReactNode
  icon?: ReactNode
}

interface TabsProps {
  tabs: TabItem[]
  defaultTabId?: string
  onChange?: (tabId: string) => void
  className?: string
}

export const Tabs = ({ tabs, defaultTabId, onChange, className }: TabsProps) => {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0]?.id)

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId)
    onChange?.(tabId)
  }

  const activeTab = tabs.find((tab) => tab.id === activeTabId)

  return (
    <div className="w-full">
      <div className="tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              'tab-trigger',
              activeTabId === tab.id && 'tab-trigger-active',
              className
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-6">
        {activeTab?.content}
      </div>
    </div>
  )
}