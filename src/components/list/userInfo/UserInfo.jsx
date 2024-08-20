import avatar from '../../../Assets/avatar.png';
import more from '../../../Assets/more.png';
import video from '../../../Assets/video.png';
import edit from '../../../Assets/edit.png';
import './userInfo.css';
import { useUserStore } from "../../../lib/userStore";

const UserInfo = () => {
  const { currentUser } = useUserStore(); 

  return (
    <div className='userInfo'>
      <div className="user">
        <img src={currentUser.avatar || avatar} alt="" /> 
        <h2>{currentUser.username}</h2>
      </div>
      <div className="icons">
        <img src={more} alt="" />
        <img src={video} alt="" />
        <img src={edit} alt="" />
      </div>
    </div>
  );
};

export default UserInfo;
