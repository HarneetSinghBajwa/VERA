"use client";
import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { Check, Copy } from "lucide-react";
import { Explain } from "@/components/explain";
export function CodeView({code,context}:{code:string;context:string}){const [copied,setCopied]=useState(false);async function copy(){await navigator.clipboard.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),1600);}return <><div className="code-window"><div className="code-toolbar"><span><i/> RTL SOURCE <b>VERILOG</b></span><button onClick={copy}>{copied?<Check size={14}/>:<Copy size={14}/>} {copied?"COPIED":"COPY CODE"}</button></div><Highlight theme={themes.vsDark} code={code.trim()} language="verilog">{({tokens,getLineProps,getTokenProps})=><pre className="code-body">{tokens.map((line,i)=><div key={i} {...getLineProps({line})}><span className="line-no">{String(i+1).padStart(2,"0")}</span>{line.map((token,j)=><span key={j} {...getTokenProps({token})}/>)}</div>)}</pre>}</Highlight></div><div className="detail-bottom"><span>CURATED FROM VERA VERILOG</span><Explain context={context} label="Explain this design"/></div></>}
