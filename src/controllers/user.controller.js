import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessAndRefreshTokens= async(userId)=>{
          try
          {
                    const user = await User.findOne(userId);
                    const accessToken=user.generateAccessToken();
                    const refreshToken=user.generateRefreshToken();

                    user.refreshToken=refreshToken;//saving the refresh token in the databse 
                    // below is the method to validate before saving that if all the credentials are fullfilled or not
                    await user.save({ ValiditeBeforeSave: false})

                    return {accessToken, refreshToken}

          }
          catch(error)
          {
                    throw new ApiError(500, "Something went wrong while generating referesh and access token")

          }
}

const registerUser = asyncHandler(async(req,res)=>{
          // get user details from frontend
          // validation - not empty
          // check if user already exists: username, email
          // check for images, check for avatar
          // upload them to cloudinary, avatar
          // create object - create entry in db
          // remove password and refresh token field from response
          // check for user creation 
          // return response
          const {fullName, email, username, password}=req.body
          // console.log("email: ",email);
          // console.log(req.body);
          // if(fullName === "")
          // {
          //           throw new ApiError(400,"full name is required")
          // }
          if(
                    [fullName,email,username,password].some((field)=>
                    field?.trim()==="")
          )
          {
                    throw new ApiError(400,"all fields are required")
          }
         const existedUser= await User.findOne({
                    $or: [{username},{email}]
          })
          if(existedUser)
          {
                    throw new ApiError(409,"User with email or username already existed")
          }
          const avatarLocalPath=req.files?.avatar[0]?.path; //multer gives this .files
          // const coverImagePath=req.files?.coverImage[0]?.path;

          let coverImageLocalPath;
          if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0)
          {
                    coverImageLocalPath=req.files.coverImage[0].path
          }
          // console.log(req.files);
          if(!avatarLocalPath)
          {
                    throw new ApiError(400,"avatar file is required")
          }
          const avatar = await  uploadOnCloudinary(avatarLocalPath)
          const coverImage = await uploadOnCloudinary(coverImageLocalPath)
          if(!avatar)
          {
                    throw new ApiError(400,"avatar file is required")
          }
          const user = await User.create({
                    fullName,
                    avatar: avatar.url,
                    coverImage: coverImage?.url || "",
                    email,
                    password,
                    username: username.toLowerCase(),
         })
          const createdUser = await User.findById(user._id).select(
                    "-password -refreshToken"
          )
          if(!createdUser)
          {
                    throw new ApiError(500,"something went wrong while registering the user")
          }
          return res.status(201).json(
                    new ApiResponse(200,createdUser,"user registered successfully")
          )
})

const loginUser=asyncHandler( async(req,res)=>{

          //my todo's for login::

          //get user's email and password. by req.body->data
          //check whether the email is present in the database or not if present then check whether the password which was given was correct or not
          //when user get logged in provide access token and refresh token to the frontend so that they can save in there local machine
          
          //his todo's for login:::

          // req.body -> data;
          // username or email
          //find the user
          // password check
          // access and refresh token
          // send cookies secure cookie

          const {email,username,password} = req.body

          if(!(username || email))
          {
                    throw new ApiError(400,"username and email is required")
          }

          console.log("req.body:", req);

          const user= await User.findOne({
                    $or: [{username},{email}]
          })

          if(!user)
          {
                    throw new ApiError(404,"user does not exist")
          }

          const isPasswordValid=await user.isPasswordCorrect(password)

          if(!isPasswordValid)
          {
                    throw new ApiError(401,"Invalid user credentials")
          }

          const{ accessToken,refreshToken }=await generateAccessAndRefreshTokens(user._id)
          const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

          const options = { 
                    httpOnly: true,
                    secure: true
          }


          return res
          .status(200)
          .cookie("accessToken",accessToken,options)
          .cookie("refreshToken",refreshToken,options)
          .json(
                    new ApiResponse(
                              200,
                              {
                                        user: loggedInUser,accessToken,refreshToken
                              },
                              "user logged in successfully"
                    )
          )
})

const logoutUser= asyncHandler(async(req,res)=>{
     await User.findByIdAndUpdate(
                    req.user._id,
                    {
                              $set: {
                                        refreshToken: undefined
                              }
                    },
                    {
                              new: true
                    }
          )

          const options = {
                    httpOnly: true,
                    secure: true
          }

          return res
          .status(200)
          .clearCookie("accessToken",options)
          .clearCookie("refreshToken",options)
          .json(new ApiResponse(200,{},"user logged out"))

})

