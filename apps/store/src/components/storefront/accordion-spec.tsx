'use client'

import { useState } from 'react'
import { AccordionSpecProps } from 'tulumbak-shared'

export function AccordionSpec({ items }: AccordionSpecProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleItem(index)}
            className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            aria-expanded={openItems.has(index)}
          >
            <span className="font-medium text-tulumbak-slate">
              {item.title}
            </span>
            <svg
              className={`w-5 h-5 text-gray-500 transform transition-transform ${
                openItems.has(index) ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          
          {openItems.has(index) && (
            <div className="px-4 pb-3 text-gray-600 text-sm leading-relaxed">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
