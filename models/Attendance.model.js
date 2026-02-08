import mongoose from 'mongoose';

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const attendanceSchema = new Schema({
  meeting: { type: ObjectId, ref: 'meetings', required: true },
  user: { type: ObjectId, ref: 'users', required: true },
  occurrenceStart: { type: Date, required: true },
  status: {
    type: String,
    enum: ['yes', 'maybe', 'no'],
    required: true
  }
}, { timestamps: true });

attendanceSchema.index(
  { meeting: 1, user: 1, occurrenceStart: 1 },
  { unique: true }
);

const Attendance = mongoose.model('attendances', attendanceSchema);

export default Attendance;
