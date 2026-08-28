import { useState, useCallback } from 'react'

export default function useForm(initialValues = {}) {
  const [values, setValues] = useState(initialValues)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const setValue = useCallback((field, value) => {
    setValues(prev => ({ ...prev, [field]: value }))
  }, [])

  const reset = useCallback(() => {
    setValues(initialValues)
    setError(null)
  }, [initialValues])

  const handleSubmit = useCallback((onSubmit) => {
    return async (e) => {
      e.preventDefault()
      setIsSubmitting(true)
      setError(null)
      try {
        await onSubmit(values)
        reset()
      } catch (err) {
        setError(err.message || 'An error occurred')
        throw err
      } finally {
        setIsSubmitting(false)
      }
    }
  }, [values, reset])

  return { values, setValues, setValue, isSubmitting, setIsSubmitting, error, setError, reset, handleSubmit }
}
