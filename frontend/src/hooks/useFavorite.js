import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { fetchFavorites, toggleFavorite } from '../api/favorites.js'
import { useAuth } from '../contexts/AuthContext.jsx'

/**
 * Favourite state for a single venue/vendor.
 *
 * `type` is 'venue' | 'vendor', `id` the model's numeric id (may be undefined
 * while the parent page is still loading — the toggle no-ops until it arrives).
 *
 * The favourites list is fetched once under a shared ['favorites'] key, so the
 * dashboard page and every heart button stay in sync off the same cache entry.
 */
export function useFavorite(type, id) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const navigate = useNavigate()

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
    enabled: !!user,
  })

  // Venues and vendors are both stored as Vendor rows, so the API always
  // reports type as 'Vendor' regardless of which page favourited it —
  // match by id alone rather than also requiring the type string to match.
  const isFavorited = favorites.some((f) => f.item?.id === id)

  const mutation = useMutation({
    mutationFn: () => toggleFavorite(type, id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['favorites'] })
      toast.success(res?.favorited ? 'Saved to favourites' : 'Removed from favourites')
    },
    onError: () => toast.error('Could not update favourites'),
  })

  function toggle() {
    if (!user) {
      toast.error('Log in to save favourites')
      navigate('/login')
      return
    }
    if (!id) return
    mutation.mutate()
  }

  return { isFavorited, toggle, isPending: mutation.isPending }
}
