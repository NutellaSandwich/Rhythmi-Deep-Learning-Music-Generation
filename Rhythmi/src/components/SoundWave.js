/**
 * SoundWave Component:
 * - Visualizes audio waveforms as a series of animated bars.
 * - Uses a set of predefined unique colors to style each bar differently.
 * - Applies random animation durations to each bar for a dynamic visual effect.
 * - Generates a fixed number of bars (40) to represent the sound wave.
 */


import React, { useEffect } from 'react';
import './SoundWave.css';

const SoundWave = () => {
  const uniqueColors = ['#DC474E', '#E47240', '#E3DE5F', '#77E375', '#5E79D8', '#7A4DDB', '#B878EB']; // Add more colors as needed

  useEffect(() => {
    const bars = document.querySelectorAll('.bar');

    bars.forEach((bar, index) => {
      // Random move
      bar.style.animationDuration = `${Math.random() * (0.7 - 0.2) + 0.2}s`; // Change the numbers for speed / (max - min) + min / ex. (0.5 - 0.1) + 0.1
      bar.style.backgroundColor = uniqueColors[index % uniqueColors.length]; // Assign unique colors
    });
  }, []);

  return (
    <div className="sound-wave">
      {[...Array(40)].map((_, index) => (
        <div key={index} className="bar" />
      ))}
    </div>
  );
};

export default SoundWave;