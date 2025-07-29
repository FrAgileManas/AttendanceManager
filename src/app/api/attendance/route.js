import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/dbConnect'
import Attendance from '../../../lib/models/Attendance'
import Member from '../../../lib/models/Member'

export async function POST(request) {
  try {
    await dbConnect()
    const body = await request.json()
    const { date, attendanceRecords } = body
    
    // Validation
    if (!date) {
      return NextResponse.json(
        { message: 'Date is required' },
        { status: 400 }
      )
    }
    
    if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
      return NextResponse.json(
        { message: 'Attendance records must be an array' },
        { status: 400 }
      )
    }
    
    // Validate date format
    const attendanceDate = new Date(date)
    if (isNaN(attendanceDate.getTime())) {
      return NextResponse.json(
        { message: 'Invalid date format' },
        { status: 400 }
      )
    }
    
    // Normalize date to start of day UTC
    const normalizedDate = new Date(Date.UTC(
      attendanceDate.getFullYear(),
      attendanceDate.getMonth(),
      attendanceDate.getDate()
    ))
    
    let updatedCount = 0
    let createdCount = 0
    const errors = []
    
    // Process each attendance record
    for (const record of attendanceRecords) {
      const { memberId, status } = record
      
      // Validate record
      if (!memberId || !status) {
        errors.push(`Missing memberId or status for record: ${JSON.stringify(record)}`)
        continue
      }
      
      if (!['Present', 'Absent'].includes(status)) {
        errors.push(`Invalid status "${status}" for member ${memberId}`)
        continue
      }
      
      // Verify member exists
      const memberExists = await Member.findById(memberId)
      if (!memberExists) {
        errors.push(`Member with ID ${memberId} not found`)
        continue
      }
      
      try {
        // Upsert attendance record
        const result = await Attendance.findOneAndUpdate(
          { memberId, date: normalizedDate },
          { 
            memberId,
            date: normalizedDate,
            status,
            updatedAt: new Date()
          },
          { 
            upsert: true, 
            new: true,
            runValidators: true 
          }
        )
        
        // Check if it was an update or create
        const existingRecord = await Attendance.findOne({ 
          memberId, 
          date: normalizedDate,
          createdAt: { $lt: result.updatedAt }
        })
        
        if (existingRecord) {
          updatedCount++
        } else {
          createdCount++
        }
      } catch (error) {
        errors.push(`Failed to process attendance for member ${memberId}: ${error.message}`)
      }
    }
    
    if (errors.length > 0 && updatedCount + createdCount === 0) {
      return NextResponse.json(
        { message: 'Failed to process attendance records', errors },
        { status: 400 }
      )
    }
    
    const response = {
      message: 'Attendance processed successfully',
      updatedCount,
      createdCount,
      totalProcessed: updatedCount + createdCount
    }
    
    if (errors.length > 0) {
      response.warnings = errors
    }
    
    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to process attendance', error: error.message },
      { status: 500 }
    )
  }
}