const refreshToken=asyncHandler(async(req,res)=>{
     const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken

     if(!incomingRefreshToken)
     {
          throw new ApiError(401,"unauthorized request")
     }

     try {

          const decodedToken=jwt.verify(
               incomingRefreshToken,
               process.env.REFRESH_TOKEN_SECRET
          )

          const user=await User.findById(decodedToken?._id)

          if(!user)
          {
               throw new ApiError(401,"invalid refresh token")
          }

          if(incomingRefreshToken!==user.refreshToken)
          {
               throw new ApiError(401,"Refresh token is expired or used")
          }

          const options={
               httpOnly: true,
               secure: true
          }

          const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
          
          return res
          .status(200)
          .cookie("accessToken",accessToken,options)
          .cookie("refreshToken",newRefreshToken,options)
          .json(
               new ApiResponse(
                    200,
                    {accessToken,refreshToken: newRefreshToken},
                    "Access token refreshed"
               )
          )
     } catch (error) {

          throw new ApiError(401, error?.message|| "Invalid refresh token")
          
     }

     // https://chatgpt.com/share/67a52930-19a4-8005-a19d-eff55b4517e0

})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
     const {oldPassword,newPassword}=req.body

     const user=await User.findById(req.user?._id)
     const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

     if(!isPasswordCorrect)
     {
          throw new ApiError(400,"old password is incorrect")
     }

     user.password=newPassword
     await user.save({ValiditeBeforeSave: false})

     return res
     .status(200)
     .json(new ApiResponse(200,{},"password changed successfully"))

})

const getCurrentUser=asyncHandler(async(req,res)=>{
     return res
     .status(200)
     .json(new ApiResponse(200,req.user,"User fetched successfully"))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
     const {fullName,email}=req.body

     if(!fullName || !email)
     {
          throw new ApiError(400,"all fields are required")
     }

     const user= await User.findByIdAndUpdate(
          req.user?._id,
          {
               $set: {
                    fullName,
                    email: email
               }
          },
          {new: true}

     ).select("-password -refreshToken")


     return res
     .status(200)
     .json(new ApiResponse(200,user,"account details updated successfully"));



})

// you should update the files in separate methods: updateAvatar, updateCoverImage:

const updateUserAvatar=asyncHandler(async(req,res)=>{

     const avatarLocalPath=req.file?.path

     if(!avatarLocalPath)
     {
          throw new ApiError(400,"avatar file is required")
     }

     // TODO: delete old image- assignment 

     const avatar=await uploadOnCloudinary(avatarLocalPath)

     if(!avatar.url)
     {
          throw new ApiError(400,"Error while uploading on avatar")
     }

     const user=await User.findByIdAndUpdate(
          req.user?._id,
          {
               $set: {
                    avatar: avatar.url
               }

          },
          {new: true}
     ).select("-password")

     return res
     .status(200)
     .json(
          new ApiResponse(200,user, "avatar image updated successfully")
     )

})

const updateUserCoverImage=asyncHandler(async(req,res)=>{

     const coverImageLocalPath=req.file?.path

     if(!coverImageLocalPath)
     {
          throw new ApiError(400,"cover image file is required")
     }

     const coverImage=await uploadOnCloudinary(coverImageLocalPath)

     if(!coverImage.url)
     {
          throw new ApiError(400,"Error while uploading on cover IMAGE")
     }

     const user=await User.findByIdAndUpdate(
          req.user?._id,
          {
               $set: {
                    coverImage: coverImage.url
               }

          },
          {new: true}
     ).select("-password")


     return res
     .status(200)
     .json(
          new ApiResponse(200,user, "cover image updated successfully")
     )
})
export {
          registerUser,
          loginUser,
          logoutUser,
          refreshToken,
          changeCurrentPassword,
          getCurrentUser,
          updateAccountDetails,
          updateUserAvatar,
          updateUserCoverImage
}


// During login we generate 2 tokens 1) access-token 2) refresh token
// we save refresh-token in DB and set access-token and refresh-token cookie in chrome
// access-token is for short time and refresh-token is for long time
// when user access-token is expired it send refresh token to Back-end
// Back-end checks if DB refresh-token and user refresh-token is same or not 
// if same it generate both token again and repeat process of saving RT in Db and set cookie with RT and AT
