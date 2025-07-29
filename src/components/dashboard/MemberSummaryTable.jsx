'use client'

import Link from 'next/link'
import { Users } from 'lucide-react'

/**
 * A responsive table to display individual member attendance summaries.
 * @param {object} props - The component props.
 * @param {Array} props.data - The array of member summary data.
 */
export function MemberSummaryTable({ data }) {
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
          {data.map((member) => {
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
                  <div className="text-xs text-gray-500">Object ID: {displayMemberId}</div>
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
  )
}