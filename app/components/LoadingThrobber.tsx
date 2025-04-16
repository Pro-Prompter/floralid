"use client";

import { motion } from "framer-motion";

export default function LoadingThrobber() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50"
    >
      <svg className="pl" width="128px" height="128px" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
        <circle className="pl__ring1" cx="64" cy="64" r="60" fill="none" stroke="var(--color-green-100)" strokeWidth="8" transform="rotate(-90,64,64)" strokeLinecap="round" strokeDasharray="377 377" strokeDashoffset="-376.4"/>
        <circle className="pl__ring2" cx="64" cy="64" r="52.5" fill="none" stroke="var(--color-green-200)" strokeWidth="7" transform="rotate(-90,64,64)" strokeLinecap="round" strokeDasharray="329.9 329.9" strokeDashoffset="-329.3"/>
        <circle className="pl__ring3" cx="64" cy="64" r="46" fill="none" stroke="var(--color-green-300)" strokeWidth="6" transform="rotate(-90,64,64)" strokeLinecap="round" strokeDasharray="289 289" strokeDashoffset="-288.6"/>
        <circle className="pl__ring4" cx="64" cy="64" r="40.5" fill="none" stroke="var(--color-green-400)" strokeWidth="5" transform="rotate(-90,64,64)" strokeLinecap="round" strokeDasharray="254.5 254.5" strokeDashoffset="-254"/>
        <circle className="pl__ring5" cx="64" cy="64" r="36" fill="none" stroke="var(--color-green-500)" strokeWidth="4" transform="rotate(-90,64,64)" strokeLinecap="round" strokeDasharray="226.2 226.2" strokeDashoffset="-225.8"/>
        <circle className="pl__ring6" cx="64" cy="64" r="32.5" fill="none" stroke="var(--color-green-600)" strokeWidth="3" transform="rotate(-90,64,64)" strokeLinecap="round" strokeDasharray="204.2 204.2" strokeDashoffset="-203.9"/>
      </svg>
    </motion.div>
  );
}