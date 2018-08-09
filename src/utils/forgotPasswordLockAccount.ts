import { ObjectID } from 'mongodb';
import { Redis } from 'ioredis';
import { removeAllUserSessions } from './removeAllUserSessions';
import { User } from '../entity/User';

export const forgotPasswordLockAccount = async (userId: ObjectID, redis: Redis) => {
	// lock the user account until the password is changed
	await User.update({ id: userId }, { isLocked: true });
	// remove all the sessions
	await removeAllUserSessions(userId, redis);
};
