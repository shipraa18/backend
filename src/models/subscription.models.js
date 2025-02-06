import mongoose, { Schema } from "mongoose";

const subscriptionSchema=new Schema({
          subscriber: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
          },
          channel: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
          },
          status: {
                    type: String,
                    enum: ["subscribed","blocked"],
                    default: "subscribed",
          }

},{timestamps: true})

export const Subscription= mongoose.model("Subscription",subscriptionSchema)