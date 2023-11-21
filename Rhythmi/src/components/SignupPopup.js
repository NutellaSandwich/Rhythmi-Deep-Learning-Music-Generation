import { useState, useCallback, useEffect } from "react";
import LoginPopup from "./LoginPopup";
import styles from "./SignupPopup.module.css";

const SignupPopup = ({ onClose }) => {
  const [isLoginPopupOpen, setLoginPopupOpen] = useState(false);

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

  return (
    <>
      {isLoginPopupOpen ? (
        <LoginPopup onClose={closeLoginPopup} />
      ) : (
      <div className={styles.signuppopup} data-animate-on-scroll>
        <b className={styles.signup}>Signup</b>
        <b className={styles.email}>Email</b>
        <input className={styles.signuppopupChild} type="text" />
        <b className={styles.password}>Password</b>
        <input className={styles.signuppopupItem} type="text" />
        <button className={styles.signUpWrapper} onClick={closeSignupPopup}>
          <b className={styles.signUp}>Sign up</b>
        </button>
        <div className={styles.haveAnAccount}>Have an account?</div>
        <div className={styles.loginHere} onClick={openLoginPopup}>
          Login here
        </div>
      </div>
      )}
    </>
  );
};

export default SignupPopup;
