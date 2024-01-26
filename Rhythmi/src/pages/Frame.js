import { useState, useCallback, useEffect, useContext } from "react";
import LoginPopup from "../components/LoginPopup";
import PortalPopup from "../components/PortalPopup";
import SignupPopup from "../components/SignupPopup";
import { useNavigate } from "react-router-dom";
import styles from "./Frame.module.css";
import { AuthContext } from "../AuthContext";

const Frame = () => {
  const [isLoginPopupOpen, setLoginPopupOpen] = useState(false);
  const [isSignupPopupOpen, setSignupPopupOpen] = useState(false);
  const {isLoggedIn, logout} = useContext(AuthContext);

  const navigate = useNavigate();

  console.log("isLoggedIn:", isLoggedIn);
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

  const onFrameLinkClick = useCallback(() => {
    navigate("/aboutpage");
  }, [navigate]);

  const onFrameLink1Click = useCallback(() => {
    navigate("/howpage");
  }, [navigate]);

  const onFrameLink2Click = useCallback(() => {
    navigate("/librarypage");
  }, [navigate]);

  const onFrameLink3Click = useCallback(() => {
    navigate("/createpage");
  }, [navigate]);

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

  const onCreatePieceTextClick = useCallback(() => {
    navigate("/createpage");
  }, [navigate]);

  const handleLogout = () => {
    logout(); 
  };

  return (
    <>
      <div className={styles.homepage} data-animate-on-scroll>
        <div className={styles.homePage}>
          <div className={styles.homePageChild} />
          <div className={styles.vectorWrapper}>
            <img className={styles.vectorIcon} alt="" src="/vector.svg" />
          </div>
          <div className={styles.frame}>
            <a className={styles.frameWrapper} onClick={onFrameLinkClick}>
              <div className={styles.frame1}>
                <div className={styles.about}>About</div>
              </div>
            </a>
            <a className={styles.howItWorksWrapper} onClick={onFrameLink1Click}>
              <div className={styles.howItWorks}>How it Works</div>
            </a>
            <a className={styles.libraryWrapper} onClick={onFrameLink2Click}>
              <div className={styles.howItWorks}>Library</div>
            </a>
            <a className={styles.createWrapper} onClick={onFrameLink3Click}>
              <div className={styles.howItWorks}>Create</div>
            </a>
            <div className={styles.loginwrapper}>
              <img
                className={styles.icons8User961}
                alt="User Icon"
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
            <div className={styles.homebutton}>
              <img className={styles.vectorIcon1} alt="" src="/vector1.svg" />
            </div>
          </div>
          <div className={styles.rhythmi}>Rhythmi</div>
          <div className={styles.homePageItem} />
          <div className={styles.yourMusicalPotentialUnleasWrapper}>
            <div className={styles.yourMusicalPotential}>
              Your Musical Potential, Unleashed.
            </div>
          </div>
          <div className={styles.aiBasedEducationalAndCreatWrapper}>
            <div className={styles.aiBasedEducational}>
              AI Based Educational and Creativity Tool
            </div>
          </div>
          <button className={styles.createPieceWrapper}>
            <div
              className={styles.createPiece}
              onClick={onCreatePieceTextClick}
            >
              Create Piece
            </div>
          </button>

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

export default Frame;
