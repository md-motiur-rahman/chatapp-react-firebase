import React, { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";
const Login = () => {
  const [loginState, setLoginState] = useState(true);

  const [loading, setLoading] = useState(false)

  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleLogin = async(e) => {
    e.preventDefault();

    const formData = new FormData(e.target)
    const {email, password} = Object.fromEntries(formData)
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success("You are signed in")
    } catch (error) {
      console.error(error);
      toast.error(error.message)
      
    }
    finally{
      setLoading(false)
    }
  };

  const handlereg = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);
    setLoading(true)

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const imgUrl = await upload(avatar.file);
      await setDoc(doc(db, "users", res.user.uid), {
        id: res.user.uid,
        username,
        email,
        avatar: imgUrl,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });
      toast.success("Account created");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
    finally{
      setLoading(false)
    }
  };

  return (
    <div className="login">
      {loginState ? (
        <div className="item">
          <h2>Welcome Back</h2>
          <form onSubmit={handleLogin}>
            <input type="email" name="email" placeholder="Enter your email" />
            <input type="password" name="password" placeholder="password" />
            <button type="submit" disabled={loading}>{loading ? "Loading" : "Sign In"}</button>
          </form>
          <p>
            Do not have an account?{" "}
            <span onClick={() => setLoginState((prev) => !prev)}>
              Click here
            </span>
          </p>
        </div>
      ) : (
        <div className="item">
          <h2>Register for Account</h2>
          <form onSubmit={handlereg}>
            <label htmlFor="propic">
              <img src={avatar.url || "./avatar.webp"} alt="" />
            </label>
            <input
              type="file"
              name="propic"
              id="propic"
              style={{ display: "none" }}
              onChange={handleAvatar}
            />
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
            />
            <input type="email" name="email" placeholder="Enter your email" />
            <input
              type="password"
              name="password"
              placeholder="Enter a strong password"
            />
            <button type="submit" disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
          </form>
          <p>
            Already have an account?{" "}
            <span onClick={() => setLoginState((prev) => !prev)}>
              Click here
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;
