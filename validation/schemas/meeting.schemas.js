import { z } from 'zod';
import { objectIdSchema, isoDateSchema, objectIdParams } from './common.schemas.js';

const rsvpEnum = z.enum(['yes', 'maybe', 'no']);

const locationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.array(z.number()).length(2)
}).optional();

const participantSchema = z.object({
  user: objectIdSchema,
  defaultStatus: rsvpEnum.optional()
});

const baseMeetingFields = {
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  startDateTime: isoDateSchema,
  endDateTime: isoDateSchema,
  recurrenceRule: z.string().nullable().optional(),
  locationType: z.enum(['in_person', 'online']).optional(),
  location: locationSchema,
  onlineUrl: z.string().url().optional(),
  participants: z.array(participantSchema).optional()
};

export const createMeeting = z.object({
  body: z.object(baseMeetingFields).refine(
    (data) => new Date(data.endDateTime) > new Date(data.startDateTime),
    { message: 'endDateTime must be after startDateTime', path: ['endDateTime'] }
  )
});

export const updateMeeting = objectIdParams.merge(
  z.object({
    body: z.object(baseMeetingFields).partial()
  })
);

export const getMeetingsByDateRange = z.object({
  query: z.object({
    start: isoDateSchema,
    end: isoDateSchema
  })
});

export const getMeetingById = objectIdParams;

export const deleteMeeting = objectIdParams;

export const rsvpSingle = objectIdParams.merge(
  z.object({
    body: z.object({
      occurrenceStart: isoDateSchema,
      status: rsvpEnum
    })
  })
);

export const rsvpAll = objectIdParams.merge(
  z.object({
    body: z.object({
      status: rsvpEnum
    })
  })
);

export const addParticipant = objectIdParams.merge(
  z.object({
    body: z.object({
      userId: objectIdSchema,
      defaultStatus: rsvpEnum.optional()
    })
  })
);

export const removeParticipant = objectIdParams.merge(
  z.object({
    body: z.object({
      userId: objectIdSchema
    })
  })
);
