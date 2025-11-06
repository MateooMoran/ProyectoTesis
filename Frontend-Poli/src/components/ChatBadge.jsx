import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const ChatBadge = () => {
  const { contadorMensajes } = useSocket();

  return (
    <Link
      to="/dashboard/chat"
      className="relative flex items-center gap-2 text-blue-800 font-semibold hover:text-red-800 transition-colors"
    >
      <MessageCircle className="w-5 h-5" />
      <span>Chat</span>

      {contadorMensajes > 0 && (
        <span className="absolute -top-2 left-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {contadorMensajes > 99 ? '99+' : contadorMensajes}
        </span>
      )}
    </Link>
  );
};

export default ChatBadge;
