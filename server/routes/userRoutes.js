import express from 'express'
import {registerUser,loginUser} from '../controllers/user.controller.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)


export default userRouter


// http://loaclhost:4000/api/resgister
// http://localhost:4000/api/user/login