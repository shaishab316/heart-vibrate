import { baseApi } from '../../api/baseApi';

const authApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		login: builder.mutation({
			query: (userInfo: { email: string; password: string }) => ({
				url: '/auth/login',
				method: 'POST',
				body: userInfo,
			}),
		}),
		register: builder.mutation({
			query: (formData: FormData) => ({
				url: '/auth/register',
				method: 'POST',
				body: formData,
			}),
		}),
		forgetPassword: builder.mutation({
			query: (userInfo: { email: string }) => ({
				url: '/auth/forget-password',
				method: 'POST',
				body: userInfo,
			}),
		}),
		verifyOtp: builder.mutation({
			query: (userInfo: { email: string; otp: string }) => ({
				url: '/auth/verify-otp',
				method: 'POST',
				body: userInfo,
			}),
		}),
		resetPassword: builder.mutation({
			query: (userInfo: { token: string; newPassword: string }) => ({
				url: '/auth/reset-password',
				method: 'POST',
				body: userInfo,
			}),
		}),
	}),
});

export const {
	useLoginMutation,
	useRegisterMutation,
	useForgetPasswordMutation,
	useVerifyOtpMutation,
	useResetPasswordMutation,
} = authApi;
