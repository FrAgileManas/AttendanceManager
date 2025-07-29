'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, Save, Calendar, User } from 'lucide-react'
import {DatePicker} from '../../../../components/DatePicker'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group'
import { Label } from '../../../../components/ui/label'
import Loader from '../../../../components/Loader'

export default function MemberAttendancePage() {
  const router = useRouter()
  const params = useParams()
  const memberId = params.id
  
  const [member, setMember] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [attendanceStatus, setAttendanceStatus] = useState('Absent')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [attendanceHistory, setAttendanceHistory] = useState([])

  useEffect(() => {
    if (memberId) {
      fetchMember()
      fetchAttendanceHistory()
    }
  }, [memberId])

  useEffect(() => {
    if (selectedDate && member) {
      fetchAttendanceForDate(selectedDate)
    }
  }, [selectedDate, member])

  const fetchMember = async () => {
    try {
      const response = await fetch(`/api/members/${memberId}`)
      if (!response.ok) throw new Error('Member not found')
      const memberData = await response.json()
      setMember(memberData)
    } catch (error) {
      setError('Failed to load member details')
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendanceHistory = async () => {
    try {
      // Get last 10 attendance records for this member
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const response = await fetch(
        `/api/attendance?startDate=${format(thirtyDaysAgo, 'yyyy-MM-dd')}&endDate=${format(new Date(), 'yyyy-MM-dd')}`
      )
      
      if (response.ok) {
        const data = await response.json()
        // Filter attendance for this specific member
        const memberAttendance = data.overallAttendanceRate.dailyBreakdown
          .filter(day => day.date)
          .slice(-10) // Get last 10 records
        setAttendanceHistory(memberAttendance)
      }
    } catch (error) {
      console.error('Failed to fetch attendance history:', error)
    }
  }

  const fetchAttendanceForDate = async (date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const response = await fetch(`/api/attendance/${dateStr}`)
      
      if (response.ok) {
        const existingAttendance = await response.json()
        const memberRecord = existingAttendance.find(
          record => record.memberId._id === memberId
        )
        
        setAttendanceStatus(memberRecord ? memberRecord.status : 'Absent')
      } else {
        setAttendanceStatus('Absent')
      }
    } catch (error) {
      console.error('Failed to fetch attendance for date:', error)
      setAttendanceStatus('Absent')
    }
  }

  const handleSaveAttendance = async () => {
    setSaving(true)
    setError('')
    setSuccessMessage('')
    
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          attendanceRecords: [{
            memberId: memberId,
            status: attendanceStatus
          }]
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save attendance')
      }
      
      setSuccessMessage(
        `Attendance for ${member.name} on ${format(selectedDate, 'MMMM d, yyyy')} has been updated to ${attendanceStatus}.`
      )
      
      // Refresh attendance history
      fetchAttendanceHistory()
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    } catch (error) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-64">
            <Loader />
          </div>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8 sm:py-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Member not found</h2>
            <Link href="/members">
              <Button className="w-full sm:w-auto">Back to Members</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-3 sm:py-4 md:py-6 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <Link
            href="/members"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
          >
            <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px] mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-sm sm:text-base">Back to Members</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={20} className="sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {member.name}
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                ID: {member.memberId}
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 px-4 sm:px-0">
            Update attendance for any specific date
          </p>
        </div>

        {/* Date Selection */}
        <Card className="mb-4 sm:mb-6 shadow-sm bg-white border-0">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 flex items-center">
              <Calendar size={16} className="sm:w-5 sm:h-5 mr-2" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="relative">
              <DatePicker
                date={selectedDate}
                onDateChange={setSelectedDate}
                placeholder="Select attendance date"
                className="w-full bg-white border border-gray-300 rounded-lg shadow-sm text-sm sm:text-base h-10 sm:h-auto"
              />
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg mx-1 sm:mx-0">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm text-red-800 leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg mx-1 sm:mx-0">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm text-green-800 leading-relaxed">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Status */}
        <Card className="mb-6 sm:mb-8 shadow-sm bg-white border-0">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 leading-tight">
              <span className="hidden sm:inline">
                Attendance for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </span>
              <span className="sm:hidden">
                {format(selectedDate, 'MMM d, yyyy')}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className={`p-4 sm:p-6 rounded-lg border-2 transition-all duration-200 ${
              attendanceStatus === 'Present' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                {/* Member Info */}
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <span className="text-sm sm:text-lg font-medium text-gray-600">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-lg truncate">
                      {member.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      ID: {member.memberId}
                    </p>
                  </div>
                </div>
                
                {/* Radio Group */}
                <RadioGroup
                  value={attendanceStatus}
                  onValueChange={setAttendanceStatus}
                  className="flex flex-row sm:flex-row gap-4 sm:gap-6 justify-center sm:justify-end"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value="Present" 
                      id="present"
                      className="border-green-500 text-green-600 w-4 h-4 sm:w-5 sm:h-5"
                    />
                    <Label 
                      htmlFor="present"
                      className="text-green-700 font-medium cursor-pointer text-sm sm:text-base hover:text-green-800 whitespace-nowrap"
                    >
                      Present
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value="Absent" 
                      id="absent"
                      className="border-red-500 text-red-600 w-4 h-4 sm:w-5 sm:h-5"
                    />
                    <Label 
                      htmlFor="absent"
                      className="text-red-700 font-medium cursor-pointer text-sm sm:text-base hover:text-red-800 whitespace-nowrap"
                    >
                      Absent
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="mb-6 sm:mb-8 flex justify-center sm:justify-end px-1 sm:px-0">
          <Button
            onClick={handleSaveAttendance}
            disabled={saving}
            size="lg"
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 min-h-[44px] sm:min-h-[48px]"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="hidden sm:inline">Saving...</span>
                <span className="sm:hidden">Saving</span>
              </>
            ) : (
              <>
                <Save size={16} className="sm:w-[18px] sm:h-[18px] mr-2" />
                <span className="hidden sm:inline">Save Attendance</span>
                <span className="sm:hidden">Save</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}