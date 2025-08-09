import { motion } from "framer-motion"
import { Camera, Sparkles } from "lucide-react"

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8 sm:mb-10 lg:mb-12"
    >
      <div className="flex flex-row justify-center items-center mb-4 space-y-2 sm:space-y-0">
        <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500 mr-2 sm:mr-3 order-1" />
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent order-2">
          Khoa's princess
        </h1>
        <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 ml-2 sm:ml-3 order-3" />
      </div>
      <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
        A beautiful space to cherish my princess's memories
      </p>
    </motion.header>
  )
}