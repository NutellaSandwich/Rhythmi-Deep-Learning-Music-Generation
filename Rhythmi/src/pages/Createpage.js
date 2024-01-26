import { useCallback, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AboutSection from "../components/AboutSection";
import styles from "./Createpage.module.css";
import { AuthContext } from "../AuthContext";


const Createpage = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [otherValue, setOtherValue] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
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
      // Pass the data to the generation page
      navigate("/generation", {
        state: {
          prompt: inputValue,
          genre: selectedGenre === "Other" ? otherValue : selectedGenre,
          token: jwtToken
        },
      });
    }
  }, [navigate, selectedGenre, inputValue,otherValue, isLoggedIn]);

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
          <b className={styles.describeYourSong}>Describe your song:</b>
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
