const express = require ('express')
const helmet  = require('helmet')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRouter = require('./routers/authRouter')

const app =express()
const mongoose = require('mongoose')
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))
app.use('/api/auth',authRouter)
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log('Database connected');
    
})
.catch((error)=>{
    console.log(error);
    
})
app.get('/',(req,res)=>{
    res.json({message:"Hello from the server"})
})

app.listen(process.env.PORT,()=>{
    console.log("listening on port",process.env.PORT)
})