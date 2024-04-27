/**
 * Song Component:
 * - Displays an individual song with audio playback and waveform visualization for educational content
 * - Fetches song data, prompt, and analysis from the server using the song's ID and user ID
 * - Uses IntersectionObserver to manage scroll animations for visual elements
 * - Shows song details like BPM and key with explanatory tooltips
 */


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
  const [analysisData, setAnalysisData] = useState(null);



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
        setPrompt(data.prompt.replace(/_/g,' '));
      })
      .catch(error => {
        console.error('Error fetching prompt: ', error);
      });

    for (let i = 0; i < scrollAnimElements.length; i++) {
      observer.observe(scrollAnimElements[i]);
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/analyze-song/${userID}/${songID}`);
        const data = await response.json();
        console.log(data)
        setAnalysisData(data);
      } catch (error) {
        console.error('Error fetching analysis: ', error);
      }
    };

    fetchData();
    return () => {
      for (let i = 0; i < scrollAnimElements.length; i++) {
        observer.unobserve(scrollAnimElements[i]);
      }

    };
  }, [userID, songID]);

  useEffect(() => {
    if (analysisData) {
      console.log(analysisData);
    }
  }, [analysisData]);

  return (
    <div className={styles.song} data-animate-on-scroll>
      <SongContainer />
      <div className={styles.frame}>
        <img className={styles.frameIcon} alt="" src="/frame.svg" />
      </div>
      <p className={styles.prompt}>{prompt}</p>
      <Waveform url={audioSrc} peak={analysisData?.peak} trough={analysisData?.trough} duration={analysisData?.duration} />
      {/* Analysis Data Section */}
      <div className={styles.analysisData}>
        <div className={styles.bpm}>
          <strong>BPM:{analysisData?.bpm}</strong>
          <span className={styles.tooltip}>BPM refers to the number of beats in one minute, indicating the tempo of the song.</span>
        </div>
        <div className={styles.key}>
          <strong>Key: {analysisData?.key}</strong>
          <span className={styles.tooltip}>The key of a song determines the scale and pitch, influencing the song's overall mood and harmonic structure.</span>
        </div>
      </div>
    </div>
  );
};

export default Song;
