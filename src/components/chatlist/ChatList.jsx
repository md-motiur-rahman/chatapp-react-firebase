import React, { useEffect, useState } from "react";
import "./chatlist.css";
import AddUser from "../adduser/AddUser";
import { useUserrStore } from "../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
const ChatList = () => {
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);
  const { currentUser } = useUserrStore();
  const { changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        // setChats(doc.data());
        const items = res.data().chats;
        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);

        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    console.log(chats);

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  console.log(chats);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;

      return rest;
    });

    const chatIndex = userChats.findIndex((item) => item.id === chat.id);
    userChats[chatIndex].isSeen = true;

    const userChatRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="chatlist">
      <div className="search">
        <div className="searchbar">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            name="search"
            placeholder="Search for your friend..."
          />
        </div>
        {addMode ? (
          <i
            className="fa-solid fa-minus"
            onClick={() => setAddMode((prev) => !prev)}
          ></i>
        ) : (
          <i
            className="fa-solid fa-plus"
            onClick={() => setAddMode((prev) => !prev)}
          ></i>
        )}
      </div>
      <h3>Your Friends</h3>
      <div className="friends">
        {chats.map((chat) => (
          <div
            className="friend"
            key={chat.chatId}
            onClick={() => handleSelect(chat)}
            style={{
              backgroundColor: chat.isSeen ? "transparent" : "antiquewhite",
            }}
          >
            <img src={chat.user.blocked.includes(currentUser.id) ? "./avatar.webp" : chat.user.avatar} alt="" />
            <div className="content">
              <p>{chat.user.blocked.includes(currentUser.id) ? "ChatBox user" : chat.user.username}</p>
              <span>
                {chat.lastMessage || "Start writing to your new friend"}
              </span>
            </div>
          </div>
        ))}
      </div>
      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;

{
  /* */
}
