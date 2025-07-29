'use client'

import { useState, useEffect, useCallback } from 'react'
import { subDays, format } from 'date-fns'
import { AlertCircle, BarChart2, Check, X, Users, PieChart, TrendingUp, UserCheck, Target } from 'lucide-react'

// Import existing dashboard components
import { DateRangePicker } from '@/components/dashboard/DateRangePicker'
import { StatCard } from '@/components/dashboard/StatCard'
import { MemberSummaryTable } from '@/components/dashboard/MemberSummaryTable'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import AttendanceChart from '@/components/AttendanceChart' // Existing chart

// Import new chart components
import AttendanceDistributionChart from '@/components/dashboard/charts/AttendanceDistributionChart'
import DailyComparisonChart from '@/components/dashboard/charts/DailyComparisonChart'

export default function DashboardPage() {
  // State management for date range, report data, loading, and errors
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 7),
    to: new Date(),
  })
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Callback function to fetch report data from the API
  const fetchReportData = useCallback(async () => {
    if (!dateRange.from || !dateRange.to) {
      setError('Please select both a start and end date.')
      return
    }
    if (dateRange.from > dateRange.to) {
      setError('Start date must be before or equal to the end date.')
      return
    }

    setLoading(true)
    setError('')
    setReportData(null)

    try {
      const startDate = format(dateRange.from, 'yyyy-MM-dd')
      const endDate = format(dateRange.to, 'yyyy-MM-dd')
      
      const response = await fetch(`/api/reports/attendance?startDate=${startDate}&endDate=${endDate}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch report data.')
      }

      const data = await response.json()
      setReportData(data)
    } catch (err) {
      setError(err.message)
      setReportData(null)
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  // Fetch data on initial component load and when date range changes
  useEffect(() => {
    fetchReportData()
  }, [fetchReportData])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Attendance Dashboard</h1>
              <p className="text-gray-600 mt-1">Analytics and reports for your team's attendance.</p>
            </div>
            {/* Date Range Picker Component */}
            <div className="flex-shrink-0">
              <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-800 p-4 rounded-r-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm sm:text-base">{error}</p>
            </div>
          )}

          {/* Main Dashboard Content */}
          {loading ? (
            // Loading Skeleton UI
            <DashboardSkeleton />
          ) : reportData ? (
            // Data Loaded UI
            <div className="space-y-6 sm:space-y-8">
              {/* Statistic Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <StatCard
                  title="Overall Attendance"
                  value={`${reportData.overallAttendanceRate.percentagePresent}%`}
                  icon={BarChart2}
                  color="blue"
                />
                <StatCard
                  title="Total Present Days"
                  value={reportData.overallAttendanceRate.totalPresentDays}
                  icon={Check}
                  color="green"
                />
                <StatCard
                  title="Total Absent Days"
                  value={reportData.overallAttendanceRate.totalAbsentDays}
                  icon={X}
                  color="red"
                />
                <StatCard
                  title="Total Days Tracked"
                  value={reportData.overallAttendanceRate.dailyBreakdown.length}
                  icon={Users}
                  color="gray"
                />
              </div>

              {/* Charts Grid - Row 1: Full Width Trend Chart */}
              <div className="w-full">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Daily Attendance Trend
                    </h3>
                  </div>
                  <div className="w-full overflow-x-auto">
                    <AttendanceChart data={reportData.overallAttendanceRate.dailyBreakdown} />
                  </div>
                </div>
              </div>

              {/* Charts Grid - Row 2: Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Attendance Distribution Pie Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <PieChart className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Attendance Distribution
                    </h3>
                  </div>
                  <div className="w-full">
                    <AttendanceDistributionChart data={reportData.overallAttendanceRate.dailyBreakdown} />
                  </div>
                </div>

                {/* Daily Present vs Absent Comparison */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Daily Present vs Absent
                    </h3>
                  </div>
                  <div className="w-full">
                    <DailyComparisonChart data={reportData.overallAttendanceRate.dailyBreakdown} />
                  </div>
                </div>
              </div>

              {/* Individual Member Summary Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-2 p-4 sm:p-6 border-b border-gray-200">
                  <Users className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Individual Member Summary
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <MemberSummaryTable data={reportData.memberAttendanceSummary} />
                </div>
              </div>
            </div>
          ) : (
            // Empty State when no data is returned
            <div className="text-center py-12 sm:py-16 bg-white rounded-xl border border-gray-200 shadow-sm mx-4 sm:mx-0">
              <BarChart2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No Data Available</h3>
              <p className="mt-1 text-sm text-gray-500 px-4">
                No attendance data found for the selected date range.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}