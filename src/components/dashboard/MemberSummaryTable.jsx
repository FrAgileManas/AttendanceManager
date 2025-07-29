'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users } from 'lucide-react'

/**
 * A responsive table to display individual member attendance summaries with search functionality.
 * @param {object} props - The component props.
 * @param {Array} props.data - The array of member summary data.
 */
export function MemberSummaryTable({ data }) {
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  // Initialize filtered data and handle search filtering
  useEffect(() => {
    if (!data || data.length === 0) {
      setFilteredData([])
      return
    }

    const filtered = data.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.memberId && member.memberId.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredData(filtered)
  }, [data, searchTerm])

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 px-6">
        <Users className="mx-auto h-10 w-10 text-gray-400" />
        <h3 className="mt-2 text-md font-medium text-gray-900">No Member Data</h3>
        <p className="mt-1 text-sm text-gray-500">
          No attendance was recorded for any members in this period.
        </p>
        <Link href="/members" className="mt-4 inline-block">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                Manage Members
            </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search members by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            Showing {filteredData.length} of {data.length} members
          </p>
        )}
      </div>

      {/* No Results State */}
      {filteredData.length === 0 && searchTerm ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-10 w-10 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search terms or clear the search to see all members.
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Present
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Absent
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Days
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((member) => {
                  const attendanceRate = member.totalTrackedDays > 0
                    ? Math.round((member.presentDays / member.totalTrackedDays) * 100)
                    : 0

                  let progressBarColor = 'bg-red-500'
                  if (attendanceRate >= 80) {
                    progressBarColor = 'bg-green-500'
                  } else if (attendanceRate >= 50) {
                    progressBarColor = 'bg-yellow-500'
                  }

                  // Use the memberId field from the API response
                  const displayMemberId = member.memberId

                  return (
                    <tr key={displayMemberId || member.name} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-xs text-gray-500">ID: {displayMemberId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                        {member.presentDays}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                        {member.absentDays}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {member.totalTrackedDays}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`${progressBarColor} h-2 rounded-full`}
                              style={{ width: `${attendanceRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-10 text-right">
                            {attendanceRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Member Count */}
          <div className="mt-4 text-sm text-gray-500 text-center">
            {searchTerm ? (
              <>Showing {filteredData.length} of {data.length} members</>
            ) : (
              <>{data.length} {data.length === 1 ? 'member' : 'members'} total</>
            )}
          </div>
        </>
      )}
    </div>
  )
}