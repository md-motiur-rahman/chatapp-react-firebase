import React from "react";
import "./userinfo.css";
import { useUserrStore } from "../../lib/userStore";
const UserInfo = () => {
  const {currentUser} = useUserrStore()
  return <div className="userinfo">
    <div className="user">
      <img src={currentUser.avatar || "./avatar.webp"} alt="" />
      <span>{currentUser.username}</span>
    </div>
    <div className="icons">
    <i className="fa-solid fa-ellipsis-vertical"></i>
    <i className="fa-solid fa-video"></i>
    <i className="fa-solid fa-pen-to-square"></i>
    </div>
  </div>;
};

export default UserInfo;
