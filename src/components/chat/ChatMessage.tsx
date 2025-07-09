/* eslint-disable @typescript-eslint/no-explicit-any */
import { timeAgo } from '@/lib/time';
import { useAppSelector } from '@/redux/hooks';
import {
	IconDownload,
	IconEdit,
	IconHeart,
	IconLanguage,
	IconLanguageOff,
	IconTrash,
} from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import Img from '@/components/ui/Img';
import url from '@/lib/url';
import { toast } from 'sonner';
import { useSocket } from '@/provider/SocketProvider';
import { useParams } from 'react-router-dom';

interface ChatMessageProps {
	message: any;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
	const user = useAppSelector((state) => state.auth.user);
	const isCurrentUser = message.sender?._id === user?._id;
	const [showMenu, setShowMenu] = useState(false);
	const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
	const menuRef = useRef<HTMLDivElement>(null);
	const { socket } = useSocket();
	const params = useParams();

	const [translate, setTranslate] = useState(false);
	const [content, setDisplayContent] = useState(message.content);

	useEffect(() => {
		if (!translate) {
			setDisplayContent(message.content + '\u200B');
		} else {
			setDisplayContent(message.content);
		}
	}, [translate, message.content]);

	// Handle click outside to close the menu
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setShowMenu(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// Handle right-click to show context menu at mouse position
	const handleContextMenu = (event: React.MouseEvent) => {
		event.preventDefault();
		setShowMenu(true);

		// Get viewport width and height
		const { clientX, clientY } = event;
		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;

		// Menu dimensions (estimated)
		const menuWidth = 150;
		const menuHeight = 160;

		// Adjust position if near the edges
		let posX = clientX;
		let posY = clientY;

		if (clientX + menuWidth > windowWidth) {
			posX = windowWidth - menuWidth - 10;
		}
		if (clientY + menuHeight > windowHeight) {
			posY = windowHeight - menuHeight - 10;
		}

		setMenuPosition({ x: posX, y: posY });
	};

	const handleDownload = async () => {
		const type = message.type;
		const toastId = toast.loading(`${type} downloading... 0%`);

		try {
			const response = await fetch(url(message.content));
			const reader = response.body?.getReader();
			const contentLength = response.headers.get('Content-Length');

			if (!reader || !contentLength) {
				throw new Error('Unable to download file.');
			}

			const totalLength = parseInt(contentLength, 10);
			let receivedLength = 0;
			const chunks: Uint8Array[] = [];

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				chunks.push(value);
				receivedLength += value.length;
				const progress = Math.floor((receivedLength / totalLength) * 100);
				toast.message(`${type} downloading... ${progress}%`, {
					id: toastId,
				});
			}

			const blob = new Blob(chunks);
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = message.content.split('/').pop();
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			toast.success(`${type} downloaded successfully!`, { id: toastId });
		} catch {
			toast.error(`Error downloading ${type}`, { id: toastId });
		}
	};

	const handleDelete = () => {
		socket!.emit('deleteMessage', {
			messageId: message._id,
			roomId: params.chatId,
		});
	};

	return (
		<div
			key={message.id}
			className={`flex my-2 items-start ${
				isCurrentUser ? 'justify-end' : 'justify-start'
			} relative`}
			onContextMenu={handleContextMenu} // Right-click event
		>
			{!isCurrentUser && (
				<Img
					src={message.sender.avatar}
					alt='avatar'
					className='h-10 w-10 rounded-full mr-2'
				/>
			)}

			<div className='relative max-w-xs'>
				<div className='flex flex-col group'>
					{!isCurrentUser && (
						<div className='flex items-center justify-between gap-2'>
							<span translate='no' className='font-medium'>
								{message.sender.name.firstName} {message.sender.name.lastName}
							</span>
						</div>
					)}
					{message.type === 'text' && (
						<span
							translate={translate ? 'yes' : 'no'}
							className={`${
								isCurrentUser
									? 'bg-gray-200 text-gray-800'
									: 'bg-blue-500 text-white'
							} p-2 rounded-lg mt-2`}
						>
							{content}
						</span>
					)}
					{message.type === 'audio' && (
						<audio className='mt-2' src={url(message.content)} controls />
					)}
					{message.type === 'image' && (
						<img className='mt-2' src={url(message.content)} />
					)}
					{message.type === 'video' && (
						<video className='mt-2' src={url(message.content)} controls />
					)}
					{message.date && (
						<span translate='yes' className='hidden group-hover:inline-block'>
							{timeAgo(message.date)}
						</span>
					)}
				</div>

				{/* Context Menu for Actions */}
				{showMenu && (
					<div
						ref={menuRef}
						translate='yes'
						className='absolute whitespace-nowrap w-fit bg-white dark:bg-gray-700 shadow-lg rounded-lg z-50'
						style={{
							top: `${menuPosition.y}px`,
							left: `${menuPosition.x}px`,
							position: 'fixed', // Fix position to prevent scroll issues
						}}
					>
						{!isCurrentUser ? (
							<button className='flex items-center px-2 gap-2 w-full text-left py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-none active:animate-click bg-white'>
								<IconHeart /> Like
							</button>
						) : (
							<button
								onClick={handleDelete}
								className='flex items-center px-2 gap-2 w-full text-left py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-none active:animate-click bg-white'
							>
								<IconTrash /> Delete
							</button>
						)}
						{message.type !== 'text' ? (
							<button
								onClick={handleDownload}
								className='flex items-center px-2 gap-2 w-full text-left py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 bg-white'
							>
								<IconDownload /> Download
							</button>
						) : (
							<>
								{isCurrentUser && (
									<button className='flex items-center px-2 gap-2 w-full text-left py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-none active:animate-click bg-white'>
										<IconEdit /> Edit
									</button>
								)}
								<button
									onClick={() => setTranslate(!translate)}
									className='flex items-center pl-2 gap-2 w-full text-left py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-none active:animate-click bg-white'
								>
									{!translate ? (
										<>
											<IconLanguage /> <span>Translate</span>
										</>
									) : (
										<>
											<IconLanguageOff /> <span>Original Text</span>
										</>
									)}
								</button>
							</>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default ChatMessage;
