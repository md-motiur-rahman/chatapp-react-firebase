import React, { useEffect, useRef, useState } from "react";
import "./chat.css";

import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserrStore } from "../../lib/userStore";
import upload from "../../lib/upload";

const Chat = () => {
  const [showEmoji, setShowEmoji] = useState(false);
  const [chat, setChat] = useState();
  const [messageInput, setMessageInput] = useState("");
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser } = useUserrStore();

  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const handleImage = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleEmoji = (e) => {
    setMessageInput((prev) => prev + e.emoji);
  };

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleSend = async () => {
    let imgURL = null;
    if (messageInput === "") return;

    try {
      if (img.file) {
        imgURL = await upload(img.file);
      }
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          messageInput,
          createdAt: new Date(),
          ...(imgURL && { img: imgURL }),
        }),
      });
      const userIds = [currentUser.id, user.id];

      userIds.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnap = await getDoc(userChatsRef);

        if (userChatsSnap.exists()) {
          const userChatsData = userChatsSnap.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = messageInput;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
      setMessageInput("");
      setImg({
        file: null,
        url: "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.webp"} alt="" />
          <div className="texts">
            <p>{user?.username}</p>
            <span>Hi, I am available to chat</span>
          </div>
        </div>
        <div className="icons">
          <i className="fa-solid fa-phone"></i>
          <i className="fa-solid fa-video"></i>
          <i className="fa-solid fa-circle-info"></i>
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => (
          <div
            className={
              message.senderId === currentUser.id ? "message own" : "message"
            }
            key={message.createdAt}
          >
            <div className="text">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.messageInput}</p>
              <span>1 min ago</span>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="imgFile">
            {img.url ? (
              <img src={img.url} className="imgRev" />
            ) : (
              <i className="fa-solid fa-image"></i>
            )}
          </label>
          <input
            type="file"
            id="imgFile"
            style={{ display: "none" }}
            onChange={handleImage}
          />
          <i className="fa-solid fa-camera"></i>
          <i className="fa-solid fa-microphone"></i>
        </div>
        <input
          type="text"
          name="message"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You can't reply to this message"
              : "Write your message..."
          }
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <i
            className="fa-solid fa-face-smile-wink"
            onClick={() => setShowEmoji((prev) => !prev)}
          ></i>
          <div className="picker">
            <EmojiPicker open={showEmoji} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className="sendmessage"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

export default Chat;
