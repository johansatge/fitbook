import { h, Fragment } from 'preact'
import { useEffect, useState } from 'preact/hooks'

export function Toast ({ label }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (label.length > 0) {
      setIsVisible(true)
      const timeout = setTimeout(() => setIsVisible(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [label])

  return <div class="toast" js-visible={isVisible}>
    {label}
  </div>
}