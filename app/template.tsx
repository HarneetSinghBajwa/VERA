"use client";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
export default function Template({children}:{children:React.ReactNode}){const path=usePathname();const reduced=useReducedMotion();return <motion.div key={path} initial={reduced?false:{opacity:.35,y:7}} animate={{opacity:1,y:0}} transition={{duration:.42,ease:[.22,.7,.25,1]}}>{children}</motion.div>}
