import mongoose from 'mongoose';

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const notificationSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['meeting_created', 'meeting_updated', 'meeting_cancelled', 'rsvp_updated']
  },
  user: { type: ObjectId, ref: 'users', required: true },
  ack: { type: Boolean, default: false },
  meeting: { type: ObjectId, ref: 'meetings' },
  message: { type: Schema.Types.Mixed }
}, { timestamps: true });

notificationSchema.index({ user: 1, ack: 1, createdAt: -1 });

const Notification = mongoose.model('notifications', notificationSchema);

export default Notification;
