import { useState, useEffect, useRef, useCallback } from 'react'

export default function useAsyncData(fetchFn) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetchRef = useRef(fetchFn)
  fetchRef.current = fetchFn

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchRef.current()
      setData(result)
    } catch (err) {
      console.error('useAsyncData error:', err)
      setError(err.message || 'Failed to load data')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, reload: load, setData }
}
