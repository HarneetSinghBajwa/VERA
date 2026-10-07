"use client";
import { motion, useReducedMotion } from "framer-motion";
export function Reveal({children,className=""}:{children:React.ReactNode;className?:string}){const reduced=useReducedMotion();return <motion.section className={className} initial={reduced?false:{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.78,ease:[.21,.75,.22,1]}}>{children}</motion.section>}
