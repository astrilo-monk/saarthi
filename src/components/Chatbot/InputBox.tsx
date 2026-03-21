/**
 * InputBox Component
 *
 * Input field for user messages with submit functionality.
 * Shows loading state while message is being processed.
 * Includes character limit feedback.
 */

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface InputBoxProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  accentColor?: string;
  placeholderText?: string;
}

export function InputBox({
  onSubmit,
  isLoading,
  disabled = false,
  accentColor = "#5b9aa0",
  placeholderText = "Share what's on your mind...",
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
    // Submit on Shift+Enter
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
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
      className="input-box w-full"
    >
      <div className="flex flex-col gap-2">
        {/* Input Container */}
        <div
          className="flex items-end gap-2 p-3 rounded-lg border-2 transition-colors"
          style={{
            borderColor: isLoading ? accentColor : "#e0e0e0",
            backgroundColor: "#f9f9f9",
          }}
        >
          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            disabled={isLoading || disabled}
            maxLength={maxChars}
            rows={1}
            className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 resize-none text-sm"
            style={{ minHeight: "40px", maxHeight: "120px" }}
          />

          {/* Submit Button */}
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

        {/* Character Count & Hint */}
        <div className="flex justify-between items-center px-3 text-xs text-gray-500">
          <span>
            Shift+Enter to send • {charCount}/{maxChars}
          </span>
          {isLoading && (
            <motion.span
              animate={{ opacity: [0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              Processing...
            </motion.span>
          )}
        </div>
      </div>
    </motion.form>
  );
}

export default InputBox;
