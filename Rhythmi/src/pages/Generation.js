/**
 * Generation Component:
 * - Manages the music generation process using parameters such as prompt, genre, and optional file upload.
 * - Submits generation requests to the backend via Axios with FormData for handling multipart data.
 * - Tracks the generation status and navigates to the song page upon successful music creation.
 * - Utilizes IntersectionObserver for dynamic scroll animations, enhancing user interaction.
 * - Displays a visual representation of the generation process using the SoundWave component.
 */


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
  const [userID, setuserID] = useState(null);

  useEffect(() => {
    const { prompt, genre, token, selectedFile, duration } = location.state;

    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('genre', genre);
    formData.append('token', token);
    formData.append('duration', duration)

    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    const config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    };

    if (prompt && genre && token) {
      axios
        .post("http://127.0.0.1:5000/generate-music", formData, config)
        .then(function (response) {
          if (response.data.song_id){
            setSongID(response.data.song_id);
            setuserID(response.data.user_id);
            setGenerationComplete(true);
          }
        })
        .catch(function (error) {
          console.error(error);
        });
    }

  }, [location.state]);

  useEffect(() => {
    if (generationComplete && songID && userID) {
      navigate(`/song`, { state: { userID: userID, songID: songID } });
    }
    }, [generationComplete, songID, userID, navigate]);


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
