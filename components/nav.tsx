"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Hexagon } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
const links = [{href:"/fundamentals",label:"Fundamentals"},{href:"/verilog",label:"Verilog"},{href:"/minimization",label:"Minimization"}];
export function Nav(){const path=usePathname();const [open,setOpen]=useState(false);return <header className="topbar"><Link href="/" className="brand"><span className="brand-mark"><Hexagon size={17}/></span>vera<span className="brand-dot">.</span></Link><nav className="desktop-nav">{links.map(l=><Link key={l.href} className={path.startsWith(l.href)?"active":""} href={l.href}>{l.label}</Link>)}</nav><div className="nav-actions"><span className="status"><i/> LAB ONLINE</span><Link href="/minimization" className="nav-cta">Open the lab <span>↗</span></Link><button className="mobile-toggle" aria-label="Toggle navigation" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></div><AnimatePresence>{open&&<motion.nav className="mobile-nav" initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>{links.map(l=><Link onClick={()=>setOpen(false)} key={l.href} href={l.href}>{l.label}<span>↗</span></Link>)}</motion.nav>}</AnimatePresence></header>}
