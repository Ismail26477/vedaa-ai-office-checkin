import mongoose from "mongoose"

const editorTaskSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

const editorSheetSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    sheetName: {
      type: String,
      required: true,
      trim: true,
    },
    tasks: {
      type: [editorTaskSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
)

// Index for finding sheets by employee
editorSheetSchema.index({ employeeId: 1, sheetName: 1 })

export default mongoose.models.EditorSheet || mongoose.model("EditorSheet", editorSheetSchema)
