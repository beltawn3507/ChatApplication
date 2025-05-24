import { create } from "zustand";
import toast from "react-hot-toast";
import { usechatstore } from "./chatstore.js";
import { useauthStore } from "./authstore.js";

export const usevideochatstore = create((set, get) => {
  let peer = null;
  let localStream = null;
  // Add a buffer for ICE candidates received before peer connection is ready
  let pendingIceCandidates = [];

  const configuration = {
    iceServers: [
      { urls: ["stun:stun.l.google.com:19302"] },
      {
        urls: ["turn:relay1.expressturn.com:3480"],
        username: "174772009131925050",
        credential: "4C5UY+uQJbPyVJk5OqtLFBT28EY=",
      },
    ],
    iceCandidatePoolSize: 10,
  };

  // Helper function to add buffered ICE candidates
  const processPendingCandidates = async () => {
    if (!peer) return;
    
    console.log(`Processing ${pendingIceCandidates.length} pending ICE candidates`);
    
    while (pendingIceCandidates.length > 0) {
      const candidate = pendingIceCandidates.shift();
      try {
        console.log("Adding buffered ICE candidate", candidate);
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("Successfully added buffered ICE candidate");
      } catch (err) {
        console.error("Error adding buffered ICE candidate:", err);
      }
    }
  };

  return {
    localVideoRef: null,
    remoteVideoRef: null,
    startButton: null,
    hangupButton: null,
    muteButtonRef: null,

    setRefs: ({ localVideoRef, remoteVideoRef, startButton, hangupButton, muteButtonRef }) => {
      set({ localVideoRef, remoteVideoRef, startButton, hangupButton, muteButtonRef });
    },

    makecall: async ({ selecteduser, authuser }) => {
      const socket = useauthStore.getState().socket;

      try {
        if (peer) {
          peer.close();
          peer = null;
        }

        // Clear pending candidates when starting a new call
        pendingIceCandidates = [];

        if (!localStream) {
          localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          const { localVideoRef, startButton, hangupButton, muteButtonRef } = get();
          localVideoRef.current.srcObject = localStream;
          startButton.current.disabled = true;
          hangupButton.current.disabled = false;
          muteButtonRef.current.disabled = false;
        }

        peer = new RTCPeerConnection(configuration);

        // Add better logging for connection state changes
        peer.oniceconnectionstatechange = () => {
          console.log("ICE connection state:", peer.iceConnectionState);
          if (peer.iceConnectionState === 'failed' || peer.iceConnectionState === 'disconnected') {
            console.warn("ICE connection failed or disconnected");
            toast.error("Connection issue. Try again.");
          }
        };

        peer.onconnectionstatechange = () => {
          console.log("Peer connection state:", peer.connectionState);
          if (peer.connectionState === 'connected') {
            toast.success("Connected to peer!");
          } else if (peer.connectionState === 'failed') {
            toast.error("Connection failed.");
          }
        };

        // Handle ICE candidates
        peer.onicecandidate = (e) => {
          if (e.candidate) {
            console.log("Sending ICE candidate", e.candidate);
            const ice = {
              type: "candidate",
              candidate: e.candidate.candidate,
              sdpMid: e.candidate.sdpMid,
              sdpMLineIndex: e.candidate.sdpMLineIndex,
            };
            socket.emit("webrtc", { message: ice, selecteduser, authuser });
          }
        };

        // Improved track handling
        peer.ontrack = (e) => {
          const { remoteVideoRef } = get();
          console.log("Got remote track:", e.streams);
          
          if (e.streams && e.streams[0]) {
            const remoteStream = e.streams[0];
            
            // Check if stream has tracks
            if (remoteStream.getTracks().length === 0) {
              console.warn("Remote stream has no tracks");
              return;
            }
            
            // Ensure video element exists
            const remoteVideo = remoteVideoRef.current;
            if (!remoteVideo) {
              console.error("Remote video element not found");
              return;
            }
            
            // Set stream to video element
            remoteVideo.srcObject = remoteStream;
            
            // Add track event listeners for debugging
            remoteStream.onaddtrack = (event) => {
              console.log("Remote stream got new track", event.track);
            };
            
            remoteStream.onremovetrack = (event) => {
              console.log("Remote stream removed track", event.track);
            };
            
            // Handle autoplay
            remoteVideo.onloadedmetadata = () => {
              console.log("Remote video metadata loaded");
              remoteVideo.play()
                .then(() => console.log("Remote video playback started"))
                .catch((err) => {
                  console.warn("Remote video playback failed:", err);
                  // Try again with user interaction
                  toast.error("Video playback issue. Click to play.");
                });
            };
          } else {
            console.warn("Received track event without streams");
          }
        };

        // Add local tracks to peer connection
        localStream.getTracks().forEach((track) => {
          console.log("Adding local track to peer connection:", track.kind);
          peer.addTrack(track, localStream);
        });

        // Create and set offer
        const offer = await peer.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        
        console.log("Created offer");
        await peer.setLocalDescription(offer);
        console.log("Set local description (offer)");

        socket.emit("webrtc", {
          message: { type: "offer", sdp: offer.sdp },
          selecteduser,
          authuser,
        });
        console.log("Sent offer to signaling server");

        // Process any ICE candidates that arrived before the connection was ready
        await processPendingCandidates();
        
      } catch (err) {
        console.error("makecall error", err);
        toast.error("Could not start call: " + err.message);
      }
    },

    handlecandidate: async ({ candidate, selecteduser, authuser }) => {
      if (!peer) {
        console.log("Buffering ICE candidate - peer connection not ready yet", candidate);
        // Store the candidate to process later when peer connection is ready
        pendingIceCandidates.push(candidate);
        return;
      }
      
      try {
        if (candidate) {
          console.log("Adding ICE candidate", candidate);
          const iceCandidate = new RTCIceCandidate(candidate);
          await peer.addIceCandidate(iceCandidate);
          console.log("Successfully added ICE candidate");
        }
      } catch (err) {
        console.error("addIceCandidate error", err);
        toast.error("Connection issue with ICE candidate");
      }
    },

    handleoffer: async ({ message, selecteduser, authuser }) => {
      const socket = useauthStore.getState().socket;
      try {
        console.log("Received offer", message);
        
        // Clear pending candidates when processing a new offer
        pendingIceCandidates = [];
        
        // Get user media if not already done
        if (!localStream) {
          localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          const { localVideoRef, startButton, hangupButton, muteButtonRef } = get();
          localVideoRef.current.srcObject = localStream;
          startButton.current.disabled = true;
          hangupButton.current.disabled = false;
          muteButtonRef.current.disabled = false;
          console.log("Got local media stream");
        }

        // Create new peer connection if needed
        if (peer) {
          peer.close();
          peer = null;
          console.log("Closed existing peer connection");
        }

        peer = new RTCPeerConnection(configuration);
        console.log("Created new peer connection for answering");

        // Set up event handlers similar to makecall
        peer.oniceconnectionstatechange = () => {
          console.log("ICE connection state (answerer):", peer.iceConnectionState);
          if (peer.iceConnectionState === 'failed' || peer.iceConnectionState === 'disconnected') {
            console.warn("ICE connection failed or disconnected (answerer)");
            toast.error("Connection issue. Try again.");
          }
        };

        peer.onconnectionstatechange = () => {
          console.log("Peer connection state (answerer):", peer.connectionState);
          if (peer.connectionState === 'connected') {
            toast.success("Connected to peer!");
          } else if (peer.connectionState === 'failed') {
            toast.error("Connection failed.");
          }
        };

        peer.onicecandidate = (e) => {
          if (e.candidate) {
            console.log("Sending ICE candidate (answerer)", e.candidate);
            socket.emit("webrtc", {
              message: {
                type: "candidate",
                candidate: e.candidate.candidate,
                sdpMid: e.candidate.sdpMid,
                sdpMLineIndex: e.candidate.sdpMLineIndex,
              },
              selecteduser,
              authuser,
            });
          }
        };

        // Improved track handling
        peer.ontrack = (e) => {
          const { remoteVideoRef } = get();
          console.log("Got remote track (answerer):", e.streams);
          
          if (e.streams && e.streams[0]) {
            const remoteStream = e.streams[0];
            
            // Check if stream has tracks
            if (remoteStream.getTracks().length === 0) {
              console.warn("Remote stream has no tracks (answerer)");
              return;
            }
            
            // Ensure video element exists
            const remoteVideo = remoteVideoRef.current;
            if (!remoteVideo) {
              console.error("Remote video element not found (answerer)");
              return;
            }
            
            // Set stream to video element
            remoteVideo.srcObject = remoteStream;
            
            // Add track event listeners for debugging
            remoteStream.onaddtrack = (event) => {
              console.log("Remote stream got new track (answerer)", event.track);
            };
            
            remoteStream.onremovetrack = (event) => {
              console.log("Remote stream removed track (answerer)", event.track);
            };
            
            // Handle autoplay
            remoteVideo.onloadedmetadata = () => {
              console.log("Remote video metadata loaded (answerer)");
              remoteVideo.play()
                .then(() => console.log("Remote video playback started (answerer)"))
                .catch((err) => {
                  console.warn("Remote video playback failed (answerer):", err);
                  toast.error("Video playback issue. Click to play.");
                });
            };
          } else {
            console.warn("Received track event without streams (answerer)");
          }
        };

        // Set remote description from the offer
        const offerDesc = new RTCSessionDescription(message);
        await peer.setRemoteDescription(offerDesc);
        console.log("Set remote description (offer)");

        // Add local tracks to peer connection
        localStream.getTracks().forEach((track) => {
          console.log("Adding local track to peer connection (answerer):", track.kind);
          peer.addTrack(track, localStream);
        });

        // Create and set answer
        const answer = await peer.createAnswer();
        console.log("Created answer");
        await peer.setLocalDescription(answer);
        console.log("Set local description (answer)");

        // Send answer to signaling server
        socket.emit("webrtc", {
          message: { type: "answer", sdp: answer.sdp },
          selecteduser,
          authuser,
        });
        console.log("Sent answer to signaling server");
        
        // Process any ICE candidates that arrived before the connection was ready
        await processPendingCandidates();
        
      } catch (err) {
        console.error("handleoffer error:", err);
        toast.error("Could not handle incoming call: " + err.message);
      }
    },

    handleanswer: async ({ message, selecteduser, authuser }) => {
      if (!peer) {
        console.warn("Received answer but peer connection doesn't exist");
        return;
      }
      
      try {
        console.log("Received answer", message);
        const desc = new RTCSessionDescription(message);
        await peer.setRemoteDescription(desc);
        console.log("Set remote description (answer)");
        
        // Process any ICE candidates that may have arrived before the answer
        await processPendingCandidates();
      } catch (err) {
        console.error("handleanswer error", err);
        toast.error("Failed to process answer: " + err.message);
      }
    },

    callend: () => {
      console.log("Ending call");
      
      // Clear pending candidates when ending the call
      pendingIceCandidates = [];
      
      if (peer) {
        peer.close();
        peer = null;
        console.log("Closed peer connection");
      }
      
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop();
          console.log("Stopped local track:", track.kind);
        });
        localStream = null;
      }
      
      // Clear remote video
      const { remoteVideoRef, startButton, hangupButton, muteButtonRef } = get();
      if (remoteVideoRef && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      
      startButton.current.disabled = false;
      hangupButton.current.disabled = true;
      muteButtonRef.current.disabled = true;
      
      console.log("Call ended and UI reset");
    },

    startB: async ({ selecteduser, authuser }) => {
      const socket = useauthStore.getState().socket;
      const { startButton, hangupButton, muteButtonRef, localVideoRef } = get();
      
      try {
        // Clear any pending ICE candidates
        pendingIceCandidates = [];
        
        console.log("Starting call - getting user media");
        localStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        console.log("Got local media stream");
        localVideoRef.current.srcObject = localStream;
        
        startButton.current.disabled = true;
        hangupButton.current.disabled = false;
        muteButtonRef.current.disabled = false;

        console.log("Sending ready signal");
        socket.emit("webrtc", {
          message: { type: "ready" },
          selecteduser,
          authuser,
        });
        
      } catch (err) {
        console.error("getUserMedia error", err);
        toast.error("Could not access camera/microphone: " + err.message);
      }
    },

    hangB: ({ selecteduser, authuser }) => {
      const socket = useauthStore.getState().socket;
      console.log("Hang up requested");
      
      get().callend();
      
      socket.emit("webrtc", {
        message: { type: "bye" },
        selecteduser,
        authuser,
      });
      console.log("Sent bye signal");
    },
  };
});