"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"

interface FloatingIconProps {
  src: string
  alt: string
  delay: number
  size?: number
  className?: string
}

export function FloatingIcon({ src, alt, delay, size = 48, className = "" }: FloatingIconProps) {
  const iconRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = iconRef.current
    if (!element) return

    const startTime = Date.now()
    let animationFrame: number

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const position = (elapsed + delay) / 3000 // 3 second cycle

      // Create a floating effect with sine waves
      const y = Math.sin(position * Math.PI * 2) * 15
      element.style.transform = `translateY(${y}px)`

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [delay])

  return (
    <div ref={iconRef} className={`transition-transform duration-300 ease-in-out ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="rounded-lg shadow-lg bg-white p-2"
      />
    </div>
  )
}

