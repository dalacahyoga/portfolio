// Animated space background — static twinkling dots + diagonal shooting stars,
// echoing the night-sky motif of the reference template.
export default function Starfield() {
  const stars = Array.from({ length: 60 })
  const shooting = Array.from({ length: 6 })
  return (
    <div className="starfield" aria-hidden="true">
      <div className="starfield__glow" />
      <div className="starfield__dots">
        {stars.map((_, i) => {
          const top = (i * 53) % 100
          const left = (i * 71) % 100
          const size = (i % 3) + 1
          const delay = (i % 7) * 0.6
          const dur = 2.5 + (i % 5)
          return (
            <span
              key={i}
              className="dot"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                animationDelay: `${delay}s`,
                animationDuration: `${dur}s`,
              }}
            />
          )
        })}
      </div>
      <div className="shooting">
        {shooting.map((_, i) => (
          <span
            key={i}
            className="shoot"
            style={{
              top: `${(i * 17) % 60}%`,
              left: `${(i * 23) % 80}%`,
              animationDelay: `${i * 2.4}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
