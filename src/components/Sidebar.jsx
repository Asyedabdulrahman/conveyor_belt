"use client";
import { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./subComponents/SidebarSub";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import VideoPlayer from './VideoPlayer';
import videoService from '../services/videoService';

export default function SidebarDemo() {
  const links = [
    {
      label: "Dashboard",
      href: "#",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Profile",
      href: "#",
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col overflow-hidden border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Syed Abdul",
                href: "#",
                icon: (
                  <img
                    src="https://media.licdn.com/dms/image/v2/D5635AQHDOb4lbcO4Aw/profile-framedphoto-shrink_400_400/B56ZhbzgrYH0Ac-/0/1753886886841?e=1755176400&v=beta&t=Wt-OAfjaMX_R_M89FLgQS53uEumvHHgGmGXn1UlkTE8"
                    className="h-7 w-7 shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard />
    </div>
  );
}
export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        Acet Labs
      </motion.span>
    </a>
  );
};
export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
};

// Dashboard component with video streaming

const Dashboard = () => {
  const [streams, setStreams] = useState([]);
  const [streamHealth, setStreamHealth] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStreams = async () => {
    try {
      setLoading(true);
      const availableStreams = await videoService.getAllStreams();
      setStreams(availableStreams);
      setError(null);
    } catch (err) {
      setError('Failed to load streams');
      console.error('Error loading streams:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAllStreamHealth = async () => {
    if (streams.length === 0) return;
    
    const healthData = {};
    await Promise.all(
      streams.map(async (stream) => {
        try {
          healthData[stream.id] = await videoService.checkStreamHealth(stream.id);
        } catch (err) {
          healthData[stream.id] = { healthy: false, message: 'Health check failed' };
        }
      })
    );
    setStreamHealth(healthData);
  };

  const startAllStreams = async () => {
    try {
      await videoService.startAllStreams();
      await loadStreams(); // Reload to get updated stream URLs
    } catch (err) {
      console.error('Error starting streams:', err);
    }
  };

  useEffect(() => {
    loadStreams();
  }, []);

  useEffect(() => {
    if (streams.length > 0) {
      // Initial health check
      checkAllStreamHealth();
      
      // Check stream health periodically
      const healthCheckInterval = setInterval(checkAllStreamHealth, 5000);
      return () => clearInterval(healthCheckInterval);
    }
  }, [streams]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CCTV streams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={loadStreams}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
        {/* Control Panel */}
        <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">CCTV Dashboard</h2>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {streams.filter(s => s.status === 'active').length} / {streams.length} cameras active
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={startAllStreams}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
            >
              Start All
            </button>
            <button
              onClick={loadStreams}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Top row - 4 smaller video feeds */}
        <div className="flex gap-2 h-48">
          {streams.slice(0, 4).map((stream) => (
            <div key={stream.id} className="flex-1 relative">
              <VideoPlayer
                src={stream.url}
                title={stream.name}
                isLive={stream.isLive}
                className="h-full"
                autoPlay={true}
                muted={true}
              />
              {/* Stream health indicator */}
              {streamHealth[stream.id] && (
                <div className="absolute top-8 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                  <div className="flex items-center space-x-1">
                    <span className={`w-2 h-2 rounded-full ${
                      streamHealth[stream.id].healthy ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span>{streamHealth[stream.id].latency}ms</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Bottom row - 2 larger video feeds for main monitoring */}
        <div className="flex flex-1 gap-2">
          {streams.slice(0, 2).map((stream) => (
            <div key={`main-${stream.id}`} className="flex-1 relative">
              <VideoPlayer
                src={stream.url}
                title={`${stream.name} - Main View`}
                isLive={stream.isLive}
                className="h-full"
                autoPlay={true}
                muted={false}
              />
              {/* Enhanced info overlay for main views */}
              {streamHealth[stream.id] && (
                <div className="absolute bottom-12 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${
                        streamHealth[stream.id].healthy ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      <span>Latency: {streamHealth[stream.id].latency}ms</span>
                    </div>
                    <div className="text-xs text-gray-300">
                      {streamHealth[stream.id].resolution} @ {streamHealth[stream.id].fps}fps
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
