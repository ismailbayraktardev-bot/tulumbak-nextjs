import { Metadata } from 'next'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { UserDashboard } from '@/components/user/user-dashboard'

export const metadata: Metadata = {
  title: 'Hesabım - Tulumbak',
  description: 'Tulumbak hesabınızı yönetin',
}

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Mobile-first: Page Header */}
          <div className="mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Hesabım</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
              Hesap bilgilerinizi yönetin ve siparişlerinizi takip edin.
            </p>
          </div>

          {/* Mobile-first: User Dashboard */}
          <UserDashboard />
        </div>
      </div>
    </ProtectedRoute>
  )
}