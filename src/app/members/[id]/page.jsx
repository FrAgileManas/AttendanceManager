'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, X } from 'lucide-react'

export default function MemberFormPage() {
  const router = useRouter()
  const params = useParams()
  const isEditing = params.id !== 'new'
  
  const [formData, setFormData] = useState({ name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    if (isEditing) {
      fetchMember()
    }
  }, [isEditing])

  const fetchMember = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/members/${params.id}`)
      if (!response.ok) throw new Error('Member not found')
      const member = await response.json()
      setFormData({ name: member.name })
    } catch (err) {
      setError('Failed to load member details')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setValidationError('Name is required')
      return false
    }
    if (formData.name.trim().length > 100) {
      setValidationError('Name must be less than 100 characters')
      return false
    }
    setValidationError('')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      setError('')

      const url = isEditing ? `/api/members/${params.id}` : '/api/members'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name.trim() })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save member')
      }

      router.push('/members')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({ name: e.target.value })
    if (validationError) setValidationError('')
  }

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-slate-600">Loading member...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/members"
          className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Members
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          {isEditing ? 'Edit Member' : 'Add New Member'}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationError 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-slate-300 focus:border-blue-500'
              }`}
              placeholder="Enter member name"
              maxLength={100}
              required
            />
            {validationError && (
              <p className="mt-1 text-sm text-red-600">{validationError}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
            <Link
              href="/members"
              className="inline-flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <X size={18} className="mr-2" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  {isEditing ? 'Update Member' : 'Add Member'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}