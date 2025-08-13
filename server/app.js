const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store active streams
const activeStreams = new Map();

// HikVision camera configurations
const cameraConfigs = {
  'camera-1': {
    ip: '192.168.0.1', // Replace with your camera IP
    username: 'admin',    // Replace with your camera username
    password: 'Enarxi123#', // Replace with your camera password
    channel: 1,
    name: 'Conveyor Belt - Entry'
  },
  'camera-2': {
    ip: '192.168.1.101',
    username: 'admin',    // Replace with your camera username
    password: 'Enarxi123#',
    channel: 1,
    name: 'Conveyor Belt - Middle'
  },
  'camera-3': {
    ip: '192.168.1.102',
    username: 'admin',    // Replace with your camera username
    password: 'Enarxi123#',
    channel: 1,
    name: 'Conveyor Belt - Exit'
  },
  'camera-4': {
    ip: '192.168.1.103',
    username: 'admin',    // Replace with your camera username
    password: 'Enarxi123#',
    channel: 1,
    name: 'Quality Control'
  }
};

// Create HLS directory if it doesn't exist
const hlsDir = path.join(__dirname, '../public/hls');
if (!fs.existsSync(hlsDir)) {
  fs.mkdirSync(hlsDir, { recursive: true });
}

// Function to start RTSP to HLS conversion
function startRTSPStream(cameraId, config) {
  const rtspUrl = `rtsp://${config.username}:${config.password}@${config.ip}:554/Streaming/Channels/${config.channel}01`;
  const outputDir = path.join(hlsDir, cameraId);
  
  // Create camera-specific directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const playlistPath = path.join(outputDir, 'playlist.m3u8');
  
  // FFmpeg command for RTSP to HLS conversion
  const ffmpegArgs = [
    '-i', rtspUrl,
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ac', '2',
    '-f', 'hls',
    '-hls_time', '2',
    '-hls_list_size', '3',
    '-hls_flags', 'delete_segments',
    '-hls_allow_cache', '0',
    '-hls_segment_filename', path.join(outputDir, 'segment_%03d.ts'),
    playlistPath
  ];

  console.log(`Starting stream for ${cameraId}: ${rtspUrl}`);
  
  const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);
  
  ffmpegProcess.stdout.on('data', (data) => {
    console.log(`FFmpeg stdout (${cameraId}): ${data}`);
  });

  ffmpegProcess.stderr.on('data', (data) => {
    console.log(`FFmpeg stderr (${cameraId}): ${data}`);
  });

  ffmpegProcess.on('close', (code) => {
    console.log(`FFmpeg process for ${cameraId} exited with code ${code}`);
    activeStreams.delete(cameraId);
  });

  ffmpegProcess.on('error', (error) => {
    console.error(`FFmpeg error for ${cameraId}:`, error);
    activeStreams.delete(cameraId);
  });

  activeStreams.set(cameraId, {
    process: ffmpegProcess,
    config: config,
    startTime: new Date(),
    playlistPath: `/hls/${cameraId}/playlist.m3u8`
  });

  return {
    success: true,
    streamUrl: `/hls/${cameraId}/playlist.m3u8`,
    message: `Stream started for ${config.name}`
  };
}

// Function to stop a stream
function stopStream(cameraId) {
  const stream = activeStreams.get(cameraId);
  if (stream) {
    stream.process.kill('SIGTERM');
    activeStreams.delete(cameraId);
    
    // Clean up HLS files
    const outputDir = path.join(hlsDir, cameraId);
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
    
    return { success: true, message: `Stream ${cameraId} stopped` };
  }
  return { success: false, message: 'Stream not found' };
}

// API Routes

// Get all available cameras
app.get('/api/cameras', (req, res) => {
  const cameras = Object.keys(cameraConfigs).map(id => ({
    id,
    name: cameraConfigs[id].name,
    ip: cameraConfigs[id].ip,
    isActive: activeStreams.has(id),
    streamUrl: activeStreams.has(id) ? activeStreams.get(id).playlistPath : null
  }));
  
  res.json(cameras);
});

// Start a specific camera stream
app.post('/api/stream/:cameraId/start', (req, res) => {
  const { cameraId } = req.params;
  const config = cameraConfigs[cameraId];
  
  if (!config) {
    return res.status(404).json({ error: 'Camera not found' });
  }
  
  if (activeStreams.has(cameraId)) {
    return res.json({ 
      success: true, 
      message: 'Stream already active',
      streamUrl: activeStreams.get(cameraId).playlistPath
    });
  }
  
  try {
    const result = startRTSPStream(cameraId, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop a specific camera stream
app.post('/api/stream/:cameraId/stop', (req, res) => {
  const { cameraId } = req.params;
  const result = stopStream(cameraId);
  res.json(result);
});

// Get stream status
app.get('/api/stream/:cameraId/status', (req, res) => {
  const { cameraId } = req.params;
  const stream = activeStreams.get(cameraId);
  
  if (!stream) {
    return res.json({ active: false, message: 'Stream not active' });
  }
  
  const playlistPath = path.join(__dirname, '../public', stream.playlistPath);
  const isHealthy = fs.existsSync(playlistPath);
  
  res.json({
    active: true,
    healthy: isHealthy,
    startTime: stream.startTime,
    streamUrl: stream.playlistPath,
    config: {
      name: stream.config.name,
      ip: stream.config.ip
    }
  });
});

// Start all cameras
app.post('/api/streams/start-all', (req, res) => {
  const results = [];
  
  Object.keys(cameraConfigs).forEach(cameraId => {
    if (!activeStreams.has(cameraId)) {
      try {
        const result = startRTSPStream(cameraId, cameraConfigs[cameraId]);
        results.push({ cameraId, ...result });
      } catch (error) {
        results.push({ cameraId, success: false, error: error.message });
      }
    } else {
      results.push({ 
        cameraId, 
        success: true, 
        message: 'Stream already active' 
      });
    }
  });
  
  res.json({ results });
});

// Stop all cameras
app.post('/api/streams/stop-all', (req, res) => {
  const results = [];
  
  activeStreams.forEach((stream, cameraId) => {
    const result = stopStream(cameraId);
    results.push({ cameraId, ...result });
  });
  
  res.json({ results });
});

// Serve HLS files with proper headers
app.use('/hls', express.static(hlsDir, {
  setHeaders: (res, path) => {
    if (path.endsWith('.m3u8')) {
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (path.endsWith('.ts')) {
      res.setHeader('Content-Type', 'video/mp2t');
      res.setHeader('Cache-Control', 'public, max-age=1');
    }
  }
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    activeStreams: activeStreams.size,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  
  // Stop all active streams
  activeStreams.forEach((stream, cameraId) => {
    stopStream(cameraId);
  });
  
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`CCTV Streaming Server running on port ${PORT}`);
  console.log(`Available cameras: ${Object.keys(cameraConfigs).length}`);
  console.log('API endpoints:');
  console.log(`  GET  /api/cameras - List all cameras`);
  console.log(`  POST /api/stream/:id/start - Start camera stream`);
  console.log(`  POST /api/stream/:id/stop - Stop camera stream`);
  console.log(`  POST /api/streams/start-all - Start all cameras`);
  console.log(`  GET  /api/health - Health check`);
});

module.exports = app;
