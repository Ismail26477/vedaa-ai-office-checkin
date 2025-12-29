import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import DailyTask from "@/lib/models/DailyTask"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const tasks = await DailyTask.find({ approvalStatus: "pending" })
      .sort({ date: -1 })
      .populate("employeeId", "name email department")

    return NextResponse.json(tasks)
  } catch (error: any) {
    console.error("[v0] Error fetching pending tasks:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch pending tasks" }, { status: 500 })
  }
}
