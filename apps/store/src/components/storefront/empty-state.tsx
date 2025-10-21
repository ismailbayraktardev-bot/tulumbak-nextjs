import Link from 'next/link'
import { Button } from 'tulumbak-ui'

interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        
        <h3 className="text-xl font-serif font-semibold text-tulumbak-slate mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {description}
        </p>
        
        {action && (
          <Button
            asChild
            className="bg-tulumbak-amber hover:bg-tulumbak-amber/90 text-white"
          >
            <Link href={action.href}>
              {action.label}
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
