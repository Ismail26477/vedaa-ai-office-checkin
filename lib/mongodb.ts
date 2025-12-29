import mongoose from "mongoose"

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://vedaa:vedaa123@vedaa-ai.blmd84r.mongodb.net/office_management?retryWrites=true&w=majority&appName=vedaa-Ai"

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

// @ts-ignore
let cached = global.mongoose

if (!cached) {
  // @ts-ignore
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    console.log("[v0] Using cached MongoDB connection")
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    }

    console.log("[v0] Creating new MongoDB connection...")
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("[v0] Connected to MongoDB successfully")
      console.log("[v0] Database:", mongoose.connection.name)
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error("[v0] MongoDB connection error:", e)
    throw e
  }

  return cached.conn
}

export default connectDB
