// HikVision Camera Configuration
// Update these settings with your actual camera details

module.exports = {
  // Camera configurations - Update with your actual camera IPs and credentials
  cameras: {
    'camera-1': {
      ip: '192.168.1.100',        // Replace with your camera IP
      username: 'admin',           // Replace with your camera username
      password: 'your_password',   // Replace with your camera password
      channel: 1,
      name: 'Conveyor Belt - Entry',
      enabled: true
    },
    'camera-2': {
      ip: '192.168.1.101',
      username: 'admin',
      password: 'your_password',
      channel: 1,
      name: 'Conveyor Belt - Middle',
      enabled: true
    },
    'camera-3': {
      ip: '192.168.1.102',
      username: 'admin',
      password: 'your_password',
      channel: 1,
      name: 'Conveyor Belt - Exit',
      enabled: true
    },
    'camera-4': {
      ip: '192.168.1.103',
      username: 'admin',
      password: 'your_password',
      channel: 1,
      name: 'Quality Control',
      enabled: true
    }
  },

  // FFmpeg settings for optimal streaming
  ffmpeg: {
    preset: 'ultrafast',      // Fastest encoding for low latency
    tune: 'zerolatency',      // Optimize for low latency
    segmentTime: 2,           // HLS segment duration in seconds
    listSize: 3,              // Number of segments to keep
    videoBitrate: '2000k',    // Video bitrate
    audioBitrate: '128k',     // Audio bitrate
    resolution: '1920x1080',  // Output resolution
    fps: 30                   // Frame rate
  },

  // Server settings
  server: {
    port: 3001,
    hlsPath: '/hls',
    corsEnabled: true
  }
};
