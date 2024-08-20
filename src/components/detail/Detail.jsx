import { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import "./detail.css";
import avatar from '../../Assets/avatar.png';
import arrowUp from '../../Assets/arrowUp.png';
import arrowDown from '../../Assets/arrowDown.png';
import download from '../../Assets/download.png';
import { auth, db } from "../../lib/firebase";
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import { updateDoc, doc, arrayRemove, arrayUnion } from 'firebase/firestore';

export default function Detail() {
  const [showChat, setShowChat] = useState(true); 
  const navigate = useNavigate();
  const { user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id)
      });
      changeBlock();
      setShowChat(false); 
    } catch (error) {
      console.log(error);
    }
  };

  const handleShowChat = () => {
    setShowChat(true); 
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login'); 
    } catch (error) {
      console.log("Logout failed", error);
    }
  };

  return (
    <div className='detail'>
      {showChat && (
        <>
          <div className="user">
            <img src={user?.avatar || avatar} alt="User Avatar" />
            <h2>{user?.username}</h2>
            <p>Lorem ipsum dolor sit</p>
          </div>
          <div className="info">
            <div className="option">
              <div className="title">
                <span>Chat Settings</span>
                <img src={arrowUp} alt="Arrow Up" />
              </div>
            </div>
            <div className="option">
              <div className="title">
                <span>Privacy & Help</span>
                <img src={arrowUp} alt="Arrow Up" />
              </div>
            </div>
            <div className="option">
              <div className="title">
                <span>Shared Photos</span>
                <img src={arrowDown} alt="Arrow Down" />
              </div>
              <div className="photos">
                <div className="photoItem">
                  <div className="photoDetail">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8mEIWZjRFdiO4YIkq790lTaNzTtCH6DcwrQ&usqp=CAU" alt="Shared Photo" />
                    <span>photo_2024_07</span>
                  </div>
                  <img className='icon' src={download} alt="Download Icon" />
                </div>
                <div className="photoItem">
                  <div className="photoDetail">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8mEIWZjRFdiO4YIkq790lTaNzTtCH6DcwrQ&usqp=CAU" alt="Shared Photo" />
                    <span>photo_2024_07</span>
                  </div>
                  <img className='icon' src={download} alt="Download Icon" />
                </div>
                <div className="photoItem">
                  <div className="photoDetail">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8mEIWZjRFdiO4YIkq790lTaNzTtCH6DcwrQ&usqp=CAU" alt="Shared Photo" />
                    <span>photo_2024_07</span>
                  </div>
                  <img className='icon' src={download} alt="Download Icon" />
                </div>
              </div>
            </div>
            <div className="option">
              <div className="title">
                <span>Shared Files</span>
                <img src={arrowUp} alt="Arrow Up" />
              </div>
            </div>
          </div>
        </>
      )}
      {!showChat && isReceiverBlocked && (
        <button className='showChat' onClick={handleShowChat}>
          Show Chat
        </button>
      )}
      <button className='block' onClick={handleBlock}>
        {isCurrentUserBlocked ? "You are Blocked!" : isReceiverBlocked ? "User Blocked" : "Block user"}
      </button>
      <button className='logOut' onClick={handleLogout}>Log Out</button>
    </div>
  );
}
