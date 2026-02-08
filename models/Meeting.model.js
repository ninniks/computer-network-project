import mongoose from 'mongoose';

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const participantSchema = new Schema({
  user: { type: ObjectId, ref: 'users', required: true },
  defaultStatus: {
    type: String,
    enum: ['yes', 'maybe', 'no'],
    default: 'maybe'
  }
}, { _id: false });

const meetingSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  author: { type: ObjectId, ref: 'users', required: true },

  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },

  // Recurrence — icalendar string (RRULE + EXDATE + TZID)
  // null = single event
  recurrenceRule: { type: String, default: null },

  // Location — valid GeoJSON
  locationType: {
    type: String,
    enum: ['in_person', 'online'],
    default: 'in_person'
  },
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: {
      type: [Number],
      validate: {
        validator: (v) =>
          Array.isArray(v) &&
          v.length === 2 &&
          v.every(Number.isFinite),
        message: 'coordinates must be [lon, lat]'
      }
    }
  },
  onlineUrl: String,

  // Participants (embedded, scales < 50)
  participants: [participantSchema]
}, { timestamps: true });

meetingSchema.index({ location: '2dsphere' });
meetingSchema.index({ 'participants.user': 1 });
meetingSchema.index({ author: 1 });
meetingSchema.index({ startDateTime: 1, endDateTime: 1 });

const Meeting = mongoose.model('meetings', meetingSchema);

export default Meeting;
