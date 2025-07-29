import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/dbConnect'
import Member from '../../../lib/models/Member'

export async function GET() {
  try {
    await dbConnect()
    const members = await Member.find({}).sort({ createdAt: -1 })
    return NextResponse.json(members)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch members', error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    await dbConnect()
    const body = await request.json()

    // Destructure memberId from the body
    const { name, memberId } = body

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      )
    }

    // Add validation for memberId
    if (!memberId || !memberId.trim()) {
      return NextResponse.json(
        { message: 'Member ID is required' },
        { status: 400 }
      )
    }


    if (name.trim().length > 100) {
      return NextResponse.json(
        { message: 'Name must be less than 100 characters' },
        { status: 400 }
      )
    }

    const member = new Member({
      name: name.trim(),
      memberId: memberId.trim() // Add memberId here
    })

    await member.save()
    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    if (error.code === 11000) {
      // More specific error message for unique fields
      if (error.keyPattern.memberId) {
        return NextResponse.json(
          { message: 'A member with this Member ID already exists' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { message: 'A member with this name already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to create member', error: error.message },
      { status: 500 }
    )
  }
}