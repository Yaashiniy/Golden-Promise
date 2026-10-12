import { Reveal } from './Reveal.jsx'

export function ContentPage({ eyebrow, title, body, children }) {
  return (
    <div className="bg-blush-100">
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-20">
        <Reveal>
          {eyebrow && (
            <p className="font-script text-3xl text-burgundy-700 mb-3">{eyebrow}</p>
          )}
          <h1 className="font-display text-4xl md:text-5xl text-burgundy-900">{title}</h1>
        </Reveal>
        <Reveal delay={0.1}>
          {body && (
            <div className="mt-8 prose prose-burgundy max-w-none text-burgundy-800 text-lg leading-relaxed space-y-5">
              {body}
            </div>
          )}
          {children}
        </Reveal>
      </div>
    </div>
  )
}
