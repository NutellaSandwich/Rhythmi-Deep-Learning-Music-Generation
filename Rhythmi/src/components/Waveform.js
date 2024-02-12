import React, { Component } from 'react';
import WaveSurfer from 'wavesurfer.js';
import './Waveform.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

class Waveform extends Component {
    state = {
        playing: false,
    };

    componentDidMount() {
        const track = document.querySelector('#track');

        this.waveform = WaveSurfer.create({
            barWidth: 3,
            cursorWidth: 1,
            container: '#waveform',
            backend: 'WebAudio',
            height: 250,
            progressColor: '#79BEBE',
            responsive: true,
            waveColor: '#EFEFEF',
            cursorColor: 'transparent',
        });
        if (this.props.url) {
            this.waveform.load(this.props.url);
        }
    };

    componentDidUpdate(prevProps) {
        // Only update if the URL has changed
        if (this.props.url && this.props.url !== prevProps.url) {
            this.waveform.load(this.props.url);
        }
    }

    handlePlay = () => {
        this.setState({ playing: !this.state.playing });
        this.waveform.playPause();
    };

    render() {
        const { url } = this.props;

        return (
            <div className="WaveformContainer">
                <button className="PlayButton" onClick={this.handlePlay}>
                    {!this.state.playing ?
                        <FontAwesomeIcon icon={faPlay} /> :
                        <FontAwesomeIcon icon={faPause} />
                    }
                </button>
                <div className="Wave" id="waveform" />
            </div>
        );
    }
};


export default Waveform;