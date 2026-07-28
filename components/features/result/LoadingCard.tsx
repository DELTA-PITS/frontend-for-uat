import React from 'react'

interface LoadingCardProps {
  title?: string
  subtitle?: string
  className?: string
}

/**
 * LoadingCard component that displays a loading spinner along with a title and subtitle.
 * @param param0 
 * @returns A React component that renders a loading card with a spinner, title, and subtitle.s
 */
const LoadingCard: React.FC<LoadingCardProps> = ({
  title = 'Loading...',
  subtitle = 'Please wait while we process your document...',
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-8 w-200 h-70 mx-auto my-auto ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
        </div>

        <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 text-center">{subtitle}</p>
      </div>
    </div>
  )
}

export default LoadingCard
