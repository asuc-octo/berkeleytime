// This is a random Model
import mongoose, { Document } from "mongoose"

const FruitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  season: { type: String, required: true },
})

interface IFruit extends Document {
  name: string
  season: string
  createdAt?: Date
  updatedAt?: Date
}

export default mongoose.model<IFruit>("fruits", FruitSchema)
