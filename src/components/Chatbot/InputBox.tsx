/**
 * InputBox Component
 *
 * Clean text input for chat messages.
 * Enter to send, Shift+Enter for new line.
 * Auto-resizing textarea with character limit.
 */

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";

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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const maxChars = 1000;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value.slice(0, maxChars);
    setMessage(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSubmit(message);
      setMessage("");
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
      <div className="flex items-end gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
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
          className="flex-1 bg-transparent outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 resize-none text-sm px-1"
          style={{ minHeight: "36px", maxHeight: "120px" }}
        />

        {/* Send Button */}
        <motion.button
          type="submit"
          disabled={isLoading || disabled || !message.trim()}
          whileHover={{ scale: 1.05 }}
          whileActive={{ scale: 0.95 }}
          className="flex-shrink-0 p-2.5 rounded-xl text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: accentColor }}
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}

export default InputBox;
