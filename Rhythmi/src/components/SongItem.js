import React, {useEffect, useState,useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SongItem.module.css';

const SongItem = ({ song, onClick, onEdit, onDownload }) => {

    const [audioSrc, setAudioSrc] = useState(null);
    const [genre, actualPrompt] = song.prompt.split('_music:_');

    useEffect(() => {
        fetch(`http://127.0.0.1:5000/get-song/${song.user_id}/${song.id}`)
            .then(response => response.blob())
            .then(blob =>{
                const url = URL.createObjectURL(blob);
                setAudioSrc(url);
            })
            .catch(error => console.error('Error fetching song audio: ', error));
        
        
        return () => {
            if (audioSrc) {
                URL.revokeObjectURL(audioSrc);
            }
        };
    }, [song.user_id, song.id]);


    return (
        
        <div className={styles['song-item']} onClick={onClick}>
            <div className={styles['content-wrapper']}>
                <div className={styles['text-info']}>
                    <h3>{genre}_music:</h3>
                    <h2>{actualPrompt}</h2>
                    <span className={styles['song-date']}>{"Created On: " + formatDate(song.creation_date)}</span>
                </div>
                {audioSrc && (
                    <audio controls className={styles['audio-player']}>
                        <source src={audioSrc} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                )}
            </div>
            <div className={styles['song-actions']}>
                <button onClick={(e) => { e.stopPropagation(); onEdit(e,song); }} className={styles['edit-btn']}>Edit</button>
                <button onClick={(e) => { e.stopPropagation(); onDownload(e,song); }} className={styles['download-btn']}>Download</button>
            </div>
        </div>

    )
}

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};
export default SongItem;