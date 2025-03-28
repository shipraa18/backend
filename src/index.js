// require(dotenv).config({path: './env'})
// entry points
// server starts here
// loads environment variables using dotenv
// calls connectDB() to estabilish MongoDB connection
// once connected, starts express server(listening on port)


import dotenv from "dotenv"
import connectDB from "./db/index.js";
import express from "express"
import {app} from './app.js'

dotenv.config({
          path: './env'
})


connectDB()
.then(()=>{
          app.listen(process.env.PORT || 8000, ()=>{
                    console.log(`Server is running at port : ${process.env.PORT} `)
          });
          app.on("error",(error) =>{
                    console.log("ERROR",error);
                    throw error
          })
})
.catch((error)=>{
          console.log("Error: ",error);
})



//first appraoch to connect with database:

// function connectDB(){

// }

// connectDB();

/* const app = express();

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error",(error)=>{
          console.log("ERROR",error);
          throw error
    })
    app.listen(process.env.PORT,()=>{
          console.log(`App is listening on port ${process.env.PORT}`);
    })
  } catch (error) {
    console.error("ERROR: ", error);
    throw error;
  }
})();
*/
