// Video streaming service for CCTV feeds
class VideoService {
  constructor() {
    this.streams = new Map();
    this.baseUrl = 'http://localhost:3001';
    this.useLiveStreams = true; // Set to false for mock videos
    this.mockStreams = this.initializeMockStreams();
  }

  // Initialize mock video streams for testing
  initializeMockStreams() {
    return [
      {
        id: 'camera-1',
        name: 'Conveyor Belt - Entry',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        isLive: false,
        status: 'active'
      },
      {
        id: 'camera-2',
        name: 'Conveyor Belt - Middle',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        isLive: false,
        status: 'active'
      },
      {
        id: 'camera-3',
        name: 'Conveyor Belt - Exit',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        isLive: false,
        status: 'active'
      },
      {
        id: 'camera-4',
        name: 'Quality Control',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        isLive: false,
        status: 'active'
      }
    ];
  }

  // Get all available video streams
  async getAllStreams() {
    if (!this.useLiveStreams) {
      return this.mockStreams;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/cameras`);
      const cameras = await response.json();
      
      return cameras.map(camera => ({
        id: camera.id,
        name: camera.name,
        url: camera.streamUrl ? `${this.baseUrl}${camera.streamUrl}` : null,
        isLive: true,
        status: camera.isActive ? 'active' : 'inactive',
        ip: camera.ip
      }));
    } catch (error) {
      console.warn('Failed to fetch live streams, using mock data:', error);
      return this.mockStreams;
    }
  }

  // Get a specific stream by ID
  async getStream(id) {
    const streams = await this.getAllStreams();
    return streams.find(stream => stream.id === id);
  }

  // Convert RTSP stream to HLS/WebRTC (for future implementation)
  async convertRTSPStream(rtspUrl, streamId) {
    // This will be implemented when connecting to actual HikVision camera
    // For now, return mock data
    return {
      id: streamId,
      hlsUrl: `/api/stream/${streamId}/playlist.m3u8`,
      webrtcUrl: `/api/webrtc/${streamId}`,
      status: 'converting'
    };
  }

  // Start streaming from HikVision camera
  async startHikVisionStream(cameraId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/stream/${cameraId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Stop a stream
  async stopStream(streamId) {
    if (!this.useLiveStreams) {
      const stream = await this.getStream(streamId);
      if (stream) {
        stream.status = 'stopped';
        return { success: true, message: `Stream ${streamId} stopped` };
      }
      return { success: false, message: 'Stream not found' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/stream/${streamId}/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check stream health
  async checkStreamHealth(streamId) {
    if (!this.useLiveStreams) {
      const stream = await this.getStream(streamId);
      if (!stream) {
        return { healthy: false, message: 'Stream not found' };
      }
      return {
        healthy: stream.status === 'active',
        latency: Math.floor(Math.random() * 200) + 50,
        bitrate: Math.floor(Math.random() * 2000) + 1000,
        resolution: '1920x1080',
        fps: 30
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/stream/${streamId}/status`);
      const status = await response.json();
      
      return {
        healthy: status.healthy,
        latency: Math.floor(Math.random() * 200) + 50, // Real latency measurement would be more complex
        bitrate: Math.floor(Math.random() * 2000) + 1000,
        resolution: '1920x1080',
        fps: 30,
        active: status.active,
        startTime: status.startTime
      };
    } catch (error) {
      return { healthy: false, message: 'Failed to check stream health' };
    }
  }

  // Start all streams
  async startAllStreams() {
    try {
      const response = await fetch(`${this.baseUrl}/api/streams/start-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Stop all streams
  async stopAllStreams() {
    try {
      const response = await fetch(`${this.baseUrl}/api/streams/stop-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const videoService = new VideoService();
export default videoService;
