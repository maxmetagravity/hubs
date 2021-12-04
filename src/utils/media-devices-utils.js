export const MediaDevicesEvents = Object.freeze({
  PERMISSIONS_STATUS_CHANGED: "permissions_status_changed",
  MIC_SHARE_STARTED: "mic_share_started",
  MIC_SHARE_ENDED: "mic_share_ended",
  VIDEO_SHARE_STARTED: "video_share_started",
  VIDEO_SHARE_ENDED: "video_share_ended"
});

export const PermissionStatus = Object.freeze({
  GRANTED: "granted",
  DENIED: "denied",
  PROMPT: "prompt"
});

export const MediaDevices = Object.freeze({
  MICROPHONE: "microphone",
  SPEAKERS: "speakers",
  CAMERA: "camera",
  DISPLAY: "display"
});