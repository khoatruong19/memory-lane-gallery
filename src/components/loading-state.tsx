import { Camera } from "lucide-react"

export function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center overflow-auto">
      <div className="text-center">
        <Camera className="w-16 h-16 text-pink-400 mx-auto mb-4 animate-pulse" />
        <p className="text-lg text-gray-600">Loading your memories...</p>
        <p className="text-sm text-gray-500 mt-2">Make sure Convex is running with `npx convex dev`</p>
      </div>
    </div>
  )
}