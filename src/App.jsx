import { useEffect } from "react";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/Login";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserrStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";

function App() {
  const{chatId} = useChatStore()
  const { currentUser, isLoading, fetchUserInfo } = useUserrStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
     fetchUserInfo(user?.uid)
    });
    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading) return <div className="loading">Loading...</div>;
  return (
    <div className="container">
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat />}
          {chatId && <Detail />}
        </>
      ) : (
        <Login />
      )}
      <ToastContainer />
    </div>
  );
}

export default App;
