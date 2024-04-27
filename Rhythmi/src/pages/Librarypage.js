/**
 * Librarypage Component:
 * - Displays a list of music tracks created by the user, leveraging the SongItem component for each entry.
 * - Integrates with AuthContext to handle authentication status and perform secure actions like fetching and deleting songs.
 * - Utilizes IntersectionObserver for dynamic animations on scroll.
 * - Provides functionality to play, edit, download, and delete tracks, enhancing user interaction and control over their content.
 * - Uses React Router for navigation and Axios for server-side communications to manage songs effectively.
 */


import {useEffect, useContext, useState } from "react";
import AboutContainer from "../components/AboutContainer";
import styles from "./Librarypage.module.css";
import { AuthContext } from "../AuthContext";
import SongItem from "../components/SongItem";
import { useNavigate } from 'react-router-dom';

const Librarypage = () => {
  const [songs, setSongs] = useState([]);
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
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

    if(isLoggedIn){
      const jwtToken = localStorage.getItem('token');
      fetch('http://127.0.0.1:5000/user-songs', {
        method:'GET',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      })
      .then(response => response.json())
      .then(data => {
        setSongs(data);
      })
      .catch(error => console.error('Error fetching user songs:', error));
    };

    for (let i = 0; i < scrollAnimElements.length; i++) {
      observer.observe(scrollAnimElements[i]);
    }

    return () => {
      for (let i = 0; i < scrollAnimElements.length; i++) {
        observer.unobserve(scrollAnimElements[i]);
      }
    };
  }, [isLoggedIn]);

  const handleLogout = () => {
    logout();
  };

  const handleSongClick = (song) => {
    navigate(`/song`, { state: { userID: song.user_id, songID: song.id } });
  };

  const handleEdit = (event, song) => {
    event.stopPropagation();
    console.log("Editing song", song.id);
  };

  const handleDownload = (event, song) => {
    event.stopPropagation(); // Prevent triggering onClick of the parent element
    fetch(`http://127.0.0.1:5000/get-song/${song.user_id}/${song.id}`)
      .then(response => response.data())
      .then(data => {
        const url = window.URL.createObjectURL(new Blob([data.file_data]));
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${song.prompt}.mp3`; // Adjust filename as needed
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(error => console.error('Error downloading song:', error));
  };

  const handleSongDelete = async (songId) => {
    try {
      const jwtToken = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/delete-song', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ songId })
      });

      if (response.ok) {
        // Remove the deleted song from the 'songs' state
        setSongs(songs.filter(song => song.id !== songId));
      } else {
        // Handle the error if the deletion fails
        console.error('Error deleting song:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting song:', error);
    }
  };

  return (
    <div className={styles.librarypage} data-animate-on-scroll>
      <AboutContainer />
      <div className={styles.songListWrapper}>
      {songs.map(song => (
        <SongItem
          key={song.id}
          song={song}
          onClick={() => handleSongClick(song)}
          onEdit={(event) => handleEdit(event, song)}
          onDownload={(event) => handleDownload(event, song)}
          onSongDelete={() => handleSongDelete(song.id)} 
        /> ))}
      </div>
      <div className={styles.frame}>
        <img className={styles.frameIcon} alt="" src="/frame.svg" />
      </div>
      
    </div>
  );
};

export default Librarypage;
