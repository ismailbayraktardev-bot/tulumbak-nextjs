import { AdminFormDrawerProps as AdminFormDrawerType } from 'tulumbak-shared'

type AdminFormDrawerProps = AdminFormDrawerType

export function AdminFormDrawer({ 
  open, 
  onOpenChange, 
  title, 
  children, 
  onSubmit, 
  onCancel, 
  loading = false 
}: AdminFormDrawerProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => onOpenChange(false)} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-tulumbak-slate">{title}</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="text-center py-8 text-gray-500">
              <p>AdminFormDrawer bileşeni henüz implement edilmedi.</p>
              <p className="text-sm mt-2">
                FE-02&apos;de React Hook Form + Zod entegrasyonu yapılacak.
              </p>
              <div className="mt-4 text-xs text-gray-400">
                <p>Title: {title}</p>
                <p>Loading: {loading ? 'Yes' : 'No'}</p>
                <p>Children: {children ? 'Present' : 'None'}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onCancel || (() => onOpenChange(false))}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={onSubmit}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-tulumbak-amber rounded-md hover:bg-tulumbak-amber/90 disabled:opacity-50"
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
