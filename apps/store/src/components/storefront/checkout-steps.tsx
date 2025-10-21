import { CheckoutStep } from 'tulumbak-shared'

interface CheckoutStepsProps {
  steps: CheckoutStep[]
}

export function CheckoutSteps({ steps }: CheckoutStepsProps) {
  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${step.completed 
                  ? 'bg-tulumbak-amber text-white' 
                  : step.current 
                    ? 'bg-tulumbak-amber/20 text-tulumbak-amber border-2 border-tulumbak-amber'
                    : 'bg-gray-100 text-gray-400'
                }
              `}>
                {step.completed ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div className="mt-2 text-center">
                <div className={`text-sm font-medium ${
                  step.current ? 'text-tulumbak-amber' : step.completed ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {step.description}
                </div>
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`
                flex-1 h-0.5 mx-4
                ${step.completed ? 'bg-tulumbak-amber' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
