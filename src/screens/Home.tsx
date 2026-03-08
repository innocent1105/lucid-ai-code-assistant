import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Plus, MessageSquare, Share2, Copy, 
  Trash2, Search, Settings, Sparkles, User, 
  PanelLeftClose, PanelLeftOpen, Terminal, Mic, ScanSearch, SearchCheck, UserRoundPen, Paperclip, Menu, Image as ImageIcon, X, Code2
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import axios from 'axios';

// Markdown & Code Highlighting Imports
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function GeminiLucid() {
  const API_BASE_URL = "http://10.102.148.234/lucid/lucid-ai/backend";
  const [input, setInput] = useState('');
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Canvas State
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [canvasLanguage, setCanvasLanguage] = useState('javascript');

  const [deepResearch, setDeepResearch] = useState(true);
  const [deepReasoning, setDeepReasoning] = useState(true);
  const [humanize, setHumanize] = useState(true);

  const conversations = useLiveQuery(() => db.conversations.orderBy('createdAt').reverse().toArray()) || [];
  const messages = useLiveQuery(
    () => (activeConvId ? db.messages.where('conversationId').equals(activeConvId).toArray() : []),
    [activeConvId]
  ) || [];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleOpenCanvas = (code: string, lang: string) => {
    setActiveCode(code);
    setCanvasLanguage(lang || 'javascript');
    setIsCanvasOpen(true);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    let convId = activeConvId;
    if (!convId) {
      convId = await db.conversations.add({
        title: input.slice(0, 40),
        createdAt: Date.now(),
      }) as number;
      setActiveConvId(convId);
    }

    await db.messages.add({ conversationId: convId, role: 'user', content: input, timestamp: Date.now() });

    setInput('');
    setIsLoading(true);
   
    try {
        const res = await axios.post(`${API_BASE_URL}/lucid_ai.php`, {
            prompt: input,
            deepReseach: deepResearch,
            deepReasoning: deepReasoning,
            humanize: humanize
        });
        
        if (res.data.status === "success") {
            await db.messages.add({
                conversationId: convId!,
                role: 'assistant',
                content: `${res.data.message}`,
                timestamp: Date.now(),
            });
        } else {
            await db.messages.add({
                conversationId: convId!,
                role: 'assistant',
                content: `An error occurred while I was thinking, please try again after a minute.`,
                timestamp: Date.now(),
            });
        }
    } catch (err) {
        await db.messages.add({
            conversationId: convId!,
            role: 'assistant',
            content: `I can't process your request without internet connection. Please connect and try again.`,
            timestamp: Date.now(),
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0E0E10] text-zinc-100 font-sans overflow-hidden">
      <aside className={cn(
        "fixed md:relative inset-y-0 left-0 bg-[#18181B] transition-all duration-300 z-50 flex flex-col border-r border-zinc-800",
        isSidebarOpen ? "w-72 translate-x-0" : "w-0 md:w-20 -translate-x-full md:translate-x-0 overflow-hidden"
      )}>
        <div className="p-4 flex flex-col h-full">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 cursor-pointer hover:bg-zinc-800 rounded-full w-fit transition mb-8 text-zinc-400">
            <Menu size={22} />
          </button>

          <button 
            onClick={() => { setActiveConvId(null); if(window.innerWidth < 768) setIsSidebarOpen(false); setIsCanvasOpen(false); }}
            className={cn(
              "flex items-center cursor-pointer gap-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-3 rounded-2xl transition-all shadow-md",
              isSidebarOpen ? "px-4 w-full" : "px-0 justify-center w-12 mx-auto"
            )}
          >
            <Plus size={20} />
            {isSidebarOpen && <span className="font-medium text-sm">New Chat</span>}
          </button>

          <div className="mt-8 flex-1 space-y-2 overflow-y-auto no-scrollbar">
            {isSidebarOpen && <p className="text-xs font-semibold text-zinc-500 px-4 mb-4 uppercase tracking-wider">Recent</p>}
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => { setActiveConvId(conv.id!); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-full cursor-pointer transition-all mx-2",
                  activeConvId === conv.id ? "bg-zinc-800 text-blue-400" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                )}
              >
                {/* <MessageSquare size={18} className="shrink-0" /> */}
                {isSidebarOpen && <span className="truncate text-sm">{conv.title}</span>}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex overflow-hidden">
        
        <main className={cn(
            "flex-1 flex flex-col relative bg-[#0E0E10] transition-all duration-500",
            isCanvasOpen ? "hidden md:flex md:max-w-[40%]" : "w-full"
        )}>
          
          <header className="h-16 flex items-center justify-between px-6 shrink-0 border-b border-zinc-800/50">
            <div className="flex items-center gap-2">
              <span className="text-xl font-medium text-zinc-200 tracking-tight">Lucid <span className="text-blue-500">AI</span></span>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg ring-1 ring-zinc-700" />
          </header>

          <div className="flex-1 overflow-y-auto px-4 scrollbar-hide">
            {!activeConvId ? (
              <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center">
                <h1 className="text-4xl  text-zinc-100 md:text-5xl font-medium tracking-tight mb-4">
                  Hello, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400"> Lucid.</span>
                </h1>
                <div className="text-lg md:text-xl font-medium text-zinc-400 mb-12">
                  I am here to help you learn faster.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full px-4">
                  {['Plan a trip', 'Summarize text', 'Write code'].map(tag => (
                    <div key={tag} onClick={() => setInput(tag)} className="bg-zinc-900 glass-glow border border-zinc-800 p-4 rounded-2xl text-center text-sm text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 cursor-pointer transition-all">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto py-8 space-y-10">
                {messages.map((m) => (
                  <div key={m.id} className={cn("flex w-full mb-8 group", m.role === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn("flex gap-4 max-w-full", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                      <div className={cn("flex flex-col space-y-2", m.role === 'user' ? "items-end" : "items-start")}>
                        <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 px-1">
                          {m.role === 'assistant' ? 'Lucid AI' : 'You'}
                        </p>
                        <div className={cn(
                          "text-[16px] leading-relaxed transition-all",
                          m.role === 'user' 
                            ? "bg-zinc-900 text-white px-5 py-3 max-w-lg truncate rounded-[24px] rounded-tr-none shadow-md" 
                            : "text-zinc-200 pt-1 w-full"
                        )}>
                          <ReactMarkdown
                            components={{
                              code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                const codeContent = String(children).replace(/\n$/, '');
                                if (!inline && match) {
                                  return (
                                    <div className="relative group/code my-4 rounded-xl overflow-hidden border border-zinc-700 bg-[#1e1e1e]">
                                      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/50 border-b border-zinc-700">
                                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">{match[1]}</span>
                                        <button 
                                          onClick={() => handleOpenCanvas(codeContent, match[1])}
                                          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                          <Code2 size={12} /> Open in Canvas
                                        </button>
                                      </div>
                                      <SyntaxHighlighter
                                        style={vscDarkPlus}
                                        language={match[1]}
                                        PreTag="div"
                                        customStyle={{ margin: 0, padding: '1rem', fontSize: '13px', background: 'transparent' }}
                                      >
                                        {codeContent}
                                      </SyntaxHighlighter>
                                    </div>
                                  );
                                }
                                return <code className="bg-zinc-800 text-pink-400 px-1.5 py-0.5 rounded text-sm" {...props}>{children}</code>;
                              }
                            }}
                          >
                            {m.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-6 animate-pulse px-4">
                    <div className="h-8 w-8 rounded-full bg-zinc-800" />
                    <div className="flex-1 space-y-3 pt-2">
                      <div className="h-2 bg-zinc-800 rounded w-full" />
                      <div className="h-2 bg-zinc-800 rounded w-5/6" />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} className="h-32" />
              </div>
            )}
          </div>

          <div className="p-4 shrink-0 bg-[#0E0E10] border-t border-zinc-800/50">
            <form onSubmit={handleSendMessage} className={`
                ${messages.length == 0 || isLoading && " animate-neon"}
                w-full max-w-3xl mx-auto bg-zinc-900 border border-zinc-800 rounded-[28px] px-6 py-2 flex flex-col shadow-2xl focus-within:border-zinc-600 transition-all
              `}>
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Lucid anything..."
                className="w-full bg-transparent border-none outline-none py-4 text-zinc-100 placeholder:text-zinc-500 resize-none max-h-40"
                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              />
              <div className="flex items-center justify-between pb-2 border-t border-zinc-800 pt-2">
                <div className="flex items-center gap-1 flex-wrap">
                  <ToggleButton icon={<SearchCheck size={14}/>} label="Deep Reasoning" active={deepReasoning} onClick={() => setDeepReasoning(!deepReasoning)} />
                  <ToggleButton icon={<ScanSearch size={14}/>} label="Deep Research" active={deepResearch} onClick={() => setDeepResearch(!deepResearch)} />
                  <ToggleButton icon={<UserRoundPen size={14}/>} label="Humanize" active={humanize} onClick={() => setHumanize(!humanize)} />
                </div>
                <button type="submit" disabled={!input.trim() || isLoading} className="p-2.5 cursor-pointer text-blue-500 hover:bg-zinc-800 rounded-full disabled:text-zinc-700 transition-all">
                  <Send size={22} fill={input.trim() ? "currentColor" : "none"} />
                </button>
              </div>
            </form>
          </div>
        </main>

        {/* CANVAS SECTION */}
        {isCanvasOpen && (
          <aside className="flex-1 bg-[#1e1e1e] flex flex-col animate-in slide-in-from-right duration-500 z-10 border-l border-zinc-800 shadow-2xl">
            <div className="h-16 flex items-center justify-between px-6 bg-[#252526] border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                   <Terminal size={18} />
                </div>
                <div>
                  <h3 className="text-zinc-100 text-sm font-medium leading-none">Lucid Canvas</h3>
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{canvasLanguage}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition" onClick={() => navigator.clipboard.writeText(activeCode || '')}>
                  <Copy size={16} />
                </button>
                <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition" onClick={() => setIsCanvasOpen(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-[#1e1e1e] selection:bg-blue-500/30">
              <SyntaxHighlighter 
                language={canvasLanguage} 
                style={vscDarkPlus}
                customStyle={{ 
                  margin: 0, 
                  padding: '2rem', 
                  background: 'transparent',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: '"Fira Code", monospace'
                }}
                showLineNumbers={true}
              >
                {activeCode || ""}
              </SyntaxHighlighter>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

// Dark Mode Toggle Button Component
function ToggleButton({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      type="button" 
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 border cursor-pointer rounded-full flex items-center gap-2 text-[10px] md:text-xs font-medium transition-all",
        active 
          ? "bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]" 
          : "bg-zinc-800/50 border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
      )}
    >
      {icon} <span>{label}</span>
    </button>
  );
}