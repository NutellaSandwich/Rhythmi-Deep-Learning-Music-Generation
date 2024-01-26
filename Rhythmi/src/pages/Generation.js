import { useEffect, useState } from "react";
import ContainerFrame from "../components/ContainerFrame";
import SoundWave from "../components/SoundWave";
import styles from "./Generation.module.css";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from 'axios';

const Generation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [generationComplete, setGenerationComplete] = useState(false);
  const [songID, setSongID] = useState(null);

  useEffect(() => {
    const requestData = location.state;
    if (requestData) {
      axios
        .post("http://127.0.0.1:5000/generate-music", requestData)
        .then(function (response) {
          if (response.data.song_id){
            setSongID(response.data.song_id);
            setGenerationComplete(true);
          }
        })
        .catch(function (error) {
          console.error(error);
        });
    }
  }, [location.state]);


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
  });

  if (generationComplete && songID) {
    navigate('/song/${response.data.songID}');
    return null;
  }

  return (
    <div className={styles.genpage} data-animate-on-scroll>
      <ContainerFrame />
      <SoundWave className={styles.soundWaves} />
      <div className={styles.frame}>
        <img className={styles.frameIcon} alt="" src="/frame2.svg" />
        <img className={styles.frameIcon1} alt="" src="/frame3.svg" />
        <b className={styles.generating}>Generating...</b>
      </div>
    </div>
    
  );
};

export default Generation;
