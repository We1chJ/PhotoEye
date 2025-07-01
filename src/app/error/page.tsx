'use client'

import { RefreshCw, Home, ArrowLeft } from 'lucide-react'

export default function ErrorPage({ 
  error = "Something went wrong", 
  statusCode = 500,
  showHomeButton = true,
  showBackButton = true,
  showRefreshButton = true 
}) {
  const handleRefresh = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleGoBack = () => {
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Error Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-3xl text-red-500">⚠️</span>
        </div>

        {/* Status Code */}
        <h1 className="text-6xl font-bold text-gray-800 mb-2">{statusCode}</h1>

        {/* Error Message */}
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Oops!</h2>
        <p className="text-gray-600 mb-8">{error}</p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {showRefreshButton && (
            <button
              onClick={handleRefresh}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          )}
          
          {showHomeButton && (
            <button
              onClick={handleGoHome}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Go Home
            </button>
          )}
          
          {showBackButton && (
            <button
              onClick={handleGoBack}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          )}
        </div>

        {/* Additional Help Text */}
        <p className="text-sm text-gray-500 mt-6">
          If the problem persists, please contact support.
        </p>
      </div>
    </div>
  )
}