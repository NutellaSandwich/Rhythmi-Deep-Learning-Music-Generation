/**
 * Waveform Component:
 * - Utilizes WaveSurfer.js to display an interactive audio waveform from a provided URL.
 * - Manages playback state with play and pause functionality.
 * - Applies regions on the waveform for specified peaks and troughs with tooltips explaining musical dynamics.
 * - Customizes waveform appearance with style options and responsive behavior.
 * - Cleans up and removes the waveform instance on component unmount to prevent memory leaks.
 */


import React, { useEffect, useState, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import './Waveform.css'; // Make sure this contains the .region-tooltip styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

const Waveform = ({ url, peak, trough, duration }) => {
    const waveformRef = useRef(null);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        const ws = WaveSurfer.create({
            container: '#waveform',
            barWidth: 3,
            cursorWidth: 1,
            backend: 'WebAudio',
            height: 250,
            progressColor: '#79BEBE',
            responsive: true,
            waveColor: '#EFEFEF',
            cursorColor: 'transparent',
            plugins: [
                RegionsPlugin.create({})
            ]
        });

        waveformRef.current = ws;

        if (url) {
            ws.load(url);
        }

        return () => ws.destroy();
    }, [url]);

    useEffect(() => {
        const ws = waveformRef.current;
        if (!ws) return;

        const addRegionWithTooltip = (regionData, isPeak) => {
            const region = ws.addRegion(regionData);

            if (region.element.hasAttribute('title')) {
                region.element.removeAttribute('title');
            }
            
            region.element.onmouseenter = (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'region-tooltip';
                // Customizing tooltip text based on whether it's a peak or trough
                const tooltipText = isPeak ?
                    "Crescendo: A gradual increase in loudness in a piece of music. <br>Often Used for bulding tension and emphasising the themes." :
                    "Diminuendo: A gradual decrease in loudness in a piece of music. <br>Creating a sense of release and subtlety";
                tooltip.innerHTML = tooltipText;
                document.body.appendChild(tooltip);

                const moveTooltip = (e) => {
                    tooltip.style.left = `${e.pageX}px`;
                    tooltip.style.top = `${e.pageY + 20}px`; // Offset by 20px
                    tooltip.style.display = 'block';
                };

                const hideTooltip = () => {
                    tooltip.style.display = 'none';
                    document.body.removeChild(tooltip);
                    region.element.removeEventListener('mousemove', moveTooltip);
                    region.element.removeEventListener('mouseleave', hideTooltip);
                };

                region.element.addEventListener('mousemove', moveTooltip);
                region.element.addEventListener('mouseleave', hideTooltip);
            };
        };

        // Function to clear existing regions and add new ones
        const updateRegions = () => {
            ws.clearRegions();

            if (peak) {
                addRegionWithTooltip({
                    start: Math.max(0, peak.time - (duration * 0.008)),
                    end: peak.time + (duration * 0.008),
                    color: 'rgba(255, 0, 0, 0.4)',
                    drag: false,
                    resize: false
                }, true); // true indicates this is a peak (crescendo)
            }

            if (trough) {
                addRegionWithTooltip({
                    start: Math.max(0, trough.time - (duration * 0.008)),
                    end: trough.time + (duration * 0.008),
                    color: 'rgba(0, 0, 255, 0.4)',
                    drag: false,
                    resize: false
                }, false); // false indicates this is a trough (diminuendo)
            }
        };

        if (ws.isReady) {
            updateRegions();
        } else {
            ws.on('ready', updateRegions);
        }
    }, [peak, trough, duration]);


    const togglePlay = () => {
        setPlaying(prevPlaying => {
            const ws = waveformRef.current;
            if (ws) {
                ws.playPause();
            }
            return !prevPlaying;
        });
    };

    return (
        <div className="WaveformContainer">
            <button className="PlayButton" onClick={togglePlay}>
                {playing ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />}
            </button>
            <div id="waveform" className="Wave"></div>
        </div>
    );
};

export default Waveform;
