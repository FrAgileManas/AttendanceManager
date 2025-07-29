'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Users } from 'lucide-react'
import ConfirmDialog from '../../components/ConfirmDialog'
import Loader from '../../components/Loader'

export default function MembersPage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, member: null })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/members')
      if (!response.ok) throw new Error('Failed to fetch members')
      const data = await response.json()
      setMembers(data)
    } catch (err) {
      setError('Failed to load members. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (member) => {
    try {
      const response = await fetch(`/api/members/${member._id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete member')
      
      setMembers(members.filter(m => m._id !== member._id))
      setDeleteConfirm({ open: false, member: null })
    } catch (err) {
      setError('Failed to delete member. Please try again.')
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Team Members</h1>
        <Link
          href="/members/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Add New Member
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {members.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <Users size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No members added yet</h3>
          <p className="text-slate-500 mb-4">Click 'Add New Member' to get started.</p>
          <Link
            href="/members/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} className="mr-2" />
            Add New Member
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Added On
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {members.map((member) => (
                <tr key={member._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {member.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/members/${member._id}`}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        <Edit size={14} className="mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm({ open: true, member })}
                        className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, member: null })}
        onConfirm={() => handleDelete(deleteConfirm.member)}
        title="Delete Member"
        description={`Are you sure you want to delete ${deleteConfirm.member?.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="destructive"
      />
    </div>
  )
}