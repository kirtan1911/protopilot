import { useRef, useState, useCallback, useImperativeHandle, forwardRef, useEffect } from "react";
import { Mic, MicOff, Pause, Play, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AudioVisualizer from "./AudioVisualizer";

const VoiceRecorder = forwardRef(function VoiceRecorder(
  { onRecordingComplete, disabled = false, processing = false },
  ref
) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useImperativeHandle(ref, () => ({ stop: stopRecording }));

  // Timer logic
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  }, [isRecording, isPaused]);

  const startRecording = useCallback(async () => {
    if (isRecording || processing) return;
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(audioStream);
      
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(audioStream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      setRecordingTime(0);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        audioStream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setIsRecording(false);
        setIsPaused(false);
        setStream(null);
        onRecordingComplete({ blob, mimeType });
      };

      recorder.start(250); // 250ms chunks
      setIsRecording(true);
      setIsPaused(false);
    } catch (err) {
      setIsRecording(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        toast.error("Microphone access denied. Allow mic access in your browser settings.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        toast.error("No microphone found. Please connect a microphone and try again.");
      } else {
        toast.error(`Could not access microphone: ${err.message}`);
      }
    }
  }, [isRecording, processing, onRecordingComplete]);

  return (
    <div className="flex flex-col items-center gap-8 py-8 w-full">
      {/* Audio Visualizer */}
      <div className="w-full max-w-sm mx-auto flex justify-center">
        {isRecording ? (
          <AudioVisualizer stream={stream} isRecording={isRecording} isPaused={isPaused} />
        ) : (
          <div className="w-full h-24 max-w-sm rounded-xl bg-gray-900/20 border border-gray-800 flex items-center justify-center text-gray-500">
            <MicOff className="w-6 h-6 mr-2 opacity-50" />
            <span className="text-sm font-medium">Mic Standby</span>
          </div>
        )}
      </div>

      {/* Recording Time Display */}
      {isRecording && (
        <div className="text-3xl font-mono tracking-wider font-bold text-gray-100">
          {formatTime(recordingTime)}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled || processing}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all
              focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/50
              bg-indigo-600 hover:bg-indigo-500 glow-indigo shadow-lg
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {processing ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>
        ) : (
          <div className="flex items-center gap-4 bg-gray-900/50 p-2 rounded-full border border-gray-800">
            <button
              type="button"
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-800 hover:bg-gray-700 transition-colors text-white"
            >
              {isPaused ? <Play className="w-7 h-7 ml-1" /> : <Pause className="w-7 h-7" />}
            </button>
            <button
              type="button"
              onClick={stopRecording}
              className="w-16 h-16 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-colors text-white"
            >
              <Square className="w-6 h-6" fill="currentColor" />
            </button>
          </div>
        )}
      </div>

      {/* Status text */}
      <div className="text-center h-6">
        {processing ? (
          <p className="text-indigo-400 font-medium animate-pulse text-sm">Transcribing with Whisper AI…</p>
        ) : isRecording ? (
          <p className="text-gray-400 text-sm">
            {isPaused ? "Recording paused." : "Listening... Speak clearly."}
          </p>
        ) : (
          <p className="text-gray-500 text-sm">Tap the microphone to begin</p>
        )}
      </div>
    </div>
  );
});

export default VoiceRecorder;
