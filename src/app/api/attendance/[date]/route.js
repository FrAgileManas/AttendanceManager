import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/dbConnect'
import Attendance from '../../../../lib/models/Attendance'

export async function GET(request, { params }) {
  try {
    await dbConnect()
    const { date } = await params
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { message: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }
    
    // Parse and normalize date
    const [year, month, day] = date.split('-').map(Number)
    const attendanceDate = new Date(Date.UTC(year, month - 1, day))
    
    if (isNaN(attendanceDate.getTime())) {
      return NextResponse.json(
        { message: 'Invalid date' },
        { status: 400 }
      )
    }
    
    // Fetch attendance records for the date with member details (including memberId)
    const attendanceRecords = await Attendance.find({ 
      date: attendanceDate 
    }).populate('memberId', 'name memberId').sort({ 'memberId.name': 1 })
    
    return NextResponse.json(attendanceRecords)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch attendance records', error: error.message },
      { status: 500 }
    )
  }
}