const asyncHandler = (requestHandler)=>{
          return (req,res,next)=>{
                    Promise.resolve(requestHandler(req,res,next))
                    .catch((err)=>next(err))
          }
//          return( Promise
//           .resolve(requestHandler(req,res,next))
//           .catch((error)=>{
//                    next(error)
//           }))
}
export {asyncHandler}

// const asyncHandler = () => {}
// const asyncHandler = (func) => {() => {}}
// const asyncHandler = (func) => async () => {}

// 
