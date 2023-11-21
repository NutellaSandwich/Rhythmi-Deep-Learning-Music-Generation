import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import styles from "./Howpage.module.css";

const Howpage = () => {
  const navigate = useNavigate();

  const onFrameLinkClick = useCallback(() => {
    navigate("/aboutpage");
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
  return (
    <div className={styles.howpage} data-animate-on-scroll>
      <Header
        frameZIndex="0"
        frameACursor="pointer"
        aboutColor="#fff"
        frameACursor1="unset"
        howItWorksColor="#ffd4d4"
        onFrameLinkClick={onFrameLinkClick}
      />
      <div className={styles.frame}>
        <img className={styles.frameIcon} alt="" src="/frame.svg" />
      </div>
      <div className={styles.howToUseSimplyChooseTheGWrapper}>
        <div className={styles.howToUseContainer}>
          <span className={styles.howToUseContainer1}>
            <p className={styles.howToUse}>
              <b>
                <span>How to Use</span>
              </b>
            </p>
            <p className={styles.blankLine}>
              <b>
                <span>&nbsp;</span>
              </b>
            </p>
            <p className={styles.simplyChooseThe}>
              Simply choose the genre, describe the music you want, and hit the
              compose button! Your music will be created by a state of the art
              machine learning language model and produce a professional,
              finalised piece of music. You can then save this to your device to
              play or edit it with your favourite editing software!
            </p>
            <p className={styles.simplyChooseThe}>&nbsp;</p>
            <p className={styles.howToUse}>
              <b>
                <span>How the AI works</span>
              </b>
            </p>
            <p className={styles.blankLine2}>
              <b>
                <span>&nbsp;</span>
              </b>
            </p>
            <p
              className={styles.simplyChooseThe}
            >{`We use an open-source language model named MUSICGEN created by the team at Meta AI, which is responsible for understanding what you want and producing impressive pieces. MUSICGEN is a single state `}</p>
            <p className={styles.simplyChooseThe}>
              transformer language model. This model has been trained using over
              20,000 hours of music to learn and understand how music is
              structured and what makes different songs a certain genre. So when
              you put in your ideas for a song, the model will look at the words
              you’ve given it and calculate what the best sounds would be to
              represent each word you have said.
            </p>
            <p className={styles.blankLine3}>
              <b>&nbsp;</b>
            </p>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Howpage;
