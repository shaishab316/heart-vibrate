import { Input } from '@/components/ui/input';
import { MovingBorder } from '@/components/ui/MovingBorder';
import RainbowText from '@/components/ui/RainbowText';
import { useRegisterMutation } from '@/redux/features/auth/authApi';
import { setUser } from '@/redux/features/auth/authSlice';
import { useAppDispatch } from '@/redux/hooks';
import { IconLogin2, IconRestore } from '@tabler/icons-react';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type FormValues = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
	gender: string;
	avatar?: File;
};

export default function Signup() {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [signup] = useRegisterMutation();
	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useForm<FormValues>();
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

	const onSubmit: SubmitHandler<FormValues> = async (data) => {
		const toastId = toast.loading('Register user...');
		const formData = new FormData();

		formData.append('email', data.email);
		formData.append('password', data.password);
		formData.append('firstName', data.firstName);
		formData.append('lastName', data.lastName);
		formData.append('gender', data.gender);

		if (data.avatar instanceof FileList) {
			formData.append('images', data.avatar?.[0]);
		}

		try {
			const { data } = await signup(formData);

			dispatch(setUser(data.data));

			toast.success(data.message, { id: toastId });
			navigate('/chat', { replace: true });
		} catch {
			toast.dismiss(toastId);
		}
	};

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setAvatarPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		} else {
			setAvatarPreview(null);
		}
	};

	return (
		<div className='grid grid-cols-1 mx-auto max-w-5xl container m-10 gap-16 md:grid-cols-2 h-full items-center'>
			<div>
				<h2 className='text-5xl font-semibold mb-10'>
					Welcome to <RainbowText>Heart Vibrate ❤️</RainbowText>
				</h2>
				<h4 className='text-lg font-semibold'>
					Join the Connection, Anytime, Anywhere
				</h4>
				<p className='my-2'>
					Create your Heart Vibrate account and step into a world of real-time,
					heartfelt conversations. Stay close to your loved ones, share emotions
					effortlessly, and enjoy a seamless communication experience like never
					before.
				</p>
				<p className='text-sm'>
					✨ Why Join Heart Vibrate? <br />✅ Instant Messaging – Connect in
					real-time with lightning speed <br />
					✅ Safe & Secure – Your privacy is our priority <br />
					✅ Express Yourself – Share voice messages, emojis, and more
					<br />
					✅ Stay Connected – Never miss an important moment <br />
					💖 Sign up now and let your heart vibrate with every conversation!
				</p>
			</div>
			<div>
				<div className='flex justify-center'>
					{avatarPreview && (
						<img
							src={avatarPreview}
							alt='avatar Preview'
							className='mt-2 h-20 w-20 rounded-full object-cover bg-white border rounded-md'
						/>
					)}
				</div>
				<form className='my-8' onSubmit={handleSubmit(onSubmit)}>
					<div className='grid grid-cols-2 gap-2'>
						<div className='mb-2'>
							<label htmlFor='avatar'>Avatar</label>
							<Input
								id='avatar'
								type='file'
								accept='image/*'
								{...register('avatar', { required: true })}
								onChange={handleLogoChange}
								className='p-2 border rounded-md block w-full'
							/>
							{errors.avatar && (
								<p className='text-red-500 text-sm mt-1'>
									User avatar is required
								</p>
							)}
						</div>
						<div>
							<label htmlFor='gender'>Gender</label>
							<MovingBorder>
								<select
									className='p-2 rounded-md border block w-full bg-white'
									id='gender'
									{...register('gender', { required: true })}
								>
									<option value='male'>Male</option>
									<option value='female'>Female</option>
								</select>
							</MovingBorder>
							{errors.gender && (
								<p className='text-red-500 text-sm mt-1'>Gender is required</p>
							)}
						</div>
					</div>
					<div>
						<label htmlFor='firstName'>Name</label>
						<div className='grid grid-cols-2 gap-2 mb-2'>
							<Input
								id='firstName'
								placeholder='enter your first name'
								type='text'
								{...register('firstName', { required: true })}
							/>
							<Input
								id='lastName'
								placeholder='enter your last name'
								type='text'
								{...register('lastName', { required: true })}
							/>
						</div>
						{(errors.firstName || errors.lastName) && (
							<p className='text-red-500 text-sm mt-1'>Name is required</p>
						)}
					</div>
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
					<div className='grid grid-cols-2 gap-2 my-2'>
						<div>
							<label htmlFor='password'>Password</label>
							<Input
								id='password'
								placeholder='enter your password'
								type='password'
								{...register('password', { required: true })}
							/>
							{errors.password && (
								<p className='text-red-500 text-sm mt-1'>
									Password is required
								</p>
							)}
						</div>
						<div>
							<label htmlFor='confirmPassword'>Confirm Password</label>
							<Input
								id='confirmPassword'
								placeholder='enter your password again'
								type='password'
								{...register('confirmPassword', {
									required: 'Confirm password is required',
									validate: (value) =>
										value === watch('password') || 'Passwords do not match',
								})}
							/>
							{errors.confirmPassword && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.confirmPassword.message}
								</p>
							)}
						</div>
					</div>
					<div className='h-3'></div>
					<div className='flex space-x-4'>
						<MovingBorder>
							<button
								className='flex items-center gap-1 group bg-blue-400 text-white'
								type='submit'
							>
								Register{' '}
								<IconLogin2 className='group-hover:translate-x-1 transition' />
							</button>
						</MovingBorder>
						<MovingBorder color='#9ca3af'>
							<button
								className='flex items-center gap-1 group hover:border-gray-400 bg-white'
								onClick={() => reset()}
								type='reset'
							>
								Reset{' '}
								<IconRestore className='group-hover:translate-x-1 transition text-warmGray-700' />
							</button>
						</MovingBorder>
					</div>
				</form>
				Already have an account?{' '}
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
