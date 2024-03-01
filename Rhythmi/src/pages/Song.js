import { useEffect, useState, useRef } from "react";
import SongContainer from "../components/SongContainer";
import styles from "./Song.module.css";
import { useLocation } from 'react-router-dom';
import Waveform from '../components/Waveform';


const Song = () => {
  const {state} = useLocation();
  const [audioSrc, setAudioSrc] = useState(null);
  const [prompt, setPrompt] = useState('');
  const {userID, songID} = state;



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
    fetch(`http://127.0.0.1:5000/get-song/${userID}/${songID}`)
      .then(response => response.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setAudioSrc(url);

      });

    fetch(`http://127.0.0.1:5000/get-prompt/${userID}/${songID}`)
      .then(response => response.json())
      .then(data => {
        setPrompt(data.prompt);
      })
      .catch(error => {
        console.error('Error fetching prompt: ', error);
      });

    for (let i = 0; i < scrollAnimElements.length; i++) {
      observer.observe(scrollAnimElements[i]);
    }

    return () => {
      for (let i = 0; i < scrollAnimElements.length; i++) {
        observer.unobserve(scrollAnimElements[i]);
      }

    };
  }, [userID, songID]);

  return (
    <div className={styles.song} data-animate-on-scroll>
      <SongContainer />
      <div className={styles.frame}>
        <img className={styles.frameIcon} alt="" src="/frame.svg" />
      </div>
        <p className={styles.prompt}>{prompt}</p>
      <Waveform className={styles.Waveform} url={audioSrc} />
    </div>
  );
};

export default Song;
