import { Redis } from 'ioredis';
import { ObjectID } from 'mongodb';
import { userSessionIdPrefix, redisSessionPrefix } from '../constants';

export const removeAllUserSessions = async (userId: ObjectID, redis: Redis) => {
	const sessionIds = await redis.lrange(`${userSessionIdPrefix}${userId}`, 0, -1);

	const promises = [];
	// tslint:disable-next-line:prefer-for-of
	for (let i = 0; i < sessionIds.length; i += 1) {
		promises.push(redis.del(`${redisSessionPrefix}${sessionIds[i]}`));
	}

	await Promise.all(promises);
};
