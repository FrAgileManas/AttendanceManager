'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, X, User } from 'lucide-react'

export default function MemberFormPage() {
  const router = useRouter()
  const params = useParams()
  const isEditing = params.id !== 'new'
  
  const [formData, setFormData] = useState({ name: '', memberId: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState({ name: '', memberId: '' })

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
      setFormData({ 
        name: member.name || '', 
        memberId: member.memberId || '' 
      })
    } catch (err) {
      setError('Failed to load member details')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    let errors = { name: '', memberId: '' }
    let isValid = true

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
      isValid = false
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Name must be less than 100 characters'
      isValid = false
    }

    if (!formData.memberId.trim()) {
      errors.memberId = 'Member ID is required'
      isValid = false
    }

    setValidationError(errors)
    return isValid
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
        body: JSON.stringify({ 
          name: formData.name.trim(), 
          memberId: formData.memberId.trim() 
        })
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
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
    if (validationError[id]) {
      setValidationError(prev => ({ ...prev, [id]: '' }))
    }
  }

  if (loading && isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-gray-600 text-sm sm:text-base">Loading member...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Navigation */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/members"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
          >
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-sm sm:text-base">Back to Members</span>
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-5 sm:px-6 sm:py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {isEditing ? 'Edit Member' : 'Add New Member'}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {isEditing 
                    ? 'Update member information below' 
                    : 'Add a new team member to start tracking attendance'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-4 py-5 sm:px-6 sm:py-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label 
                  htmlFor="name" 
                  className="block text-sm font-semibold text-gray-900 mb-3"
                >
                  Member Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                      validationError.name 
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 bg-white hover:border-gray-400'
                    }`}
                    placeholder="Enter member's full name"
                    maxLength={100}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-xs text-gray-400">
                      {formData.name.length}/100
                    </span>
                  </div>
                </div>
                {validationError.name && (
                  <div className="mt-2 flex items-center">
                    <svg className="h-4 w-4 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-600">{validationError.name}</p>
                  </div>
                )}
                <p className="mt-2 text-xs sm:text-sm text-gray-500">
                  This will be used to identify the member in attendance records.
                </p>
              </div>

              {/* Member ID Field */}
              <div>
                <label
                  htmlFor="memberId"
                  className="block text-sm font-semibold text-gray-900 mb-3"
                >
                  Member ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="memberId"
                    type="text"
                    value={formData.memberId}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                      validationError.memberId
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 bg-white hover:border-gray-400'
                    }`}
                    placeholder="Enter unique member ID"
                    required
                  />
                </div>
                {validationError.memberId && (
                  <div className="mt-2 flex items-center">
                    <svg className="h-4 w-4 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-600">{validationError.memberId}</p>
                  </div>
                )}
                <p className="mt-2 text-xs sm:text-sm text-gray-500">
                  This is a unique identifier for the member.
                </p>
              </div>

              {/* Form Actions */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row-reverse gap-3 sm:gap-4">
                  <button
                    type="submit"
                    disabled={loading || !formData.name.trim() || !formData.memberId.trim()}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
                        <span>{isEditing ? 'Update Member' : 'Add Member'}</span>
                      </>
                    )}
                  </button>
                  
                  <Link
                    href="/members"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    <X size={18} className="mr-2" />
                    <span>Cancel</span>
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                {isEditing ? 'Updating Member' : 'Adding New Member'}
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  {isEditing 
                    ? 'Changes will be reflected in all future attendance records. Past attendance records will remain unchanged.'
                    : 'Once added, you can start marking attendance for this member. They will appear in the attendance marking interface.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}