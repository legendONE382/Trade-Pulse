import { useState, useEffect, useCallback } from 'react'

export default function useAsyncData(fetchFn) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      console.error('useAsyncData error:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [fetchFn])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, reload: load, setData }
}
