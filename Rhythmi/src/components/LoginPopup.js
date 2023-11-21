import { useState, useCallback, useEffect } from "react";
import SignupPopup from "./SignupPopup";
import styles from "./LoginPopup.module.css";

const LoginPopup = ({ onClose }) => {
  const [isSignupPopupOpen, setSignupPopupOpen] = useState(false);

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

  return (
    <>
      {isSignupPopupOpen ? (
          <SignupPopup onClose={closeSignupPopup} />
      ) : (
        <div className={styles.loginpopup} data-animate-on-scroll>
          <b className={styles.login}>Login</b>
          <b className={styles.email}>Email</b>
          <input className={styles.loginpopupChild} type="text" />
          <b className={styles.password}>Password</b>
          <input className={styles.loginpopupItem} type="text" />
          <button className={styles.loginWrapper} onClick={closeLoginPopup}>
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
