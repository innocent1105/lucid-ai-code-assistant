import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Plus, MessageSquare, Share2, Copy, 
  Trash2, Search, Settings, Sparkles, User, 
  PanelLeftClose, PanelLeftOpen, Terminal, Mic,ScanSearch,SearchCheck,UserRoundPen, Paperclip, Menu, Image as ImageIcon
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function GeminiLucid() {
  const [input, setInput] = useState('');
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [deepThinking, setDeepThinking] = useState(true);
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

    const userQuery = input;
    setInput('');
    setIsLoading(true);

    setTimeout(async () => {
      await db.messages.add({
        conversationId: convId!,
        role: 'assistant',
        content: `I've analyzed your request regarding "${userQuery}". As a generative model, I can help you synthesize this information...`,
        timestamp: Date.now(),
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-white text-zinc-800 font-sans overflow-hidden">
      <aside className={cn(
        "fixed md:relative inset-y-0 left-0 bg-gray-100 transition-all duration-300 z-50 flex flex-col border-r border-transparent",
        isSidebarOpen ? "w-72 translate-x-0" : "w-0 md:w-20 -translate-x-full md:translate-x-0 overflow-hidden"
      )}>
        <div className="p-4 flex flex-col h-full">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 hover:bg-zinc-200/50 rounded-full w-fit transition mb-8">
            <Menu size={22} className="text-zinc-600" />
          </button>

          <button 
            onClick={() => { setActiveConvId(null); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
            className={cn(
              "flex items-center gap-3 bg-[#D3E3FD] hover:bg-[#C2D7F7] text-[#041E49] py-3 rounded-2xl transition-all shadow-sm",
              isSidebarOpen ? "px-4 w-full" : "px-0 justify-center w-12 mx-auto"
            )}
          >
            <Plus size={20} />
            {isSidebarOpen && <span className="font-medium text-sm">New Chat</span>}
          </button>

          <div className="mt-8 flex-1 space-y-2 overflow-y-auto no-scrollbar">
            {isSidebarOpen && <p className="text-xs font-semibold text-zinc-500 px-4 mb-4">Recent</p>}
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => { setActiveConvId(conv.id!); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-full cursor-pointer transition-all",
                  activeConvId === conv.id ? "bg-[#D3E3FD]" : "hover:bg-zinc-200/50"
                )}
              >
                {isSidebarOpen && <span className="truncate text-sm">{conv.title}</span>}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-white md:rounded-tl-[28px] md:my-2 md:mr-0 shadow-sm overflow-hidden">
        
        <header className="h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-medium text-zinc-700">Lucid AI <span className="text-zinc-400 font-normal text-sm"></span></span>
          </div>
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 shadow-inner" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-0">
          {!activeConvId ? (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center">
              <h1 className="text-4xl text-gray-700 md:text-5xl font-medium tracking-tight mb-2 ">
                Hello, I'm <span  className="text-4xl md:text-5xl font-medium tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-200"> Lucid.</span>
              </h1>
              <div className="text-xl md:text-xl font-medium tracking-tight mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-red-400">
                I am here to help you learn faster. Where would you like to start?
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full px-4">
                {['Plan a trip', 'Summarize text', 'Write code'].map(tag => (
                  <div key={tag} className="bg-[#F0F4F9] p-3 rounded-full text-left text-sm hover:bg-[#E1E5EA] cursor-pointer transition-all">
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-8 space-y-10">
              {messages.map((m) => (
                <div key={m.id} className={cn(
                    "flex w-full mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500",
                    m.role === 'user' ? "justify-end" : "justify-start"
                )}>
                    <div className={cn(
                        "flex gap-4 md:gap-6 max-w-[90%] md:max-w-[85%]",
                        m.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}>
                   

                    <div className={cn(
                        "flex flex-col space-y-1.5",
                        m.role === 'user' ? "items-end" : "items-start"
                    )}>
                        <p className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 px-1 pl-0">
                        {m.role === 'assistant' ? 'Lucid AI' : 'You'}
                        </p>

                        <div className={cn(
                        "text-[16px] leading-relaxed whitespace-pre-wrap transition-all",
                        m.role === 'user' 
                            ? "bg-[#F0F4F9] text-zinc-800 px-5 py-3 rounded-[24px] rounded-tr-none shadow-sm border border-zinc-100" 
                            : "text-zinc-800 pt-1"
                        )}>
                        {m.content}
                        </div>

                        {m.role === 'assistant' && (
                        <div className="flex gap-3 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition">
                            <Copy size={14} />
                            </button>
                            <button className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition">
                            <Share2 size={14} />
                            </button>
                        </div>
                        )}
                    </div>
                    </div>
                </div>
                ))}
              {isLoading && (
                <div className="flex gap-6 animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-zinc-100" />
                  <div className="flex-1 space-y-3 pt-2">
                    <div className="h-2 bg-zinc-100 rounded w-full" />
                    <div className="h-2 bg-zinc-100 rounded w-5/6" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} className="h-32" />
            </div>
          )}
        </div>

        <div className="p-4 md:pb-4 flex justify-center">
          <form 
            onSubmit={handleSendMessage}
            className="w-full max-w-3xl bg-[#F0F4F9] rounded-[32px] px-6 py-2 flex flex-col shadow-sm focus-within:bg-[#E9EEF6] transition-all"
          >
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full bg-transparent border-none outline-none py-4 text-zinc-800 placeholder:text-zinc-500 resize-none max-h-40"
              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            />
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-1">

                <button type="button"
                    onClick={()=>{
                        setDeepReasoning(!deepReasoning);
                    }}
                    className={`
                        ${deepReasoning ? "bg-blue-400/50 border-blue-200 text-zinc-800" : "bg-gray-300 border-gray-200 text-zinc-600"}
                        p-2 border flex justify-space-between gap-2 text-xs hover:bg-blue-200 cursor-pointer rounded-full transition
                    `}>
                    <SearchCheck size={14}/> <div>Deep Reasoning</div>
                </button>

                <button type="button" 
                    onClick={()=>{
                        setDeepResearch(!deepResearch);
                    }}
                    className={`
                        ${deepResearch ? "bg-blue-400/50 border-blue-200 text-zinc-800" : "bg-gray-300 border-gray-200 text-zinc-600"}
                        p-2 border flex justify-space-between gap-2 text-xs hover:bg-blue-200 cursor-pointer rounded-full transition
                    `}>
                    <ScanSearch size={14}/> <div> Deep Research</div>
                </button>
                <button type="button" 
                    onClick={()=>{
                        setHumanize(!humanize);
                    }}
                    className={`
                        ${humanize ? "bg-blue-400/50 border-blue-200 text-zinc-800" : "bg-gray-300 border-gray-200 text-zinc-600"}
                        p-2 border flex justify-space-between gap-2 text-xs hover:bg-blue-200 cursor-pointer rounded-full transition
                    `}>
                    <UserRoundPen size={14}/> <div> Humanize</div>
                </button>

              </div>
              <button 
                type="submit"
                disabled={!input.trim()}
                className="p-2.5 text-blue-600 cursor-pointer hover:bg-gray-200 rounded-full disabled:text-zinc-400 transition-all"
              >
                <Send size={22} fill={input.trim() ? "currentColor" : "none"} />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}