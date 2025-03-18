import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark-agent dark:bg-gradient-dark-6">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white">Loading agent dashboard...</h2>
      </div>
    </div>
  )
}

