import { useEffect, useState } from 'react';
import './chatList.css';
import search from '../../../Assets/search.png';
import plus from '../../../Assets/plus.png';
import minus from '../../../Assets/minus.png';
import avatar from '../../../Assets/avatar.png';
import AddUser from './addUser/addUser';
import { doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import { useUserStore } from "../../../lib/userStore";
import { useChatStore } from "../../../lib/chatStore";
import { db } from "../../../lib/firebase";

export default function ChatList() {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();

  useEffect(() => {
    if (!currentUser) return;

    const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      if (res.exists()) {
        const items = res.data()?.chats || [];

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.exists() ? userDocSnap.data() : {};

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    });

    return () => {
      unSub();
    };
  }, [currentUser]);

  const handleSelect = async (chat) => {
    const updatedChats = chats.map((item) => {
      if (item.chatId === chat.chatId) {
        return { ...item, isSeen: true };
      }
      return item;
    });

    const userChatsRef = doc(db, "userChats", currentUser.id);
    try {
      await updateDoc(userChatsRef, { chats: updatedChats });
      changeChat(chat.chatId, chat.user);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredChats = chats.filter((c) => 
    c.user?.username?.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className='chatList'>
      <div className="search">
        <div className="searchBar">
          <img src={search} alt="Search Icon" />
          <input 
            type="text" 
            placeholder='Search' 
            value={input}
            onChange={(e) => setInput(e.target.value)} 
          />
        </div>
        <img
          src={addMode ? minus : plus}
          alt={addMode ? 'Minus Icon' : 'Plus Icon'}
          className='add'
          onClick={() => setAddMode(prev => !prev)}
        />
      </div>
      {filteredChats.map((chat, index) => (
        <div 
          className="item" 
          key={`${chat.chatId}-${index}`} 
          onClick={() => handleSelect(chat)}
        >
          <img 
            src={chat.user?.avatar || avatar} 
            alt={chat.user?.username || "User Avatar"} 
          />
          <div className="texts">
            <span>
              {chat.user?.blocked?.includes(currentUser.id) 
                ? "User" 
                : chat.user?.username || "Unknown"}
            </span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}
      {addMode && <AddUser />}
    </div>
  );
}
