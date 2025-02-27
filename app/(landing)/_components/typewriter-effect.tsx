"use client"

import { useEffect, useState } from "react"

interface TypewriterEffectProps {
  text: string
  delay?: number
}

export function TypewriterEffect({ text, delay = 50 }: TypewriterEffectProps) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, delay)

      return () => clearTimeout(timeout)
    } else {
      setIsComplete(true)
    }
  }, [currentIndex, delay, text])

  return (
    <div className="inline-block">
      <span>{displayText}</span>
      {!isComplete && <span className="animate-pulse">|</span>}
    </div>
  )
}

