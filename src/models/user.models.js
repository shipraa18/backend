import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema({
          username: {
                    type: String,
                    required: true,
                    unique: true,
                    lowercase: true,
                    trim: true,
                    index: true // for searching purpose
          },

          email: {
                    type: String,
                    required: true,
                    unique: true,
                    lowercase: true,
                    trim: true,
          },

          fullName: {
                    type: String,
                    required: true,
                    trim: true,
                    index: true,
          },

          avatar: {
                    type: String, //cloudinary url
                    required: true,
          },

          coverImage: {
                    type: String,
          },

          watchHistory: [
                    {
                              type: mongoose.Schema.Types.ObjectId,
                              ref: "Video"
                    }
          ],
          password: {
                    type: String,
                    required: [true, 'password is required']

          },

          refreshToken: {
                    type: String,
          }

          
},{timestamps: true})


//Pre-Save Middleware(Hashing the password)
//this middleware is executed before saving a user document to the database
// this middleware ensures that passwords are always stored securely in hashed form.
userSchema.pre("save",async function (next) {

          if(!this.isModified("password"))
          {
                    return next();
          }

          this.password=await bcrypt.hash(this.password,10)
          next()   
})

// this methods is the part of node.js/MongoDB, this method is crucial for the login process,
// where the user's input password needs to be checked against the stored hashed password

userSchema.methods.isPasswordCorrect = async function(password){
          return await bcrypt.compare(password,this.password)
}



userSchema.methods.generateAccessToken=function(){
          return jwt.sign(
                    {
                              _id: this._id,
                              email: this.email,
                              username: this.username,
                              fullname: this.fullname,
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    {
                              expiresIn: process.env.ACCESS_TOKEN_EXPIRY
                    }
          )
}
userSchema.methods.generateRefreshToken=function(){
          return jwt.sign(
                    {
                              _id: this._id,
                    },
                    process.env.REFRESH_TOKEN_SECRET,
                    {
                              expiresIn: process.env.REFRESH_TOKEN_EXPIRY
                    }
          )
}

//isPasswordCorrect: This is an instance method defined on the userSchema
//The pre-save middleware ensures that any time a user's password is changed, it is hashed before being stored in the database.
//The instance method provides a way to verify that a provided password matches the stored hashed password, which is essential for authentication.







export const User = mongoose.model("User",userSchema)

//for exporting the model we use the following line of code:
//export const User=model("User",userSchema);
// here, {model} is coming from "mongoose"
// and User, will be saved in database as 'users', because by default mongodb makes the name plural(all in lowercase)