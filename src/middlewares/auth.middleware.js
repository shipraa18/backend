import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import {User} from "../models/user.models.js"

// verifyJWT: this middleware function is used to verify the access token provided in the request header or cookie.t

export const verifyJWT = asyncHandler(async(req,_,next)=>{

         try {
          const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
 
          if(!token)
          {
           throw new ApiError(401,"unauthorized request")
          }
 
          const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
         const user= await User.findById(decodedToken?._id).select("-password -refreshToken" )
 
         if(!user)
         {
           //NEXT_VIDEO: discuss about frontend
           throw new ApiError(401,"invalid access token")
         }
         
         req.user=user
         next()
         } catch (error) {
          throw new ApiError(401,error?.message || "invalid access token")
         }
})