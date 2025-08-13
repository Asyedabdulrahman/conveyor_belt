// media-server.js
import NodeMediaServer from 'node-media-server';

// Find the path to your ffmpeg installation
// Windows example: 'C:/ffmpeg/bin/ffmpeg.exe'
// Linux/macOS example: '/usr/bin/ffmpeg' (usually found with `which ffmpeg`)
// const FFMPEG_PATH = '/usr/bin/ffmpeg'; // <-- IMPORTANT: UPDATE THIS PATH

// media-server.js

// ... other code
const FFMPEG_PATH = './ffmpeg/bin/ffmpeg.exe'; // <-- CORRECTED PATH for Windows
// ... other code

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8000, // Port for the HLS stream
    allow_origin: '*', // Allow your React app to access it
  },
  trans: {
    ffmpeg: FFMPEG_PATH,
    tasks: [
      {
        app: 'live',
        mode: 'pull',
        edge: 'rtsp://admin:Enarxi123%23@192.168.0.64:554/Streaming/Channels/102',
        name: 'camera1',
        rtsp_transport: 'tcp',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
      }
    ]
  }
};

const nms = new NodeMediaServer(config);
nms.run();

console.log(
  'Node Media Server is running... HLS stream will be available at http://localhost:8000/live/camera1.m3u8'
);