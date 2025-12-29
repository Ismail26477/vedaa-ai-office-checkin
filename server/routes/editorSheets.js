import express from "express"
import EditorSheet from "../models/EditorSheet.js"

const router = express.Router()

// Get all sheets for an employee
router.get("/employee/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params
    const sheets = await EditorSheet.find({ employeeId }).sort({ createdAt: 1 })
    res.json({ success: true, sheets })
  } catch (error) {
    console.error("[v0] Error fetching sheets:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Create a new sheet
router.post("/create", async (req, res) => {
  try {
    const { employeeId, employeeName, sheetName } = req.body

    if (!employeeId || !employeeName || !sheetName) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: employeeId, employeeName, or sheetName",
      })
    }

    const sheet = new EditorSheet({
      employeeId,
      employeeName,
      sheetName,
      tasks: [],
    })

    await sheet.save()
    res.status(201).json({ success: true, sheet })
  } catch (error) {
    console.error("[v0] Error creating sheet:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

router.post("/:sheetId/add-task", async (req, res) => {
  try {
    const { sheetId } = req.params
    const { date, title, link } = req.body

    const sheet = await EditorSheet.findById(sheetId)
    if (!sheet) {
      return res.status(404).json({ success: false, error: "Sheet not found" })
    }

    sheet.tasks.push({ date, title, link })
    await sheet.save()

    res.status(201).json({ success: true, task: sheet.tasks[sheet.tasks.length - 1] })
  } catch (error) {
    console.error("[v0] Error adding task:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

router.put("/:sheetId/update-task", async (req, res) => {
  try {
    const { sheetId } = req.params
    const { taskId, date, title, link } = req.body

    const sheet = await EditorSheet.findById(sheetId)
    if (!sheet) {
      return res.status(404).json({ success: false, error: "Sheet not found" })
    }

    const task = sheet.tasks.id(taskId)
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" })
    }

    if (date) task.date = date
    if (title) task.title = title
    if (link) task.link = link

    await sheet.save()
    res.json({ success: true, task })
  } catch (error) {
    console.error("[v0] Error updating task:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

router.delete("/:sheetId/delete-task", async (req, res) => {
  try {
    const { sheetId } = req.params
    const { taskId } = req.query

    const sheet = await EditorSheet.findById(sheetId)
    if (!sheet) {
      return res.status(404).json({ success: false, error: "Sheet not found" })
    }

    sheet.tasks.pull({ _id: taskId })
    await sheet.save()

    res.json({ success: true, message: "Task deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting task:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Admin: Get all sheets
router.get("/all", async (req, res) => {
  try {
    const sheets = await EditorSheet.find({}).sort({ updatedAt: -1 })
    res.json({ success: true, sheets })
  } catch (error) {
    console.error("[v0] Error fetching all sheets:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
