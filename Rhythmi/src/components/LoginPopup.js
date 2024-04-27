/**
 * LoginPopup Component:
 * - Handles user login through a form interface where users can enter their email and password.
 * - Integrates with the AuthContext to manage user authentication state.
 * - Provides an option to switch to a SignupPopup for new users.
 * - Uses IntersectionObserver for scroll-based animations on UI elements.
 * - Closes the popup and logs the user in on successful authentication.
 */


import { useState, useCallback, useEffect } from "react";
import SignupPopup from "./SignupPopup";
import styles from "./LoginPopup.module.css";
import axios from 'axios';
import { useAuth } from "../AuthContext"; // Import the useAuth hook

const LoginPopup = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isSignupPopupOpen, setSignupPopupOpen] = useState(false);
  const { login } = useAuth();
  
  useEffect(() => {
    const scrollAnimElements = document.querySelectorAll(
      "[data-animate-on-scroll]"
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            const targetElement = entry.target;
            targetElement.classList.add(styles.animate);
            observer.unobserve(targetElement);
          }
        }
      },
      {
        threshold: 0.15,
      }
    );

    for (let i = 0; i < scrollAnimElements.length; i++) {
      observer.observe(scrollAnimElements[i]);
    }

    return () => {
      for (let i = 0; i < scrollAnimElements.length; i++) {
        observer.unobserve(scrollAnimElements[i]);
      }
    };
  }, []);

  const openSignupPopup = useCallback(() => {
    setSignupPopupOpen(true);
  }, []);

  const closeSignupPopup = useCallback(() => {
    setSignupPopupOpen(false);
  }, []);

  const closeLoginPopup = () => {
    onClose();
  };

  const handleLogin = async (login) => {
    try{
      const response = await axios.post('http://127.0.0.1:5000/login', {
        email,
        password,
      });

      if (response.status === 200){
        console.log('User logged in: ', response.data.message);
        login(response.data.token);
        closeLoginPopup();
      } else {
        console.error('Login failed: ', response.data.message);
      }
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };

  return (
    <>
      {isSignupPopupOpen ? (
          <SignupPopup onClose={closeSignupPopup} />
      ) : (
        <div className={styles.loginpopup} data-animate-on-scroll>
          <b className={styles.login}>Login</b>
          <b className={styles.email}>Email</b>
            <input className={styles.loginpopupChild} type="text" onChange={(e) => setEmail(e.target.value)} />
          <b className={styles.password}>Password</b>
            <input className={styles.loginpopupItem} type="password" onChange={(e) => setPassword(e.target.value)} />          <button className={styles.loginWrapper} onClick={() => handleLogin(login)}>
            <b className={styles.login1}>Login</b>
          </button>
          <div className={styles.dontHaveAn}>Dont have an account?</div>
          <div className={styles.signUpHere} onClick={openSignupPopup}>
            Sign up here
          </div>
        </div>
      )}
    </>
  );
};

export default LoginPopup;
