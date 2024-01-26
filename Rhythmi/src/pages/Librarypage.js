import {useEffect, useContext } from "react";
import AboutContainer from "../components/AboutContainer";
import styles from "./Librarypage.module.css";
import { AuthContext } from "../AuthContext";

const Librarypage = () => {
  const { isLoggedIn, logout } = useContext(AuthContext);
  
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

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={styles.librarypage} data-animate-on-scroll>
      <AboutContainer />
      <div className={styles.frame}>
        <img className={styles.frameIcon} alt="" src="/frame.svg" />
      </div>
    </div>
  );
};

export default Librarypage;
