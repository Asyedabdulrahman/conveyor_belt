import { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import { IconPlayerPlay, IconPlayerPause, IconVolume, IconVolumeOff } from '@tabler/icons-react';

const VideoPlayer = ({ 
  src, 
  title = "Video Feed", 
  isLive = false, 
  className = "",
  autoPlay = true,
  muted = true 
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls = null;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => setError('Failed to load video stream');

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    if (src.includes('.m3u8')) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          if (autoPlay) video.play().catch(console.error);
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            setError('HLS stream error');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      }
    } else {
      video.src = src;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
    };
  }, [src, autoPlay, isLive]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(console.error);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        muted={isMuted}
        playsInline
        controls={false}
        loop={!isLive}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="text-white text-center">
            <p className="text-sm">{error}</p>
            <p className="text-xs text-gray-400 mt-1">Check network connection</p>
          </div>
        </div>
      )}

      {/* Title Overlay */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
        {title}
        {isLive && (
          <span className="ml-2 inline-flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1"></span>
            LIVE
          </span>
        )}
      </div>

      {/* Controls Overlay */}
      <div className="absolute bottom-2 right-2 flex space-x-1">
        <button
          onClick={togglePlay}
          className="bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-1 rounded transition-all duration-200"
        >
          {isPlaying ? (
            <IconPlayerPause className="w-4 h-4" />
          ) : (
            <IconPlayerPlay className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={toggleMute}
          className="bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-1 rounded transition-all duration-200"
        >
          {isMuted ? (
            <IconVolumeOff className="w-4 h-4" />
          ) : (
            <IconVolume className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;
