/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { MovingBorder } from '../ui/MovingBorder';
import ChatSearchBar from './ChatSearchBar';
import {
	useChatDeleteMutation,
	useChatListQuery,
} from '@/redux/features/chat/chatApi';
import { toast } from 'sonner';
import { useSocket } from '@/provider/SocketProvider';
import Img from '@/components/ui/Img';
import { sortTimeAgo } from '@/lib/time';
import { IconLogout } from '@tabler/icons-react';
import { useAppSelector } from '@/redux/hooks';

export default function ChatSidebar() {
	const userId = useAppSelector((state) => state.auth.user?._id);
	const params = useParams();
	const { data, isLoading, isError, refetch } = useChatListQuery(null);
	const [deleteChat] = useChatDeleteMutation();
	const leaveBtnRef = useRef<HTMLButtonElement>(null);
	const { socket } = useSocket();
	const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

	const chats = data?.data ?? [];

	const [contextMenu, setContextMenu] = useState<{
		x: number;
		y: number;
		chatId: string;
	} | null>(null);

	const handleRightClick = (event: React.MouseEvent, chatId: string) => {
		event.preventDefault();
		setContextMenu({
			x: event.clientX,
			y: event.clientY,
			chatId,
		});
	};

	const handleClickOutside = () => {
		setContextMenu(null);
	};

	const handleDelete = async (chatId: string) => {
		const toastId = toast.loading('Deleting chat...');
		try {
			const { data } = await deleteChat(chatId);
			toast.success(data.message, { id: toastId });
		} finally {
			toast.dismiss(toastId);
			setContextMenu(null);
		}
	};

	useEffect(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Delete' || event.key === 'Backspace') {
				if (contextMenu?.chatId) {
					leaveBtnRef.current?.classList.add('animate-click');
					leaveBtnRef.current?.focus();
					leaveBtnRef.current?.click();

					setTimeout(() => {
						leaveBtnRef.current?.classList.remove('animate-click');
					}, 200);
				}
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [contextMenu]);

	useEffect(() => {
		if (!socket) return;
		socket.connect();

		setTimeout(() => {
			console.log('🔄 Subscribing to inbox...');
			socket.emit('subscribeToInbox');
		}, 1000);

		socket.on('inboxUpdated', refetch);
		socket.on('onlineUsers', (data) => setOnlineUsers(data));

		return () => {
			socket.off('inboxUpdated');
			socket.disconnect();
		};
	}, [socket, refetch]);

	return (
		<div className='rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full border border-neutral-200 dark:border-neutral-700 overflow-hidden h-screen'>
			<div className='w-[300px] border-gray-200 h-full'>
				<div className='flex flex-col flex-1 relative overflow-y-auto h-full overflow-x-hidden'>
					<ChatSearchBar />
					<div className='p-2 flex flex-col gap-2'>
						{isLoading ? (
							<p className='text-center text-gray-500'>Loading chats...</p>
						) : isError ? (
							<p className='text-center text-red-500'>Failed to load chats</p>
						) : chats.length === 0 ? (
							<p className='text-center text-gray-500'>
								No chats found.
								<img src='/empty.png' />
							</p>
						) : (
							chats.map(
								({
									_id = '',
									name = '',
									image = '',
									lastMessage = 'No message',
									lastMessageTime = '',
									updatedAt = '',
									sender = '',
									unRead = false,
									isGroup = false,
									users = [],
									unreadCount = 0,
								}) => {
									const isActive = isGroup
										? users
												.filter((user: any) => user._id !== userId)
												.some((user: any) => onlineUsers.includes(user.email))
										: onlineUsers.includes(sender);

									return (
										<MovingBorder key={_id}>
											<Link
												to={_id}
												onContextMenu={(e) => handleRightClick(e, _id)}
												className={`flex border relative overflow-x-hidden items-center gap-2 p-2 rounded-md ${
													contextMenu?.chatId === _id
														? 'bg-blue-100'
														: !unRead
														? 'bg-gray-100'
														: 'bg-white'
												} dark:bg-neutral-900 transition ${
													params.chatId === _id
														? 'border-l-[6px] border-black cursor-not-allowed'
														: 'cursor-pointer active:animate-click'
												}`}
											>
												<div className='relative'>
													<Img
														src={image}
														alt={`Image of chat: ${name}`}
														className='h-10 w-10 bg-white border rounded-md'
													/>
													<div
														className={`w-3 h-3 ${
															isActive ? 'bg-green-500' : 'bg-gray-500'
														} rounded-full absolute bottom-0 right-0`}
													></div>
												</div>
												<div className='flex flex-col'>
													<p translate='no' className='text-sm font-semibold'>
														{name}
													</p>
													<p translate='no' className='text-sm text-gray-600'>
														{lastMessage || 'No message yet.'}{' '}
													</p>
													<p translate='no' className='text-xs text-gray-400'>
														{sortTimeAgo(lastMessageTime || updatedAt)}
													</p>
												</div>
												{unRead && (
													<div className='absolute top-1/2 -translate-y-1/2 right-2 flex items-center justify-center h-fit px-1 bg-red-500 rounded-full'>
														<p className='text-sm text-white'>{unreadCount}</p>
													</div>
												)}
											</Link>
										</MovingBorder>
									);
								}
							)
						)}
					</div>
				</div>
			</div>

			{/* Context Menu */}
			{contextMenu && (
				<div
					className='absolute bg-white shadow-md rounded-md py-2 w-40 border z-50'
					style={{ top: contextMenu.y, left: contextMenu.x }}
					onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
				>
					<ul className='text-sm text-gray-800'>
						<li>
							<button
								ref={leaveBtnRef}
								className='px-4 rounded-none border-none flex w-full items-center gap-2 group py-2 hover:bg-red-200 text-red-600 cursor-pointer active:animate-click select-none bg-white'
								onClick={() => handleDelete(contextMenu.chatId)}
							>
								<IconLogout className='group-hover:translate-x-1 transition' />{' '}
								Leave Chat
							</button>
						</li>
					</ul>
				</div>
			)}

			<div className='w-full'>
				<Outlet />
			</div>
		</div>
	);
}
