import { Star, Github } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function StayTunedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-8">
      <div className="text-center space-y-12 max-w-4xl">
        {/* Main heading */}
        <div className="space-y-6">
          <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
            Upcoming Features
          </h1>
          <p className="text-4xl md:text-5xl font-bold text-slate-700 dark:text-slate-300">
            Stay tuned...
          </p>
        </div>

        {/* Subtitle */}
        <div className="space-y-8">
          <p className="text-2xl md:text-3xl font-semibold text-slate-600 dark:text-slate-400">
            In the meantime, check out the GitHub and leave a star please!
          </p>
          
          {/* GitHub button */}
          <div className="flex justify-center">
            <Button 
              asChild 
              size="lg" 
              className="text-lg px-8 py-6 bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <a 
                href="https://github.com/We1chJ/PhotoEye" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3"
              >
                <Github className="h-6 w-6" />
                <span className="font-bold">Star on GitHub</span>
                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              </a>
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="flex justify-center space-x-4 pt-8">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-75"></div>
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  )
}