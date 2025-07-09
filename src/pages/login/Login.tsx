import { Input } from '@/components/ui/input';
import { MovingBorder } from '@/components/ui/MovingBorder';
import RainbowText from '@/components/ui/RainbowText';
import { useLoginMutation } from '@/redux/features/auth/authApi';
import { setUser } from '@/redux/features/auth/authSlice';
import { useAppDispatch } from '@/redux/hooks';
import { IconLogin2, IconRestore } from '@tabler/icons-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type FormValues = {
	email: string;
	password: string;
};

export default function Login() {
	const dispatch = useAppDispatch();
	const [login] = useLoginMutation();
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormValues>();

	const onSubmit: SubmitHandler<FormValues> = async (data) => {
		const toastId = toast.loading('Loading...');

		try {
			const result = await login({
				email: data.email,
				password: data.password,
			}).unwrap();

			dispatch(setUser(result.data));

			toast.success('Login successfully', { id: toastId });

			navigate('/chat', { replace: true });
		} catch {
			toast.dismiss(toastId);
		}
	};

	return (
		<div className='grid grid-cols-1 mx-auto max-w-5xl container m-10 gap-16 md:grid-cols-2 h-full items-center'>
			<div>
				<h2 className='text-5xl font-semibold mb-10'>
					Welcome to <RainbowText>Heart Vibrate ❤️</RainbowText>
				</h2>
				<h4 className='text-lg font-semibold'>
					Feel the Connection, Anytime, Anywhere
				</h4>
				<p className='my-2'>
					Login to Heart Vibrate and experience real-time, meaningful
					conversations like never before. Stay connected with your loved ones,
					share your emotions, and embrace seamless communication with a touch
					of magic.
				</p>
				<p className='text-sm'>
					✨ Why Heart Vibrate? <br />✅ Instant Messaging – Real-time chats
					with lightning speed <br />
					✅ Secure & Private – Your data stays protected <br />✅ Express
					Freely – Use emojis, voice messages, and more <br />
					✅ Stay Notified – Never miss a heartbeat <br />
					🔐 Log in now and let your heart vibrate with every conversation!
				</p>
			</div>
			<div>
				<form className='my-8' onSubmit={handleSubmit(onSubmit)}>
					<div>
						<label htmlFor='email'>Email</label>
						<Input
							id='email'
							placeholder='enter your email'
							type='email'
							{...register('email', { required: true })}
						/>
						{errors.email && (
							<p className='text-red-500 text-sm mt-1'>Email is required</p>
						)}
					</div>
					<div className='h-3'></div>
					<div>
						<label htmlFor='password'>Password</label>
						<Input
							id='password'
							placeholder='enter your password'
							type='password'
							{...register('password', { required: true })}
						/>
						{errors.password && (
							<p className='text-red-500 text-sm mt-1'>Password is required</p>
						)}
					</div>
					<div className='h-3'></div>
					<div className='flex space-x-4'>
						<MovingBorder>
							<button
								className='flex items-center gap-1 group bg-blue-400 text-white'
								type='submit'
							>
								Login{' '}
								<IconLogin2 className='group-hover:translate-x-1 transition' />
							</button>
						</MovingBorder>
						<MovingBorder color='#9ca3af'>
							<button
								className='flex items-center gap-1 group hover:border-gray-400 bg-white'
								onClick={() => reset()}
							>
								Reset{' '}
								<IconRestore className='group-hover:translate-x-1 transition text-warmGray-700' />
							</button>
						</MovingBorder>
					</div>
				</form>
				Don't have an account?{' '}
				<Link
					to='/signup'
					replace={true}
					className='text-blue-500 hover:underline transition'
				>
					Register
				</Link>
			</div>
		</div>
	);
}
