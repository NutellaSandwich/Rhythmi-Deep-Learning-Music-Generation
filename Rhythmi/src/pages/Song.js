import { useEffect, useState } from "react";
import AboutContainer from "../components/AboutContainer";
import styles from "./Song.module.css";

const Song = () => {
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);

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

  const handlePlayPause = () => {
    setAudioIsPlaying(!audioIsPlaying);
  };

  return (
    <div className={styles.song} data-animate-on-scroll>
      <AboutContainer />
      <div className={styles.frame}>
        <img className={styles.frameIcon} alt="" src="/frame.svg" />
      </div>

      <div className={styles.audioPlayer}>
        <audio controls>
          <source
            src="http://127.0.0.1:5000/get-audio/Classical_music.wav"
            type="audio/wav"
          />
        </audio>
        <button onClick={handlePlayPause}>
          {audioIsPlaying ? "Pause" : "Play"}
        </button>
      </div>
    </div>
  );
};

export default Song;
