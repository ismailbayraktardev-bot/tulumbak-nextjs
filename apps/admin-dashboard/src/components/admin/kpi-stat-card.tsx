import { Card, CardContent } from 'tulumbak-ui'
import { KPIStatCard as KPIStatCardType } from 'tulumbak-shared'

type KPIStatCardProps = KPIStatCardType

export function KPIStatCard({ title, value, delta, description }: KPIStatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-tulumbak-slate mt-1">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          
          {delta && (
            <div className="flex items-center space-x-1">
              <div className={`
                flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
                ${delta.trend === 'up' 
                  ? 'bg-green-100 text-green-800' 
                  : delta.trend === 'down'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }
              `}>
                {delta.trend === 'up' && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {delta.trend === 'down' && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{delta.value > 0 ? '+' : ''}{delta.value}%</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
