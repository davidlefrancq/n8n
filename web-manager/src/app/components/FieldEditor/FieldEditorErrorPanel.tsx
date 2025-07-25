'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloseButton } from "../Btn/CloseButton";

interface FieldEditorErrorPanelProps {
  message: string | null;
  close(): void;
}

export default function FieldEditorErrorPanel({ message, close }: FieldEditorErrorPanelProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = () => {
    close();
  };

  useEffect(() => {
    if (message && message.length > 0) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [message]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          onAnimationComplete={(def) => {
            // Execute `close()` after exit
            if (def === "exit") handleClose();
          }}
          className="absolute top-1/3 left-1/8 w-3/4 min-h-1/3 bg-red-100 text-red-800 p-2 rounded shadow-md"
        >
          <CloseButton
            className="border bg-red-100 text-red-700 border-red-300"
            onClick={() => setIsVisible(false)}
          />
          <div className="text-base">
            <span className="font-bold pr-1">
              Error:
            </span>
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}