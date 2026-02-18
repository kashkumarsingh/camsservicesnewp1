"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Loading = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000); // Show loading for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 flex items-center justify-center bg-white z-50"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ rotate: 360, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              repeat: Infinity,
              repeatType: "loop",
              duration: 1,
            }}
            className="w-16 h-16 border-4 border-t-4 border-t-primary border-gray-200 rounded-full"
          ></motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loading;
