import {asyncHandler} from "../utils/asyncHandler.js"


const registerUser = asyncHandler(async(req,res)=>{
         console.log("registerUser endpoint hit"); // Basic log to see if the function is called
         console.log("Request body:", req.body);
         return  res.status(200).json({
                    message: "shipra maurya"
          })
})


export {
          registerUser
}
