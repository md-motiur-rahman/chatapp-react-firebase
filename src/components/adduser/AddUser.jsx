import React, { useState } from "react";

import "./adduser.css";
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useUserrStore } from "../../lib/userStore";

const AddUser = () => {
  const [user, setUser] = useState(null);
  const {currentUser} = useUserrStore()
  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setUser(querySnapshot.docs[0].data());
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleAdd = async (e) => {
    e.preventDefault();

    const chatRef = collection(db, "chats");
    const userChatRef = collection(db, "userchats");

    try {
      const newChatRef = doc(chatRef)
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],

      })
      const newUserChatRef = doc(userChatRef, user.id)      
      await updateDoc(newUserChatRef, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now()
        })
      })
      const curUserChatRef = doc(userChatRef, currentUser.id) 
      await updateDoc(curUserChatRef, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now()
        })
      })
      
    } catch (error) {
      console.error(error);
      
    }
  };
  return (
    <div className="adduser">
      <form onSubmit={handleSearch}>
        <input
          type="email"
          name="email"
          placeholder="Find a friend with email"
        />
        <button>
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.webp"} alt="" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>
            <i className="fa-solid fa-user-plus"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
