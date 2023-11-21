import { useState, useMemo, useCallback, useEffect } from "react";
import LoginPopup from "./LoginPopup";
import PortalPopup from "./PortalPopup";
import SignupPopup from "./SignupPopup";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

const Header = ({
  icons8User962,
  frameZIndex,
  frameACursor,
  aboutColor,
  frameACursor1,
  howItWorksColor,
  icons8User962Top,
  onFrameLinkClick,
  onFrameLink1Click,
}) => {
  const [isLoginPopupOpen, setLoginPopupOpen] = useState(false);
  const [isSignupPopupOpen, setSignupPopupOpen] = useState(false);
  const frameStyle = useMemo(() => {
    return {
      zIndex: frameZIndex,
    };
  }, [frameZIndex]);

  const frameAStyle = useMemo(() => {
    return {
      cursor: frameACursor,
    };
  }, [frameACursor]);

  const aboutStyle = useMemo(() => {
    return {
      color: aboutColor,
    };
  }, [aboutColor]);

  const frameA1Style = useMemo(() => {
    return {
      cursor: frameACursor1,
    };
  }, [frameACursor1]);

  const howItWorksStyle = useMemo(() => {
    return {
      color: howItWorksColor,
    };
  }, [howItWorksColor]);

  const navigate = useNavigate();

  const onFrameLink2Click = useCallback(() => {
    navigate("/librarypage");
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

  const onFrameLink3Click = useCallback(() => {
    navigate("/createpage");
  }, [navigate]);

  const onVectorIconClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <>
      <div className={styles.frame} style={frameStyle}>
        <a
          className={styles.frameWrapper}
          style={frameAStyle}
          onClick={onFrameLinkClick}
        >
          <div className={styles.frame1}>
            <div className={styles.about} style={aboutStyle}>
              About
            </div>
          </div>
        </a>
        <a
          className={styles.howItWorksWrapper}
          onClick={onFrameLink1Click}
          style={frameA1Style}
        >
          <div className={styles.howItWorks} style={howItWorksStyle}>
            How it Works
          </div>
        </a>
        <a className={styles.libraryWrapper} onClick={onFrameLink2Click}>
          <div className={styles.howItWorks}>Library</div>
        </a>
        <button className={styles.loginwrapperWrapper}>
          <div className={styles.loginwrapper}>
            <img
              className={styles.icons8User961}
              alt=""
              src="/icons8user96-1@2x.png"
            />
            <div className={styles.vectorParent} data-animate-on-scroll>
              <img className= {styles.vectorIcon2} alt="" src="/vector2.svg"/>
              <b className={styles.logIn} onClick={openLoginPopup}>
                Log in
              </b>
              <b className={styles.signUp} onClick={openSignupPopup}>
                Sign up
              </b>
            </div>
          </div>
        </button>
        <a className={styles.createWrapper} onClick={onFrameLink3Click}>
          <div className={styles.howItWorks}>Create</div>
        </a>
        <img
          className={styles.vectorIcon}
          alt=""
          src="/vector3.svg"
          onClick={onVectorIconClick}
        />
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

export default Header;
