import express, { Express } from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import taskRoutes from './routes/tasks'

dotenv.config()

const app: Express = express()

app.use(cors())
app.use(express.json())

app.use('/api/tasks', taskRoutes)

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))