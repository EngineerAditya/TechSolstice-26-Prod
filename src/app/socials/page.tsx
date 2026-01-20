'use client';

import React from 'react';
import { Instagram, Linkedin, Youtube, ExternalLink } from 'lucide-react';

const SocialsPage = () => {
  const socials = [
    {
      name: 'Instagram',
      handle: '@techsolstice.mitblr',
      url: 'https://www.instagram.com/techsolstice.mitblr/#',
      borderColor: 'group-hover:border-pink-500/50', // Lowered opacity for cleaner blending
      glowColor: 'bg-pink-500/20',
      icon: <Instagram className="w-6 h-6 text-pink-500" />,
    },
    {
      name: 'LinkedIn',
      handle: 'TechSolstice MIT-B',
      url: 'https://www.linkedin.com/company/techsolstice/',
      borderColor: 'group-hover:border-blue-500/50',
      glowColor: 'bg-blue-500/20',
      icon: <Linkedin className="w-6 h-6 text-blue-500" />,
    },
    {
      name: 'YouTube',
      handle: 'TechSolstice Official',
      url: 'https://youtube.com',
      borderColor: 'group-hover:border-red-500/50',
      glowColor: 'bg-red-500/20',
      icon: <Youtube className="w-6 h-6 text-red-500" />,
    },
  ];

  return (
    // Removed bg-[#050505]. Added w-full and h-full to fit your container.
    <div className="relative w-full min-h-screen text-white flex flex-col items-center justify-center p-6 overflow-hidden">

      {/* Refined Ambient Glows: 
          These now act as a "tint" to your existing background 
          to ensure the text stays readable.
      */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-sm w-full z-10">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold tracking-tighter bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent drop-shadow-sm">
            TechSolstice'26 <br /> SOCIALS
          </h1>
        </header>

        <div className="space-y-4">
          {socials.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              // bg-white/5 + backdrop-blur is the secret to transparency that still looks "pro"
              className={`group relative flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-lg transition-all duration-500 ${social.borderColor} hover:bg-white/[0.08] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 transition-transform duration-500 group-hover:scale-110 relative overflow-hidden">
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${social.glowColor} blur-xl`} />
                  <span className="relative z-10">{social.icon}</span>
                </div>
                <div>
                  <h2 className="font-bold text-lg leading-none tracking-tight">{social.name}</h2>
                  <p className="text-xs text-white/40 mt-1">{social.handle}</p>
                </div>
              </div>

              <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialsPage;