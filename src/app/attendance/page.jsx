"use client"

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { DatePicker } from '../../components/DatePicker'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group'
import { Label } from '../../components/ui/label'
import Loader from '../../components/Loader'
import Link from 'next/link'

export default function AttendanceMarkingPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [members, setMembers] = useState([])
  const [attendanceData, setAttendanceData] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Fetch members on component mount
  useEffect(() => {
    fetchMembers()
  }, [])

  // Fetch attendance data when date changes AND members are loaded
  useEffect(() => {
    if (selectedDate && members.length > 0) {
      fetchAttendanceForDate(selectedDate)
    }
  }, [selectedDate, members])

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members')
      if (!response.ok) throw new Error('Failed to fetch members')
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      setError('Failed to load members')
    }
  }

  const fetchAttendanceForDate = async (date) => {
    setLoading(true)
    setError('')
    
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const response = await fetch(`/api/attendance/${dateStr}`)
      
      if (!response.ok) throw new Error('Failed to fetch attendance data')
      
      const existingAttendance = await response.json()
      
      // Create attendance data object with existing records
      const attendanceMap = {}
      existingAttendance.forEach(record => {
        // FIX: Add a check to ensure record.memberId is not null
        // This prevents an error if a member was deleted but their attendance record still exists.
        if (record.memberId && record.memberId._id) {
          attendanceMap[record.memberId._id] = record.status
        }
      })
      
      // Set default status for members without records
      const fullAttendanceData = {}
      members.forEach(member => {
        fullAttendanceData[member._id] = attendanceMap[member._id] || 'Absent'
      })
      
      setAttendanceData(fullAttendanceData)
    } catch (error) {
      setError('Failed to load attendance data')
      // Initialize with default 'Absent' status
      const defaultData = {}
      members.forEach(member => {
        defaultData[member._id] = 'Absent'
      })
      setAttendanceData(defaultData)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (memberId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [memberId]: status
    }))
  }

  const handleSaveAttendance = async () => {
    setSaving(true)
    setError('')
    setSuccessMessage('')
    
    try {
      const attendanceRecords = Object.entries(attendanceData).map(([memberId, status]) => ({
        memberId,
        status
      }))
      
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          attendanceRecords
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save attendance')
      }
      
      const result = await response.json()
      setSuccessMessage(`Attendance saved successfully! ${result.totalProcessed} records processed.`)
      
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

  // Calculate attendance summary
  const attendanceSummary = React.useMemo(() => {
    const total = members.length
    const present = Object.values(attendanceData).filter(status => status === 'Present').length
    const absent = total - present
    return { total, present, absent }
  }, [members, attendanceData])

  if (members.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Attendance Marking
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Mark daily attendance for team members
            </p>
          </div>
          
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No Members Found
                </h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  You need to add team members before you can mark attendance.
                </p>
                <Link href="/members">
                  <Button size="lg" className="w-full sm:w-auto">
                    Add Members
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Attendance Marking
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Select attendance for each member and save all changes at once
          </p>
        </div>

        {/* Date Selection */}
        <Card className="mb-6 shadow-sm bg-white border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <DatePicker
                date={selectedDate}
                onDateChange={setSelectedDate}
                placeholder="Select attendance date"
                className="w-full sm:w-auto bg-white border border-gray-300 rounded-lg shadow-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Attendance Summary */}
        {!loading && members.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {attendanceSummary.total}
                </div>
                <div className="text-xs sm:text-sm text-blue-700 font-medium">
                  Total Members
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">
                  {attendanceSummary.present}
                </div>
                <div className="text-xs sm:text-sm text-green-700 font-medium">
                  Present
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-red-600">
                  {attendanceSummary.absent}
                </div>
                <div className="text-xs sm:text-sm text-red-700 font-medium">
                  Absent
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Attendance List */}
        <Card className="shadow-sm bg-white border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
              Attendance for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 flex justify-center">
                <Loader />
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member, index) => (
                  <div 
                    key={member._id} 
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                      attendanceData[member._id] === 'Present' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center mb-3 sm:mb-0">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-sm font-medium text-gray-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                          {member.name}
                        </h3>
                        {/* Display Member ID */}
                        <p className="text-xs sm:text-sm text-gray-500">
                          ID: {member.memberId}
                        </p>
                      </div>
                    </div>
                    
                    <RadioGroup
                      value={attendanceData[member._id] || 'Absent'}
                      onValueChange={(value) => handleStatusChange(member._id, value)}
                      className="flex gap-6 justify-start sm:justify-end"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value="Present" 
                          id={`${member._id}-present`} 
                          className="border-green-500 text-green-600"
                        />
                        <Label 
                          htmlFor={`${member._id}-present`} 
                          className="text-green-700 font-medium cursor-pointer text-sm sm:text-base hover:text-green-800"
                        >
                          Present
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value="Absent" 
                          id={`${member._id}-absent`}
                          className="border-red-500 text-red-600"
                        />
                        <Label 
                          htmlFor={`${member._id}-absent`} 
                          className="text-red-700 font-medium cursor-pointer text-sm sm:text-base hover:text-red-800"
                        >
                          Absent
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="mt-8 flex justify-center sm:justify-end">
          <Button
            onClick={handleSaveAttendance}
            disabled={loading || saving || members.length === 0}
            size="lg"
            className="w-full sm:w-auto px-8 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Attendance...
              </>
            ) : (
              'Save All Attendance'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}