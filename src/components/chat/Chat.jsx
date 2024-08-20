import { useEffect, useRef, useState } from 'react';
import "./chat.css";
import avatar from '../../Assets/avatar.png';
import phone from '../../Assets/phone.png';
import video from '../../Assets/video.png';
import info from '../../Assets/info.png';
import emoji from '../../Assets/emoji.png';
import img from '../../Assets/img.png';
import camera from '../../Assets/camera.png';
import mic from '../../Assets/mic.png';
import EmojiPicker from 'emoji-picker-react';
import { db } from '../../lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useUserStore } from "../../lib/userStore";
import { useChatStore } from "../../lib/chatStore";

export default function Chat() {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState(null);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
  const { currentUser } = useUserStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });
    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
    setOpen(false);
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUploadImage = async () => {
    if (image) {
      const storage = getStorage();
      const storageRef = ref(storage, `images/${image.name}`);
      await uploadBytes(storageRef, image);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    }
    return null;
  };

  const handleSend = async () => {
    if (text.trim() === "" && !image) return;

    let imageURL = null;
    if (image) {
      imageURL = await handleUploadImage();
    }

    await updateDoc(doc(db, "chats", chatId), {
      messages: arrayUnion({
        senderId: currentUser.id,
        text,
        img: imageURL,
        createdAt: new Date(),
      }),
    });

    const userIDs = [currentUser.id, user.id];

    for (const id of userIDs) {
      const userChatsRef = doc(db, "userChats", id);
      const userChatsSnapshot = await getDoc(userChatsRef);
      if (userChatsSnapshot.exists()) {
        const userChatsData = userChatsSnapshot.data();
        const chatIndex = userChatsData.chats.findIndex(
          (c) => c.chatId === chatId
        );

        if (chatIndex === -1) {
          userChatsData.chats.push({
            chatId,
            lastMessage: text,
            isSeen: id === currentUser.id ? true : false,
            updatedAt: Date.now(),
          });
        } else {
          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();
        }

        await updateDoc(userChatsRef, {
          chats: userChatsData.chats,
        });
      }
    }

    setText("");
    setImage(null);
  };

  const formatTime = (timestamp) => {
    const date = timestamp.toDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  return (
    <div className='chat'>
      <div className="top">
        <div className="user">
          <img src={user?.avatar || avatar} alt="User Avatar" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>Lorem, ipsum dolor sit amet.</p>
          </div>
        </div>
        <div className="icons">
          <img src={phone} alt="Phone Icon" />
          <img src={video} alt="Video Icon" />
          <img src={info} alt="Info Icon" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => (
          <div className={`message ${message.senderId === currentUser.id ? 'own' : ''}`} key={message.createdAt}>
            <div className="texts">
              {message.img && <img src={message.img} alt='message' />}
              {message.text && <p>{message.text}</p>}
              <span>{formatTime(message.createdAt)}</span>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            id="imageInput"
          />
          <label htmlFor="imageInput">
            <img src={img} alt="Image Icon" />
          </label>
          <img src={camera} alt="Camera Icon" />
          <img src={mic} alt="Mic Icon" />
        </div>
        <input
          type="text"
          placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "You cannot send a message" : 'Type a message...'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img
            src={emoji}
            alt="Emoji Icon"
            onClick={() => setOpen((prev) => !prev)}
          />
          {open && (
            <div className="picker">
              <EmojiPicker onEmojiClick={handleEmoji} />
            </div>
          )}
        </div>
        <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Send</button>
      </div>
    </div>
  );
}
