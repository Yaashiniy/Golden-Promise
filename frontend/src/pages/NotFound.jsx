import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <section className="min-h-[70vh] grid place-items-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        <p className="font-script text-5xl text-burgundy-700">Oh dear</p>
        <h1 className="font-display text-6xl text-burgundy-900 mt-2">404</h1>
        <p className="text-burgundy-700 mt-4">
          This page slipped away with the bouquet. Let's get you back home.
        </p>
        <Link to="/" className="btn-primary mt-8 inline-flex">
          Back to home
        </Link>
      </motion.div>
    </section>
  )
}
