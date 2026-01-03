import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employee',
    required: true
  },   // le plus petit ObjectId
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employee',
    required: true
  },   // le plus grand ObjectId
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employee',
    required: true
  }, // qui a envoyé la demande
}, { timestamps: true });

// Index unique pour éviter les doublons (user1, user2)
connectionSchema.index({ user1: 1, user2: 1 }, { unique: true });

export default mongoose.model("Connection", connectionSchema);
