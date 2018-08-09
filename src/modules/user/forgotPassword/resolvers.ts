import * as yup from 'yup';
import * as bcrypt from 'bcryptjs';
import { ResolverMap } from '../../../types/graphql-utils';
import { User } from '../../../entity/User';
import { forgotPasswordLockAccount } from '../../../utils/forgotPasswordLockAccount';
import { createForgotPasswordLink } from '../../../utils/createForgotPasswordLink';
import { userNotFoundError, expiredKeyError } from './errorMessages';
import { forgotPasswordPrefix } from '../../../constants';
import { registerPasswordValidation } from '../../../yupSchemas';
import { formatYupError } from '../../../utils/formatYupError';

const schema = yup.object().shape({
	newPassword: registerPasswordValidation,
});

export const resolvers: ResolverMap = {
	Mutation: {
		sendForgotPasswordEmail: async (_, { email }: GQL.ISendForgotPasswordEmailOnMutationArguments, { redis }) => {
			const user = await User.findOne({ where: { email } });
			if (!user) {
				return [
					{
						path: 'email',
						message: userNotFoundError,
					},
				];
			}
			await forgotPasswordLockAccount(user.id, redis);
			await createForgotPasswordLink('', user.id, redis);
			return true;
		},
		forgotPasswordChange: async (
			_,
			{ newPassword, key }: GQL.IForgotPasswordChangeOnMutationArguments,
			{ redis }
		) => {
			const redisKey = `${forgotPasswordPrefix}${key}`;
			const userId = await redis.get(redisKey);
			if (!userId) {
				return [
					{
						path: 'key',
						message: expiredKeyError,
					},
				];
			}

			try {
				await schema.validate({ newPassword }, { abortEarly: false });
			} catch (error) {
				return formatYupError(error);
			}

			const hashedPassword = await bcrypt.hash(newPassword, 10);

			const updatePromise = await User.update(userId, { isLocked: false, password: hashedPassword });
			const delKeyPromise = redis.del(redisKey);

			Promise.all([updatePromise, delKeyPromise]);

			return null;
		},
	},
};
