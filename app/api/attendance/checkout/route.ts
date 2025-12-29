import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import AttendanceRecord from "@/lib/models/AttendanceRecord"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { recordId, location } = body

    if (!recordId) {
      return NextResponse.json(
        {
          success: false,
          error: "Record ID is required",
        },
        { status: 400 },
      )
    }

    const record = await AttendanceRecord.findById(recordId)

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error: "Record not found",
        },
        { status: 404 },
      )
    }

    if (record.status === "checked-out") {
      return NextResponse.json(
        {
          success: false,
          error: "Already checked out",
        },
        { status: 400 },
      )
    }

    const checkOutTime = new Date()
    const checkInTime = record.checkInTime
    const totalHours = checkInTime ? (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60) : 0

    record.checkOutTime = checkOutTime
    record.checkOutLocation = {
      latitude: location?.latitude || 0,
      longitude: location?.longitude || 0,
      address: location?.address || "Location not available",
      accuracy: location?.accuracy || null,
    }
    record.totalHours = Math.round(totalHours * 100) / 100
    record.status = "checked-out"

    await record.save()

    return NextResponse.json({
      success: true,
      record: {
        _id: record._id,
        id: record._id,
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        date: record.date,
        checkInTime: record.checkInTime,
        checkInLocation: record.checkInLocation,
        checkOutTime: record.checkOutTime,
        checkOutLocation: record.checkOutLocation,
        totalHours: record.totalHours,
        status: record.status,
        deviceInfo: record.deviceInfo,
      },
    })
  } catch (error: any) {
    console.error("[v0] Check-out error:", error)
    return NextResponse.json({ success: false, error: "Failed to check out", details: error.message }, { status: 500 })
  }
}
