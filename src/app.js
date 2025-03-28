//in this file we will sets up 
//express app with middleware
//define the base routes


import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
          origin: process.env.CORS_ORIGIN,
          credentials: true,
}))

app.use(express.json({limit: "16kb"}))
//This middleware parses incoming JSON payloads and limits the body size to 16 KB. If the JSON is larger, it rejects the request.
app.use(express.urlencoded({extended: true, limit: "16kb"}))
//This middleware parses URL-encoded data (from form submissions) and supports deep objects (if extended: true). The body size is limited to 16 KB.
app.use(express.static("public"))
//This serves static files (like HTML, CSS, images) from the "public" folder, allowing the app to serve these files directly when requested.
app.use(cookieParser())

import userRouter from './routes/user.routes.js'
//routes import

//routes declaration
app.use('/api/v1/users', userRouter)

// http://localhost:8000/api/v1/users/register


export {app}

