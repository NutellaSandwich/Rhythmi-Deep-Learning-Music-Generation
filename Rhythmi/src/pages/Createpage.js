/**
 * Createpage Component:
 * - Provides an interactive interface for users to configure and submit details for music generation.
 * - Includes input fields for genre selection, song description, and optional file upload for melody reference.
 * - Utilizes React hooks for state management, React Router for navigation, and context for authentication state.
 * - Features dynamic input handling, user feedback on selection, and a submission process that navigates to the generation page upon successful input validation.
 * - Employs IntersectionObserver for scroll animations to enhance user experience.
 */


import { useCallback, useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AboutSection from "../components/AboutSection";
import styles from "./Createpage.module.css";
import { AuthContext } from "../AuthContext";


const Createpage = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [otherValue, setOtherValue] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const { isLoggedIn, logout } = useContext(AuthContext);
  const { state } = useLocation();
  const [selectedFile, setSelectedFile] = useState(state?.editMode ? state?.songData?.file_data : null);  const [duration, setDuration] = useState(5);
  console.log("State value:", state); 

  useEffect(() => {
    console.log("Createpage rendered. State value:", state); 
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
  }, [state]);


  const handleRadioClick = (genre) => {
    setSelectedGenre(genre);
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);
  };

  const handleOtherChange = (event) => {
    const value = event.target.value;
    setOtherValue(value);
  };
  
  const handleFileChange = (event) => {
    if (state) { // Check if state exists before using it
      if (!state.editMode) {
        setSelectedFile(event.target.files[0]);
      }
    } else {
      setSelectedFile(event.target.files[0]); // Default, not in edit mode
    }
  };

  const handleDurationChange = (event) => {
    setDuration(event.target.value);
  };

  const formatDuration = () => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  const onFrameButtonClick = useCallback(() => {
    if (selectedGenre == ''){
      alert('Please choose a genre.');
    }else if (inputValue.trim() == ''){
      alert('Please describe your song.');
    }else if (selectedGenre == 'Other' && otherValue.trim() == ''){
      alert('Please describe your genre or select a preset one.')
    }else if (!isLoggedIn){
      console.log("LOGGED IN = ", isLoggedIn);
      alert('Please Log in or Sign up before creating a piece.')
    }
    else{
      const jwtToken = localStorage.getItem('token');
      navigate("/generation", {
        state: {
          prompt: inputValue,
          genre: selectedGenre === "Other" ? otherValue : selectedGenre,
          token: jwtToken,
          selectedFile: selectedFile,
          duration: duration
        },
      });
    }
  }, [navigate, selectedGenre, inputValue,otherValue, isLoggedIn, selectedFile, duration]);

  return (
    <div className={styles.createpage} data-animate-on-scroll>
      <div className={styles.generation}>
        <div className={styles.generationChild} />
        <div className={styles.generationItem} />
        <img className={styles.generationInner} alt="" src="/vector-1.svg" />
        <img className={styles.vectorIcon} alt="" src="/vector-2.svg" />
        <div className={styles.frame}>
          <div className={styles.other}>Other:</div>
        </div>
        <input
          className={styles.frameInput}
          placeholder="Happy funky sunshine..."
          type="text"
          onChange={handleInputChange}
        />
        <button className={styles.composeWrapper} onClick={onFrameButtonClick}>
          <b className={styles.compose}>Compose</b>
        </button>
        
        <button className={styles.rockWrapper}>
          <div className={styles.rock}>Rock</div>
        </button>
        <button className={styles.hipHopWrapper}>
          <div className={styles.hipHop}>Hip Hop</div>
        </button>
        <button className={styles.indieWrapper}>
          <div className={styles.rock}>Indie</div>
        </button>
        <div className={styles.frame1}>
          <b className={styles.describeYourSong1}>Describe your song:</b>
        </div>
        {state?.editMode ? (
          <div className={styles.editingMessage}>Editing Song...</div>
        ) : (
          <div className={styles.uploadAudioFile}>
            <label htmlFor="audioUpload" className={styles.uploadLabel}>
              Upload a Song to use its Melody (optional)
            </label>
            <input
              id="audioUpload"
              type="file"
              onChange={handleFileChange}
              accept="audio/*"
              className={styles.fileInput}
            />
          </div>
        )}
        

        <div className={`${styles.durationSliderContainer} ${state?.editMode ? styles.editModeStyle : ''}`}>
          <div className={styles.durationText}>Duration: {formatDuration()}</div>
          <input
            id="durationSlider"
            type="range"
            min="5"
            max="300"
            value={duration}
            onChange={handleDurationChange}
            className={styles.durationSlider}
          />
        </div>

        <div className={styles.frame2}>
          <b className={styles.describeYourSong}>Choose the Genre:</b>
        </div>
        <button className={styles.classicalWrapper}>
          <div className={styles.hipHop}>Classical</div>
        </button>
        <button className={styles.popWrapper}>
          <div className={styles.pop}>Pop</div>
        </button>
        
        <div className={styles.ellipseDiv} />
        <div className={styles.otherCheckboxParent}>
          <input className={styles.otherCheckbox} type="radio" name="genre" onChange={(e) => handleRadioClick('Other')}/>
          <input className={styles.indieCheckbox} type="radio" name="genre" onChange={(e) => handleRadioClick('Indie')}/>
          <input className={styles.classicCheckbox} type="radio" name="genre" onChange={(e) => handleRadioClick('Classical')}/>
          <input className={styles.rockCheckbox} type="radio" name="genre" onChange={(e) => handleRadioClick('Rock')}/>
          <input className={styles.popCheckbox} type="radio" name="genre" onChange={(e) => handleRadioClick('Pop')}/>
          <input className={styles.hipCheckbox} type="radio" name="genre" onChange={(e) => handleRadioClick('Hip-Hop')}/>
        </div>
        <div className={styles.frame3}>
          <input className={styles.frameChild} type="text" onChange={handleOtherChange}/>
        </div>
        
      </div>
      <AboutSection />
    </div>
  );
};

export default Createpage;
