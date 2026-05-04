import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Composable for scroll-triggered reveal animations using IntersectionObserver.
 * Elements with [data-reveal] will get class 'revealed' when they enter viewport.
 * Elements with [data-reveal-delay="N"] will delay by N*100ms.
 */
export function useScrollReveal(containerRef = null) {
  const observer = ref(null)

  function init() {
    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target
            const delay = parseInt(el.dataset.revealDelay || '0', 10) * 100
            setTimeout(() => {
              el.classList.add('revealed')
            }, delay)
            observer.value.unobserve(el)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )

    const root = containerRef?.value || document
    const elements = root.querySelectorAll('[data-reveal]')
    elements.forEach((el) => observer.value.observe(el))
  }

  function refresh() {
    if (!observer.value) return
    const root = containerRef?.value || document
    const elements = root.querySelectorAll('[data-reveal]:not(.revealed)')
    elements.forEach((el) => observer.value.observe(el))
  }

  onMounted(() => {
    // Small delay to ensure DOM is ready
    setTimeout(init, 100)
  })

  onUnmounted(() => {
    if (observer.value) {
      observer.value.disconnect()
    }
  })

  return { refresh }
}
