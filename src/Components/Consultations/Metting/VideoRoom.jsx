import React, { useEffect, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPaperPlane, FaDesktop, FaRecordVinyl, FaEllipsisV } from 'react-icons/fa'; 
import { VideoPlayer } from './VideoPlayer';
import { useAuth } from '@/pages/authContext';
import '@/widgets/assets/meeting.css'; // Import du fichier CSS
import SendIcon from "@material-ui/icons/Send";
import { IconButton, Menu, MenuItem } from '@material-ui/core';
import { FaCommentAlt } from 'react-icons/fa';
// Import de IconButton et Menu de Material-UI
import iconTwo from '/img/iconmessage.jpg';

const APP_ID = "36067b6e79984e48828b420ceeea0b5c";
const TOKEN = "007eJxTYDi/6OAei5rJ2b+f8nooT1/cEm+gK3if81ri9X/sGz+V1zorMBibGZiZJ5mlmltaWpikmlhYGFkkmRgZJKempiYaJJkmv5/+JLUhkJGBwzOPkZEBAkF8Nobk/JycxCQGBgDMZCDj";
const CHANNEL = "collab";

const client = AgoraRTC.createClient({
    mode: 'rtc',
    codec: 'vp8',
});

export const VideoRoom = () => {
    const [users, setUsers] = useState([]);
    const [localTracks, setLocalTracks] = useState([]);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false); 
    const [isRecording, setIsRecording] = useState(false); 
    const [isChatOpen, setIsChatOpen] = useState(true); 
    const { authData, setAuthUserData } = useAuth();
    const [chatMessages, setChatMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [inputMessage, setInputMessage] = useState(''); 

    const toggleCamera = () => {
        const newState = !isCameraOn;
        setIsCameraOn(newState);
        localTracks[1].setEnabled(newState); 

        const cameraIcon = document.getElementById('camera-icon');
        if (cameraIcon) {
            cameraIcon.style.color = newState ? '#ff8316' : '#ccc';
        }
    };

    const toggleAudio = () => {
        const newState = !isAudioOn;
        setIsAudioOn(newState);
        localTracks[0].setEnabled(newState); 

        const micIcon = document.getElementById('mic-icon');
        if (micIcon) {
            micIcon.style.color = newState ? '#ff8316' : '#ccc';
        }
    };

    const toggleScreenSharing = async () => {
        if (!isScreenSharing) {
            try {
                const screenTrack = await AgoraRTC.createScreenVideoTrack();
                setLocalTracks(prevTracks => [...prevTracks, screenTrack]);
                client.publish(screenTrack);
                setIsScreenSharing(true);
            } catch (error) {
                console.error('Error sharing screen:', error);
            }
        } else {
            // Stop screen sharing
            const screenTrackIndex = localTracks.findIndex(track => track.getType() === 'video');
            if (screenTrackIndex !== -1) {
                localTracks[screenTrackIndex].stop();
                localTracks[screenTrackIndex].close();
                setLocalTracks(prevTracks => prevTracks.filter((_, index) => index !== screenTrackIndex)); // Remove screen track
                setIsScreenSharing(false);
            }
        }
    };

    const toggleRecording = () => {
        setIsRecording(prevState => !prevState);
    };

    const toggleChat = () => {
        setIsChatOpen(prevState => !prevState);
    };

    const sendMessage = () => {
        if (inputMessage.trim() !== '') {
            setChatMessages(prevMessages => [...prevMessages, { message: inputMessage }]);
            setInputMessage('');
        }
    };

    useEffect(() => {
        if (authData.user) {
            const handleUserJoined = async (user, mediaType) => {
                await client.subscribe(user, mediaType);

                if (mediaType === 'video') {
                    setUsers(previousUsers => [...previousUsers, user]);
                }

                if (mediaType === 'audio') {
                    user.audioTrack.play();
                }
            };

            const handleUserLeft = user => {
                setUsers(previousUsers =>
                    previousUsers.filter(u => u.uid !== user.uid)
                );
            };

            client.on('user-published', handleUserJoined);
            client.on('user-left', handleUserLeft);

            client
            .join(APP_ID, CHANNEL, TOKEN, null)
            .then(uid =>
                Promise.all([
                    AgoraRTC.createMicrophoneAndCameraTracks(),
                    uid,
                ])
            )
            .then(([tracks, uid]) => {
                const [audioTrack, videoTrack] = tracks;
                setLocalTracks(tracks);
                setUsers(previousUsers => [
                    ...previousUsers,
                    {
                        uid,
                        videoTrack,
                        audioTrack,
                    },
                ]);
                client.publish(tracks);
            });

            return () => {
                localTracks.forEach(track => {
                    track.stop();
                    track.close();
                });

                client.off('user-published', handleUserJoined);
                client.off('user-left', handleUserLeft);
                client.unpublish(localTracks).then(() => client.leave());
            };
        }
    }, [authData]);

    return (
        <div className="pt-24 fixed">
            {authData.user ? (
            <>
              <div
    style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 550px)',
        gridGap: '10px', // Espacement entre les éléments
        justifyItems: 'center', // Pour centrer horizontalement
    }}
>
    {users.map(user => (
        <VideoPlayer user={user} key={user.id} />
    ))}
</div>


                <div className="bottom-navbar">
    <button onClick={toggleCamera}>
        {isCameraOn ? (
            <>
                <FaVideo color="#ffff" size={22} id="camera-icon" />
                <div style={{ color: '#fff', fontSize: '13px', textAlign: 'center', paddingRight: '5px' }}>Turn off camera</div>
            </>
        ) : (
            <>
                <FaVideoSlash color="#ffff" size={21} id="camera-icon" />
                <div style={{ color: '#fff', fontSize: '13px', textAlign: 'center', paddingRight: '5px' }}>Turn on camera</div>
                <div style={{ color: '#fff', fontSize: '13px', textAlign: 'center', paddingRight: '5px' }}>Camera is off</div> {/* Ajout du message */}
            </>
        )}
    </button>
    <button onClick={toggleAudio}>
        {isAudioOn ? (
            <>
                <FaMicrophone color="#ffff" size={22} id="mic-icon" />
                <div style={{ color: '#fff', fontSize: '13px', textAlign: 'center', paddingRight: '5px' }}>Mute microphone</div>
            </>
        ) : (
            <>
                <FaMicrophoneSlash color="#ffff" size={21} id="mic-icon" />
                <div style={{ color: '#fff', fontSize: '13px', textAlign: 'center', paddingRight: '5px' }}>Unmute microphone</div>
            </>
        )}
    </button>
    <button onClick={toggleScreenSharing}>
        {isScreenSharing ? (
            <>
                <FaDesktop color="#ffff" size={22} />
                <div style={{ color: '#fff', fontSize: '13px', textAlign: 'center', paddingRight: '5px' }}>Stop screen sharing</div>
            </>
        ) : (
            <>
                <FaDesktop color="#ffff" size={21} />
                <div style={{ color: '#fff', fontSize: '13px', textAlign: 'center', paddingRight: '20px' }}>Start screen sharing</div>
            </>
        )}
    </button>
    <button onClick={toggleChat}>
        <FaPaperPlane color="#ffff" size={22} />
        <div style={{ color: '#fff', fontSize: '13px', textAlign: 'center', paddingRight: '5px' }}>Open/close chat</div>
    </button>
</div>
            </>
            ) : (
            <div>Veuillez vous connecter pour activer la vidéo</div>
            )}
            {isChatOpen && (
                <div className="sidebar" style={{ position: "fixed", top: 0, right: 0, bottom: 0, padding: "20px", paddingBottom: "100px", overflowY: "auto" }}>
<h5 style={{ color: "#3498DB", position: "absolute", top: "17%", left: "10%", transform: "translate(-50%, -50%)", fontSize: "1.2em", fontWeight: "bold" }}>
    Chat
</h5>

 <div className="chat-image" style={{ marginTop: "170px" }}>
    <img src={iconTwo} alt="Chat Image" style={{ width: "100%", height: "auto" }} />
</div>

<div className="chat-window" style={{ maxHeight: "100px", overflowY: "auto", paddingBottom: "10px" }}>
    <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
        {chatMessages.map((msg, index) => (
            <li key={index}>{msg.message}</li>
        ))}
    </ul>
</div>

                    <div className="message-container" style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", alignItems: "center", paddingBottom: "10px" }}>
                        <input
                            type="text"
                            placeholder="Type your message here..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            style={{ flexGrow: 1, padding: "10px", marginRight: "10px", borderRadius: "20px", border: "none", backgroundColor: "#f0f0f0", outline: "none" }}
                        />
                        <IconButton
                            onClick={sendMessage}
                            style={{ padding: "8px", backgroundColor: "#3498DB", color: "#fff", borderRadius: "50%", height: "32px", width: "32px", marginRight: "20px" }}
                        >
                            <SendIcon />
                        </IconButton>
                    </div>
                </div>
            )}
        </div>
    );
};