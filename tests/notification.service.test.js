import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../dal/notification.dal.js', () => ({
  createNotification: vi.fn(async (data) => ({ ...data, _id: 'notif-id' })),
}));

import * as notificationDal from '../dal/notification.dal.js';
import { getMeetingTargetUsers, notifyUsers } from '../services/notification.service.js';

const makeMockIo = (onlineUserIds = []) => {
  const rooms = new Map(onlineUserIds.map((id) => [`user:${id}`, new Set()]));
  const mockEmit = vi.fn();
  const mockTo = vi.fn(() => ({ emit: mockEmit }));
  return { io: { sockets: { adapter: { rooms } }, to: mockTo }, mockTo, mockEmit };
};

beforeEach(() => {
  vi.clearAllMocks();
  notificationDal.createNotification.mockImplementation(async (data) => ({ ...data, _id: 'notif-id' }));
});

describe('getMeetingTargetUsers', () => {
  it('restituisce IDs unici di author e participants', () => {
    const meeting = {
      author: { _id: 'user-1' },
      participants: [
        { user: { _id: 'user-2' } },
        { user: { _id: 'user-3' } },
      ],
    };
    expect(getMeetingTargetUsers(meeting)).toEqual(['user-1', 'user-2', 'user-3']);
  });

  it('deduplica se author è anche nella lista participants', () => {
    const meeting = {
      author: { _id: 'user-1' },
      participants: [{ user: { _id: 'user-1' } }, { user: { _id: 'user-2' } }],
    };
    const result = getMeetingTargetUsers(meeting);
    expect(result).toEqual(['user-1', 'user-2']);
    expect(result).toHaveLength(2);
  });

  it('solo author senza participants', () => {
    const meeting = { author: { _id: 'user-1' }, participants: [] };
    expect(getMeetingTargetUsers(meeting)).toEqual(['user-1']);
  });

  it('solo participants senza author', () => {
    const meeting = {
      author: null,
      participants: [{ user: { _id: 'user-2' } }, { user: { _id: 'user-3' } }],
    };
    expect(getMeetingTargetUsers(meeting)).toEqual(['user-2', 'user-3']);
  });
});

describe('notifyUsers', () => {
  it('esclude l\'actor dai target', async () => {
    const { io } = makeMockIo([]);
    await notifyUsers(io, 'MEETING_CREATED', ['user-1', 'user-2'], 'user-1', { text: 'msg' }, 'meeting-1');

    expect(notificationDal.createNotification).toHaveBeenCalledTimes(1);
    expect(notificationDal.createNotification).toHaveBeenCalledWith({
      type: 'MEETING_CREATED',
      user: 'user-2',
      meeting: 'meeting-1',
      message: { text: 'msg' },
    });
  });

  it('nessuna duplicazione negli ID target', async () => {
    const { io } = makeMockIo([]);
    await notifyUsers(io, 'TEST', ['user-2', 'user-2', 'user-3'], 'user-1', {}, 'meeting-1');

    expect(notificationDal.createNotification).toHaveBeenCalledTimes(2);
    const calls = notificationDal.createNotification.mock.calls.map((c) => c[0].user);
    expect(calls).toEqual(['user-2', 'user-3']);
  });

  it('chiama createNotification per ogni target non-actor', async () => {
    const { io } = makeMockIo([]);
    await notifyUsers(io, 'MEETING_UPDATED', ['user-1', 'user-2', 'user-3'], 'user-1', {}, 'meeting-1');

    expect(notificationDal.createNotification).toHaveBeenCalledTimes(2);
  });

  it('emette socket solo per le room esistenti', async () => {
    const { io, mockTo, mockEmit } = makeMockIo(['user-2']); // only user-2 is online
    await notifyUsers(io, 'TEST', ['user-2', 'user-3'], null, {}, 'meeting-1');

    expect(mockTo).toHaveBeenCalledWith('user:user-2');
    expect(mockTo).not.toHaveBeenCalledWith('user:user-3');
    expect(mockEmit).toHaveBeenCalledTimes(1);
  });

  it('non emette socket se nessuna room esiste', async () => {
    const { io, mockEmit } = makeMockIo([]); // no online users
    await notifyUsers(io, 'TEST', ['user-1', 'user-2'], null, {}, 'meeting-1');

    expect(mockEmit).not.toHaveBeenCalled();
  });
});
