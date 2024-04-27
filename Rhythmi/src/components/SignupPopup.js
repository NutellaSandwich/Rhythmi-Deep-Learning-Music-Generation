/**
 * SignupPopup Component:
 * - Provides a form for user registration including email and password fields.
 * - Handles user signup through Axios POST request to a server endpoint.
 * - Offers the option to switch to a LoginPopup if the user already has an account.
 * - Uses IntersectionObserver to apply scroll animations to the popup.
 * - Closes the popup upon successful registration or when an external close function is triggered.
 */


import { useState, useCallback, useEffect } from "react";
import LoginPopup from "./LoginPopup";
import styles from "./SignupPopup.module.css";
import axios from 'axios';

const SignupPopup = ({ onClose }) => {
  const [isLoginPopupOpen, setLoginPopupOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const openLoginPopup = useCallback(() => {
    setLoginPopupOpen(true);
  }, []);

  const closeLoginPopup = useCallback(() => {
    setLoginPopupOpen(false);
  }, []);

  const closeSignupPopup = () => {
    onClose();
  }

  const handleSubmit = async (e) => {
    console.log("FHEWOIHFOEIWFHOEIWH");
    e.preventDefault();

    try{
        const response = await axios.post ('http://127.0.0.1:5000/register', {
          email,
          password
        });
      
      if(response.status === 201){
        console.log('User registered: ', response.data.message);
        closeSignupPopup();
      } else{
        console.error('Registration failed: ', response.data.message);
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
      {isLoginPopupOpen ? (
        <LoginPopup onClose={closeLoginPopup} />
      ) : (
        <form className={styles.signuppopup} onSubmit={handleSubmit} data-animate-on-scroll>
          <b className={styles.signup}>Signup</b>
          <b className={styles.email}>Email</b>
          <input
            className={styles.signuppopupChild}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <b className={styles.password}>Password</b>
          <input
            className={styles.signuppopupItem}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className={styles.signUpWrapper} type="submit">
            <b className={styles.signUp}>Sign up</b>
          </button>
          <div className={styles.haveAnAccount}>Have an account?</div>
          <div className={styles.loginHere} onClick={openLoginPopup}>
            Login here
          </div>
        </form>
      )}
    </>
  );
};

export default SignupPopup;
