import React, { useEffect, useState } from "react";
import "./detail.css";
import { auth, db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserrStore } from "../../lib/userStore";
import { arrayRemove, arrayUnion, doc, onSnapshot, updateDoc } from "firebase/firestore";
const Detail = () => {
  const [chat, setChat] = useState();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } =
    useChatStore();
  const { currentUser } = useUserrStore();
  const handleBlock = async () => {
    if (!user) return;
    const userDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (error) {}
  };
  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);
  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar || "./avatar.webp"} alt="" />
        <br />
        <h2>{user?.username || "Mychat User"}</h2>
        <p>{user ? "Hi, I am available to chat" : "huhu"}</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <i className="fa-solid fa-chevron-down"></i>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privecy & Help</span>
            <i className="fa-solid fa-chevron-down"></i>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <i className="fa-solid fa-chevron-up"></i>
          </div>
          <div className="photos">
            {chat?.messages?.map((message) => (
              <div className="photodetail" key={message.createdAt}>
                <div className="photoitem">
                  <img src={chat?.message?.img} alt="" />
                  <span>nature_2024.jpg</span>
                </div>
                <i className="fa-solid fa-download"></i>
              </div>
            ))}
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <i className="fa-solid fa-chevron-down"></i>
          </div>
        </div>
        <button onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You are Blocked Bro"
            : isReceiverBlocked
            ? "User is Blocked"
            : "Block the User"}
        </button>
        <button className="logout" onClick={() => auth.signOut()}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Detail;
