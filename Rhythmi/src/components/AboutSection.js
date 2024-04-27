/**
 * AboutSection Component:
 * - Provides navigational links to pages like About, How it Works, Library, and Home.
 * - Manages login and signup popups, allowing users to access authentication forms.
 * - Handles user authentication status, offering logout functionality for logged-in users.
 * - Uses IntersectionObserver for scroll animations to enhance visual interaction with navigational links.
 */


import { useState, useCallback, useEffect, useContext } from "react";
import LoginPopup from "./LoginPopup";
import PortalPopup from "./PortalPopup";
import SignupPopup from "./SignupPopup";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import styles from "./AboutSection.module.css";

const AboutSection = () => {
  const [isLoginPopupOpen, setLoginPopupOpen] = useState(false);
  const [isSignupPopupOpen, setSignupPopupOpen] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useContext(AuthContext);

  const onFrameLinkClick = useCallback(() => {
    navigate("/aboutpage");
  }, [navigate]);

  const onFrameLink1Click = useCallback(() => {
    navigate("/howpage");
  }, [navigate]);

  const onFrameLink2Click = useCallback(() => {
    navigate("/librarypage");
  }, [navigate]);

  const onVectorIconClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

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

  const openSignupPopup = useCallback(() => {
    setSignupPopupOpen(true);
  }, []);

  const closeSignupPopup = useCallback(() => {
    setSignupPopupOpen(false);
  }, []);

  const handleLogout = () => {
    logout();
  }

  return (
    <>
      <div className={styles.frameParent}>
        <a className={styles.frameWrapper} onClick={onFrameLinkClick}>
          <div className={styles.frame}>
            <div className={styles.about}>About</div>
          </div>
        </a>
        <a className={styles.howItWorksWrapper} onClick={onFrameLink1Click}>
          <div className={styles.howItWorks}>How it Works</div>
        </a>
        <a className={styles.libraryWrapper} onClick={onFrameLink2Click}>
          <div className={styles.howItWorks}>Library</div>
        </a>
        <a className={styles.createWrapper}>
          <div className={styles.create}>Create</div>
        </a>
        <img
          className={styles.vectorIcon}
          alt=""
          src="/vector3.svg"
          onClick={onVectorIconClick}
        />
        <div className={styles.loginwrapper}>
          <img
            className={styles.icons8User961}
            alt=""
            src="/icons8user96-1@2x.png"
          />
          <div className={styles.vectorParent}>
            <img className={styles.vectorIcon2} alt="" src="/vector2.svg" />
            {isLoggedIn ? (
              <button className={styles.logoutButton} onClick={handleLogout}>
                Sign Out
              </button>
            ) : (
              <>
                <b className={styles.logIn} onClick={openLoginPopup}>
                  Log in
                </b>
                <b className={styles.signUp} onClick={openSignupPopup}>
                  Sign up
                </b>
              </>
            )}
          </div>
        </div>
      </div>
      {isLoginPopupOpen && (
        <PortalPopup placement="Centered" onOutsideClick={closeLoginPopup}>
          <LoginPopup onClose={closeLoginPopup} />
        </PortalPopup>
      )}
      {isSignupPopupOpen && (
        <PortalPopup placement="Centered" onOutsideClick={closeSignupPopup}>
          <SignupPopup onClose={closeSignupPopup} />
        </PortalPopup>
      )}
    </>
  );
};

export default AboutSection;
