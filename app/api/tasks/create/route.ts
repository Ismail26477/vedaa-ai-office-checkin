import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import DailyTask from "@/lib/models/DailyTask"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { employeeId, date, project, workingTime, taskDone, researchDone, remarks } = body

    // Validate required fields
    if (
      !employeeId ||
      !date ||
      !project ||
      !taskDone ||
      !remarks ||
      remarks.timeTaken === undefined ||
      remarks.timeExpected === undefined ||
      !remarks.reason
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if task already exists for this date
    const existingTask = await DailyTask.findOne({
      employeeId,
      date: new Date(date).setHours(0, 0, 0, 0),
    })

    if (existingTask) {
      return NextResponse.json({ error: "Task already exists for this date" }, { status: 409 })
    }

    const newTask = await DailyTask.create({
      employeeId,
      date: new Date(date),
      project,
      workingTime,
      taskDone,
      researchDone: researchDone || "",
      remarks,
    })

    return NextResponse.json(newTask, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating task:", error)
    return NextResponse.json({ error: error.message || "Failed to create task" }, { status: 500 })
  }
}
