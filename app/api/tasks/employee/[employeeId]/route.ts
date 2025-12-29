import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import DailyTask from "@/lib/models/DailyTask"

export async function GET(request: NextRequest, { params }: { params: Promise<{ employeeId: string }> }) {
  try {
    await connectDB()
    const { employeeId } = await params

    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    const query: any = { employeeId }

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1)
      const endDate = new Date(Number(year), Number(month), 0)
      query.date = { $gte: startDate, $lte: endDate }
    }

    const tasks = await DailyTask.find(query).sort({ date: -1 }).populate("employeeId", "name email")

    return NextResponse.json(tasks)
  } catch (error: any) {
    console.error("[v0] Error fetching tasks:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch tasks" }, { status: 500 })
  }
}
