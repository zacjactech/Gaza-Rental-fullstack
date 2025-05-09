import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for efficient querying
messageSchema.index({ sender: 1, recipient: 1, property: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ read: 1 });

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema); 