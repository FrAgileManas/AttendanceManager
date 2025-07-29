'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AttendanceChart from '@/components/AttendanceChart'

export default function Dashboard() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Set default dates (last 7 days)
  useEffect(() => {
    const today = new Date()
    const weekAgo = new Date()
    weekAgo.setDate(today.getDate() - 7)
    
    setEndDate(today.toISOString().split('T')[0])
    setStartDate(weekAgo.toISOString().split('T')[0])
  }, [])

  // Auto-fetch data when dates change
  useEffect(() => {
    if (startDate && endDate) {
      fetchReportData()
    }
  }, [startDate, endDate])

  const fetchReportData = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before or equal to end date')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `/api/reports/attendance?startDate=${startDate}&endDate=${endDate}`
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch report data')
      }

      const data = await response.json()
      setReportData(data)
    } catch (error) {
      setError(error.message)
      setReportData(null)
    } finally {
      setLoading(false)
    }
  }

  const formatDateRange = () => {
    if (!startDate || !endDate) return ''
    const start = new Date(startDate).toLocaleDateString()
    const end = new Date(endDate).toLocaleDateString()
    return `${start} - ${end}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
          <p className="text-gray-600">View attendance reports and analytics for your team</p>
        </div>

        {/* Date Range Picker */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date Range</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          {formatDateRange() && (
            <p className="text-sm text-gray-600 mt-2">
              Showing data for: {formatDateRange()}
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading report data...</span>
          </div>
        )}

        {/* Report Content */}
        {!loading && reportData && (
          <>
            {/* Overall Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Overall Attendance
                </h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {reportData.overallAttendanceRate.percentagePresent}%
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Total Present Days
                </h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {reportData.overallAttendanceRate.totalPresentDays}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Total Absent Days
                </h3>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {reportData.overallAttendanceRate.totalAbsentDays}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Days Tracked
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {reportData.overallAttendanceRate.totalDaysTracked}
                </p>
              </div>
            </div>

            {/* Attendance Chart */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Daily Attendance Trend
              </h3>
              <AttendanceChart data={reportData.overallAttendanceRate.dailyBreakdown} />
            </div>

            {/* Member Attendance Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Individual Member Summary
              </h3>
              
              {reportData.memberAttendanceSummary.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No members found. Please add members first.</p>
                  <Link 
                    href="/members"
                    className="inline-block mt-2 text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Go to Members
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Present Days
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Absent Days
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Tracked
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendance Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.memberAttendanceSummary.map((member) => {
                        const attendanceRate = member.totalTrackedDays > 0 
                          ? Math.round((member.presentDays / member.totalTrackedDays) * 100)
                          : 0
                        
                        return (
                          <tr key={member.memberId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {member.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-green-600 font-medium">
                                {member.presentDays}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-red-600 font-medium">
                                {member.absentDays}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">
                                {member.totalTrackedDays}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      attendanceRate >= 80 ? 'bg-green-500' : 
                                      attendanceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${attendanceRate}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 w-12">
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
              )}
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !reportData && !error && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Data Available
              </h3>
              <p className="text-gray-600 mb-4">
                Please select a date range to view attendance reports.
              </p>
              <p className="text-sm text-gray-500">
                Make sure you have added members and marked attendance for the selected period.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}