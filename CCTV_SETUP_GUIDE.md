# HikVision CCTV Live Streaming Setup Guide

## Overview
This guide will help you set up live CCTV streaming from your HikVision cameras to your React dashboard using RTSP-to-HLS conversion.

## Prerequisites

### 1. FFmpeg Installation
FFmpeg is required to convert RTSP streams to HLS format for browser compatibility.

**Download and Install FFmpeg:**
1. Go to https://ffmpeg.org/download.html
2. Download the Windows build
3. Extract to `C:\ffmpeg`
4. Add `C:\ffmpeg\bin` to your Windows PATH environment variable

**Verify Installation:**
```bash
ffmpeg -version
```

### 2. Camera Configuration
Update the camera configurations in `server/app.js` with your actual HikVision camera details:

```javascript
const cameraConfigs = {
  'camera-1': {
    ip: '192.168.1.100',     // Replace with your camera IP
    username: 'admin',        // Replace with your camera username
    password: 'your_password', // Replace with your camera password
    channel: 1,
    name: 'Conveyor Belt - Entry'
  },
  // ... add more cameras
};
```

### 3. Network Configuration
Ensure your cameras are accessible:
- Cameras should be on the same network as your server
- RTSP port 554 should be accessible
- Test RTSP URL format: `rtsp://username:password@camera_ip:554/Streaming/Channels/101`

## Installation Steps

### 1. Install Backend Dependencies
```bash
cd server
npm install
```

### 2. Install Frontend Dependencies (if needed)
```bash
# In the root directory
npm install hls.js
```

### 3. Start the Backend Server
```bash
cd server
npm start
```
The server will start on http://localhost:3001

### 4. Start the Frontend
```bash
# In the root directory
npm run dev
```
The frontend will start on http://localhost:5173

## Camera Setup

### HikVision Camera Configuration
1. **Access Camera Web Interface:**
   - Open browser and go to `http://camera_ip`
   - Login with admin credentials

2. **Enable RTSP:**
   - Go to Configuration → Network → Advanced Settings → RTSP
   - Enable RTSP service
   - Set port to 554 (default)

3. **Configure Stream Settings:**
   - Go to Configuration → Video/Audio → Video
   - Set resolution to 1920x1080 or lower for better performance
   - Set frame rate to 25-30 fps
   - Use H.264 codec

4. **Test RTSP Stream:**
   ```bash
   ffplay rtsp://admin:password@camera_ip:554/Streaming/Channels/101
   ```

## API Endpoints

The backend provides these endpoints:

- `GET /api/cameras` - List all cameras
- `POST /api/stream/:cameraId/start` - Start a camera stream
- `POST /api/stream/:cameraId/stop` - Stop a camera stream
- `GET /api/stream/:cameraId/status` - Get stream status
- `POST /api/streams/start-all` - Start all camera streams
- `POST /api/streams/stop-all` - Stop all camera streams

## Troubleshooting

### Common Issues

1. **FFmpeg not found:**
   - Ensure FFmpeg is installed and in PATH
   - Restart terminal/command prompt after PATH update

2. **Camera connection failed:**
   - Check camera IP address
   - Verify username/password
   - Ensure camera is on same network
   - Test RTSP URL manually

3. **Stream not loading:**
   - Check browser console for errors
   - Verify HLS files are being generated in `public/hls/`
   - Check server logs for FFmpeg errors

4. **High latency:**
   - Reduce camera resolution
   - Lower frame rate
   - Use faster preset in FFmpeg (already set to ultrafast)

### Performance Optimization

1. **For better performance:**
   - Use wired network connection for cameras
   - Ensure sufficient bandwidth (2-5 Mbps per camera)
   - Consider using lower resolution for preview feeds

2. **For lower latency:**
   - Reduce HLS segment time (currently 2 seconds)
   - Use WebRTC instead of HLS (more complex setup)

## Security Considerations

1. **Change default passwords** on all cameras
2. **Use strong passwords** for camera accounts
3. **Consider VPN** for remote access
4. **Firewall configuration** to limit access
5. **HTTPS** for production deployment

## Production Deployment

For production use:
1. Use environment variables for camera credentials
2. Implement proper authentication
3. Use HTTPS/SSL certificates
4. Set up monitoring and logging
5. Consider load balancing for multiple cameras

## Support

If you encounter issues:
1. Check server logs in terminal
2. Check browser developer console
3. Verify camera accessibility
4. Test RTSP streams manually with VLC or FFplay
