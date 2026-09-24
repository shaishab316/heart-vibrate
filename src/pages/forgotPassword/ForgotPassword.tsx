import { Input } from '@/components/ui/input';
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from '@/components/ui/input-otp';
import { MovingBorder } from '@/components/ui/MovingBorder';
import RainbowText from '@/components/ui/RainbowText';
import {
	useForgetPasswordMutation,
	useResetPasswordMutation,
	useVerifyOtpMutation,
} from '@/redux/features/auth/authApi';
import {
	IconArrowLeft,
	IconKey,
	IconLock,
	IconRestore,
	IconSend,
} from '@tabler/icons-react';
import { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type FormValues = {
	email: string;
	otp: string;
	newPassword: string;
	confirmPassword: string;
};

type Step = 'email' | 'otp' | 'reset';

export default function ForgotPassword() {
	const navigate = useNavigate();

	const [forgetPassword] = useForgetPasswordMutation();
	const [verifyOtp] = useVerifyOtpMutation();
	const [resetPassword] = useResetPasswordMutation();

	const [step, setStep] = useState<Step>('email');
	const [email, setEmail] = useState('');
	const [resetToken, setResetToken] = useState('');

	const {
		register,
		handleSubmit,
		control,
		reset,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		defaultValues: { email: '', otp: '', newPassword: '', confirmPassword: '' },
	});

	const sendOtp = async (targetEmail: string) => {
		const toastId = toast.loading('Sending OTP...');

		try {
			const result = await forgetPassword({ email: targetEmail }).unwrap();

			setEmail(targetEmail);
			toast.success(result.message, { id: toastId });
			setStep('otp');
		} catch {
			toast.dismiss(toastId);
		}
	};

	const onSubmit: SubmitHandler<FormValues> = async (data) => {
		if (step === 'email') {
			await sendOtp(data.email);
			return;
		}

		if (step === 'otp') {
			const toastId = toast.loading('Verifying OTP...');

			try {
				const result = await verifyOtp({ email, otp: data.otp }).unwrap();

				setResetToken(result.data.resetToken);
				toast.success('OTP verified successfully', { id: toastId });
				setStep('reset');
			} catch {
				toast.dismiss(toastId);
			}
			return;
		}

		const toastId = toast.loading('Resetting password...');

		try {
			const result = await resetPassword({
				token: resetToken,
				newPassword: data.newPassword,
			}).unwrap();

			toast.success(result.message, { id: toastId });
			reset();
			navigate('/login', { replace: true });
		} catch {
			toast.dismiss(toastId);
		}
	};

	const handleBack = () => {
		if (step === 'otp') {
			reset();
			setStep('email');
		} else if (step === 'reset') {
			reset();
			setStep('otp');
		}
	};

	return (
		<div className='grid grid-cols-1 mx-auto max-w-5xl container m-10 gap-16 md:grid-cols-2 h-full items-center'>
			<div>
				<h2 className='text-5xl font-semibold mb-10'>
					Reset your <RainbowText>Heart Vibrate ❤️</RainbowText> password
				</h2>
				<h4 className='text-lg font-semibold'>
					{step === 'email' && 'Forgot your password? No worries'}
					{step === 'otp' && 'We sent a 6 digit OTP to your email'}
					{step === 'reset' && 'Almost there — set a new password'}
				</h4>
				<p className='my-2'>
					{step === 'email' &&
						'Enter the email linked to your account and we will send you a one-time password (OTP) to verify it is really you.'}
					{step === 'otp' &&
						`Enter the code we sent to ${email}. The OTP is valid for 10 minutes.`}
					{step === 'reset' &&
						'Your OTP has been verified. Choose a strong new password to secure your account.'}
				</p>
				<p className='text-sm'>
					🔐 Your data stays protected <br />
					✅ OTP verified resets – no one else can change your password <br />
					⏱️ The OTP expires after 10 minutes <br />
					💖 Get back to your conversations in no time!
				</p>
			</div>
			<div>
				<form className='my-8' onSubmit={handleSubmit(onSubmit)}>
					{step === 'email' && (
						<div>
							<label htmlFor='email'>Email</label>
							<Input
								id='email'
								placeholder='enter your email'
								type='email'
								{...register('email', {
									required: 'Email is required',
									pattern: {
										value: /^\S+@\S+\.\S+$/,
										message: 'Enter a valid email address',
									},
								})}
							/>
							{errors.email && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.email.message}
								</p>
							)}
						</div>
					)}

					{step === 'otp' && (
						<div>
							<label htmlFor='otp'>One Time Password</label>
							<Controller
								control={control}
								name='otp'
								rules={{
									required: 'OTP is required',
									minLength: { value: 6, message: 'Enter the 6 digit OTP' },
								}}
								render={({ field }) => (
									<InputOTP
										maxLength={6}
										value={field.value}
										onChange={field.onChange}
									>
										<InputOTPGroup>
											<InputOTPSlot index={0} />
											<InputOTPSlot index={1} />
											<InputOTPSlot index={2} />
											<InputOTPSlot index={3} />
											<InputOTPSlot index={4} />
											<InputOTPSlot index={5} />
										</InputOTPGroup>
									</InputOTP>
								)}
							/>
							{errors.otp && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.otp.message}
								</p>
							)}
							<button
								type='button'
								className='text-blue-500 hover:underline transition text-sm mt-2'
								onClick={() => sendOtp(email)}
							>
								Didn&apos;t get the code? Resend OTP
							</button>
						</div>
					)}

					{step === 'reset' && (
						<>
							<div>
								<label htmlFor='newPassword'>New Password</label>
								<Input
									id='newPassword'
									placeholder='enter your new password'
									type='password'
									{...register('newPassword', {
										required: 'New password is required',
										minLength: {
											value: 6,
											message: 'Password must be at least 6 characters',
										},
									})}
								/>
								{errors.newPassword && (
									<p className='text-red-500 text-sm mt-1'>
										{errors.newPassword.message}
									</p>
								)}
							</div>
							<div className='h-3'></div>
							<div>
								<label htmlFor='confirmPassword'>Confirm Password</label>
								<Input
									id='confirmPassword'
									placeholder='enter your new password again'
									type='password'
									{...register('confirmPassword', {
										required: 'Confirm password is required',
										validate: (value) =>
											value === watch('newPassword') ||
											'Passwords do not match',
									})}
								/>
								{errors.confirmPassword && (
									<p className='text-red-500 text-sm mt-1'>
										{errors.confirmPassword.message}
									</p>
								)}
							</div>
						</>
					)}

					<div className='h-3'></div>
					<div className='flex space-x-4'>
						<MovingBorder>
							<button
								className='flex items-center gap-1 group bg-blue-400 text-white'
								type='submit'
							>
								{step === 'email' && (
									<>
										Send OTP{' '}
										<IconSend className='group-hover:translate-x-1 transition' />
									</>
								)}
								{step === 'otp' && (
									<>
										Verify OTP{' '}
										<IconKey className='group-hover:translate-x-1 transition' />
									</>
								)}
								{step === 'reset' && (
									<>
										Reset Password{' '}
										<IconLock className='group-hover:translate-x-1 transition' />
									</>
								)}
							</button>
						</MovingBorder>
						{step !== 'email' ? (
							<MovingBorder color='#9ca3af'>
								<button
									type='button'
									className='flex items-center gap-1 group hover:border-gray-400 bg-white'
									onClick={handleBack}
								>
									<IconArrowLeft className='group-hover:-translate-x-1 transition text-warmGray-700' />
									Back
								</button>
							</MovingBorder>
						) : (
							<MovingBorder color='#9ca3af'>
								<button
									type='reset'
									className='flex items-center gap-1 group hover:border-gray-400 bg-white'
									onClick={() => reset()}
								>
									Reset{' '}
									<IconRestore className='group-hover:translate-x-1 transition text-warmGray-700' />
								</button>
							</MovingBorder>
						)}
					</div>
				</form>
				Remember your password?{' '}
				<Link
					to='/login'
					replace={true}
					className='text-blue-500 hover:underline transition'
				>
					Login
				</Link>
			</div>
		</div>
	);
}
