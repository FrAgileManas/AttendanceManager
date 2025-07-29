import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Attendance from '@/lib/models/Attendance'
import Member from '@/lib/models/Member'

// POST method for saving attendance data
export async function POST(request) {
  try {
    console.log('Attendance POST API: Starting request')
    await dbConnect()
    console.log('Attendance POST API: Database connected')
    
    const body = await request.json()
    const { date, attendanceRecords } = body
    console.log('Attendance POST API: Received data', { date, recordsCount: attendanceRecords?.length })
    
    // Validation
    if (!date || !attendanceRecords || !Array.isArray(attendanceRecords)) {
      return NextResponse.json(
        { message: 'Date and attendanceRecords array are required' },
        { status: 400 }
      )
    }
    
    if (attendanceRecords.length === 0) {
      return NextResponse.json(
        { message: 'At least one attendance record is required' },
        { status: 400 }
      )
    }
    
    // Parse and normalize the date
    const attendanceDate = new Date(date)
    if (isNaN(attendanceDate.getTime())) {
      return NextResponse.json(
        { message: 'Invalid date format' },
        { status: 400 }
      )
    }
    
    // Normalize to start of day in UTC
    const normalizedDate = new Date(Date.UTC(
      attendanceDate.getFullYear(),
      attendanceDate.getMonth(),
      attendanceDate.getDate()
    ))
    
    console.log('Attendance POST API: Normalized date', normalizedDate)
    
    // Validate member IDs exist
    const memberIds = attendanceRecords.map(record => record.memberId)
    const existingMembers = await Member.find({ _id: { $in: memberIds } })
    
    if (existingMembers.length !== memberIds.length) {
      return NextResponse.json(
        { message: 'Some member IDs are invalid' },
        { status: 400 }
      )
    }
    
    console.log('Attendance POST API: All members validated')
    
    // Process attendance records
    const updateOperations = []
    let processedCount = 0
    
    for (const record of attendanceRecords) {
      const { memberId, status } = record
      
      // Validate status
      if (!['Present', 'Absent'].includes(status)) {
        console.log(`Invalid status for member ${memberId}: ${status}`)
        continue
      }
      
      // Use upsert to create or update attendance record
      updateOperations.push({
        updateOne: {
          filter: {
            memberId: memberId,
            date: normalizedDate
          },
          update: {
            $set: {
              memberId: memberId,
              date: normalizedDate,
              status: status,
              updatedAt: new Date()
            },
            $setOnInsert: {
              createdAt: new Date()
            }
          },
          upsert: true
        }
      })
      
      processedCount++
    }
    
    console.log('Attendance POST API: Prepared operations', updateOperations.length)
    
    // Execute bulk operations
    if (updateOperations.length > 0) {
      const result = await Attendance.bulkWrite(updateOperations)
      console.log('Attendance POST API: Bulk write result', result)
      
      return NextResponse.json({
        message: 'Attendance saved successfully',
        totalProcessed: processedCount,
        upsertedCount: result.upsertedCount,
        modifiedCount: result.modifiedCount,
        date: normalizedDate.toISOString().split('T')[0]
      })
    } else {
      return NextResponse.json(
        { message: 'No valid attendance records to process' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('Attendance POST API: Error', error)
    console.error('Attendance POST API: Error stack', error.stack)
    return NextResponse.json(
      { 
        message: 'Failed to save attendance', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// GET method for fetching reports (existing code)
export async function GET(request) {
  try {
    console.log('Reports API: Starting request')
    await dbConnect()
    console.log('Reports API: Database connected')
    
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    console.log('Reports API: Received dates', { startDate, endDate })
    
    // Validation
    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: 'Both startDate and endDate are required' },
        { status: 400 }
      )
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json(
        { message: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }
    
    // Parse dates and normalize
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number)
    
    const start = new Date(Date.UTC(startYear, startMonth - 1, startDay))
    const end = new Date(Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59, 999))
    console.log('Reports API: Parsed dates', { start, end })
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.log('Reports API: Invalid date values')
      return NextResponse.json(
        { message: 'Invalid date values' },
        { status: 400 }
      )
    }
    
    if (start > end) {
      console.log('Reports API: Start date after end date')
      return NextResponse.json(
        { message: 'Start date must be before or equal to end date' },
        { status: 400 }
      )
    }
    
    console.log('Reports API: Fetching members')
    // Get all members (including memberId field)
    const allMembers = await Member.find({}).sort({ name: 1 })
    console.log('Reports API: Found members', allMembers.length)
    
    console.log('Reports API: Fetching attendance records')
    // Get attendance records for the date range (populate with memberId field)
    const attendanceRecords = await Attendance.find({
      date: { $gte: start, $lte: end }
    }).populate('memberId', 'name memberId').sort({ date: 1 })
    console.log('Reports API: Found attendance records', attendanceRecords.length)
    
    // Calculate overall attendance rate
    const dailyBreakdown = []
    const memberAttendanceSummary = {}
    
    console.log('Reports API: Initializing member summary')
    // Initialize member summary
   allMembers.forEach(member => {
  // Log to debug what we're getting from the member object
  console.log('Member data:', { 
    _id: member._id, 
    memberId: member.memberId, 
    name: member.name 
  })
  
  memberAttendanceSummary[member._id.toString()] = {
    // Use the custom memberId field from the schema (this should be a string like "EMP001")
    memberId: member.memberId, // This is the custom member ID from your Member schema
    name: member.name,
    presentDays: 0,
    absentDays: 0,
    totalTrackedDays: 0
  }
})
    
    console.log('Reports API: Grouping attendance by date')
    // Group attendance by date
    const attendanceByDate = {}
    attendanceRecords.forEach(record => {
      try {
        const dateKey = record.date.toISOString().split('T')[0]
        if (!attendanceByDate[dateKey]) {
          attendanceByDate[dateKey] = []
        }
        attendanceByDate[dateKey].push(record)
      } catch (error) {
        console.error('Reports API: Error processing record', record, error)
      }
    })
    console.log('Reports API: Grouped dates', Object.keys(attendanceByDate))
    
    console.log('Reports API: Generating date range')
    // Generate date range array
    const dateRange = []
    const currentDate = new Date(start)
    while (currentDate <= end) {
      dateRange.push(currentDate.toISOString().split('T')[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }
    console.log('Reports API: Date range', dateRange)
    
    console.log('Reports API: Processing daily breakdown')
    // Process each date in the range
    let totalDaysInRange = 0
    dateRange.forEach((dateKey, index) => {
      try {
        const dayAttendance = attendanceByDate[dateKey] || []
        console.log(`Reports API: Processing date ${dateKey}, found ${dayAttendance.length} records`)
        
        // Only count days where at least one person has attendance marked
        if (dayAttendance.length > 0) {
          totalDaysInRange++
          
          // Filter out orphaned records (where memberId is null)
          const validAttendance = dayAttendance.filter(record => record.memberId && record.memberId._id)
          
          const presentCount = validAttendance.filter(record => record.status === 'Present').length
          const absentCount = validAttendance.filter(record => record.status === 'Absent').length
          const totalMembers = validAttendance.length // Use valid attendance records count
          
          dailyBreakdown.push({
            date: dateKey,
            presentCount,
            absentCount,
            totalMembers,
            percentagePresent: totalMembers > 0 ? Math.round((presentCount / totalMembers) * 100) : 0
          })
          
          // Update member summaries
          dayAttendance.forEach(record => {
            try {
              // Skip records with null memberId (orphaned records)
              if (!record.memberId || !record.memberId._id) {
                console.log('Reports API: Skipping orphaned attendance record', record._id)
                return
              }
              
              const memberKey = record.memberId._id.toString()
              if (memberAttendanceSummary[memberKey]) {
                memberAttendanceSummary[memberKey].totalTrackedDays++
                if (record.status === 'Present') {
                  memberAttendanceSummary[memberKey].presentDays++
                } else {
                  memberAttendanceSummary[memberKey].absentDays++
                }
              }
            } catch (error) {
              console.error('Reports API: Error updating member summary', record, error)
            }
          })
        }
      } catch (error) {
        console.error('Reports API: Error processing date', dateKey, error)
      }
    })
    
    console.log('Reports API: Calculating totals')
    // Calculate totals
    const totalPresentDays = dailyBreakdown.reduce((sum, day) => sum + day.presentCount, 0)
    const totalAbsentDays = dailyBreakdown.reduce((sum, day) => sum + day.absentCount, 0)
    const totalDaysTracked = totalPresentDays + totalAbsentDays
    const percentagePresent = totalDaysTracked > 0 ? Math.round((totalPresentDays / totalDaysTracked) * 100) : 0
    
    console.log('Reports API: Building response')
    const response = {
      overallAttendanceRate: {
        totalDaysTracked,
        totalPresentDays,
        totalAbsentDays,
        percentagePresent,
        dailyBreakdown
      },
      memberAttendanceSummary: Object.values(memberAttendanceSummary).filter(
        member => member.totalTrackedDays > 0
      )
    }
    
    console.log('Reports API: Response ready', {
      dailyBreakdownCount: response.overallAttendanceRate.dailyBreakdown.length,
      memberSummaryCount: response.memberAttendanceSummary.length
    })
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Reports API: Unhandled error', error)
    console.error('Reports API: Error stack', error.stack)
    return NextResponse.json(
      { 
        message: 'Failed to generate attendance report', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}