/**
 * About Page Component:
 * - Displays the platform's commitment to making music composition accessible to all users.
 * - Explains the platform's vision, emphasizing music as a universal language.
 * - Includes Header for navigation and ComposeCard for user interaction.
 * - Uses IntersectionObserver for animating elements on scroll for an engaging UI.
 * - Manages user authentication state via useContext to handle login states and potentially logout actions.
 */

import { useCallback, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ComposeCard from "../components/ComposeCard";
import styles from "./About.module.css";
import { AuthContext } from "../AuthContext";

const About = () => {
  const { isLoggedIn, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  const onFrameLink1Click = useCallback(() => {
    navigate("/howpage");
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

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={styles.aboutpage} data-animate-on-scroll>
      <div className={styles.forEveryoneAtRhythmiWeBeWrapper}>
        <div className={styles.forEveryoneAtContainer}>
          <span className={styles.forEveryoneAtContainer1}>
            <p className={styles.forEveryone}>
              <b>
                <span>For Everyone</span>
              </b>
            </p>
            <p className={styles.blankLine}>
              <b>
                <span>&nbsp;</span>
              </b>
            </p>
            <p
              className={styles.atRhythmiWe}
            >{`At rhythmi, we believe that music is a universal language and everyone should be able to `}</p>
            <p className={styles.atRhythmiWe}>
              express themselves through it. Our aim is to streamline and
              simplify the process of music
            </p>
            <p
              className={styles.atRhythmiWe}
            >{`composition for beginners and experienced musicians alike. The intricacies of music `}</p>
            <p
              className={styles.atRhythmiWe}
            >{`theory can be intimidating, often acting as the main barrier for people to even try `}</p>
            <p className={styles.atRhythmiWe}>
              expressing themselves through this wonderful medium.
            </p>
            <p className={styles.forEveryone}>
              <b>
                <span>Our Commitment to Accessibility</span>
              </b>
            </p>
            <p className={styles.blankLine1}>
              <b>
                <span>&nbsp;</span>
              </b>
            </p>
            <p className={styles.atRhythmiWe}>
              Rhythmi is committed to making music composition to everyone. We
              believe that anyone
            </p>
            <p
              className={styles.atRhythmiWe}
            >{`with a passion or music should be able to create music without being restricted by anything, `}</p>
            <p
              className={styles.atRhythmiWe}
            >{`be that lack of theoretically knowledge or resources. And so our user-friendly interface `}</p>
            <p className={styles.atRhythmiWe}>
              provides a simple way to produce a clean and professional product.
            </p>
            <p className={styles.forEveryone}>
              <b>
                <span>Join Us in Creating Music for Everyone</span>
              </b>
            </p>
            <p className={styles.blankLine1}>
              <b>
                <span>&nbsp;</span>
              </b>
            </p>
            <p
              className={styles.atRhythmiWe}
            >{`Explore the world of music without limitations using Rhythmi’s state of the art deep learning generation `}</p>
            <p className={styles.atRhythmiWe}>
              and discover the power of self expression through music.
            </p>
            <p className={styles.blankLine3}>
              <b>&nbsp;</b>
            </p>
          </span>
        </div>
      </div>
      <Header onFrameLink1Click={onFrameLink1Click} />
      <ComposeCard />
    </div>
  );
};

export default About;
