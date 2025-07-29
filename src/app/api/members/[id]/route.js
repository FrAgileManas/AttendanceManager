import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/dbConnect'
import Member from '../../../../lib/models/Member'

export async function GET(request, { params }) {
  try {
    await dbConnect()
    const { id } = await params
    const member = await Member.findById(id)
    
    if (!member) {
      return NextResponse.json(
        { message: 'Member not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(member)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch member', error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect()
    const body = await request.json()
    const { id } = await params
    const { name } = body
    
    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      )
    }
    
    if (name.trim().length > 100) {
      return NextResponse.json(
        { message: 'Name must be less than 100 characters' },
        { status: 400 }
      )
    }

    const member = await Member.findByIdAndUpdate(
      id,
      { 
        name: name.trim(),
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )
    
    if (!member) {
      return NextResponse.json(
        { message: 'Member not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(member)
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'A member with this name already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: 'Failed to update member', error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect()
    const { id } = await params
    const member = await Member.findByIdAndDelete(id)
    
    if (!member) {
      return NextResponse.json(
        { message: 'Member not found' },
        { status: 404 }
      )
    }
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete member', error: error.message },
      { status: 500 }
    )
  }
}