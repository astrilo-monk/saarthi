/**
 * InputBox Component
 *
 * Input field for user messages with submit functionality.
 * Shows loading state while message is being processed.
 * Includes character limit feedback.
 */

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, CameraOff, Mic, MicOff } from "lucide-react";

interface InputBoxProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  accentColor?: string;
  placeholderText?: string;
  onCameraToggle?: () => void;
  onMicToggle?: () => void;
  isCameraOn?: boolean;
  isMicOn?: boolean;
}

export function InputBox({
  onSubmit,
  isLoading,
  disabled = false,
  accentColor = "#5b9aa0",
  placeholderText = "Share what's on your mind...",
  onCameraToggle,
  onMicToggle,
  isCameraOn = false,
  isMicOn = false,
}: InputBoxProps) {
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const maxChars = 1000;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value.slice(0, maxChars);
    setMessage(text);
    setCharCount(text.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSubmit(message);
      setMessage("");
      setCharCount(0);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (not Shift+Enter)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
    // Allow Shift+Enter for new line
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [message]);

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="input-box w-full flex flex-col gap-3"
    >
      {/* Input Container - Claude style clean UI */}
      <div className="flex items-end gap-3 rounded-2xl border border-gray-200 p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
        {/* Left: Camera & Mic Buttons */}
        <div className="flex gap-2">
          <motion.button
            type="button"
            onClick={onCameraToggle}
            whileHover={{ scale: 1.05 }}
            whileActive={{ scale: 0.95 }}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: isCameraOn ? accentColor : "#f0f0f0",
              color: isCameraOn ? "white" : "#666",
            }}
            title="Toggle camera"
          >
            {isCameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
          </motion.button>

          <motion.button
            type="button"
            onClick={onMicToggle}
            whileHover={{ scale: 1.05 }}
            whileActive={{ scale: 0.95 }}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: isMicOn ? accentColor : "#f0f0f0",
              color: isMicOn ? "white" : "#666",
            }}
            title="Toggle microphone"
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </motion.button>
        </div>

        {/* Center: Textarea */}
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          disabled={isLoading || disabled}
          maxLength={maxChars}
          rows={1}
          className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 resize-none text-sm"
          style={{ minHeight: "40px", maxHeight: "120px" }}
        />

        {/* Right: Send Button */}
        <motion.button
          type="submit"
          disabled={isLoading || disabled || !message.trim()}
          whileHover={{ scale: 1.05 }}
          whileActive={{ scale: 0.95 }}
          className="flex-shrink-0 p-2 rounded-lg text-white transition-opacity disabled:opacity-50"
          style={{ backgroundColor: accentColor }}
          aria-label="Send message"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              ⟳
            </motion.div>
          ) : (
            "→"
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}

export default InputBox;
