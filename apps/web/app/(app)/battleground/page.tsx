'use client';

import React, { useState } from 'react';
import { Button } from '@sololearning/ui';
import { Swords, BellRing, Trophy, Bot, Star, Users, Search, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserMatchCard } from '../../../components/UserMatchCard';

type Tab = 'CHALLENGE_NOW' | 'REQUESTS' | 'CHAMPIONSHIP' | 'PRACTICE' | 'RANDOM' | 'SEARCH';

// Dummy Data
const dummyFriends = [
  {
    id: '1',
    name: 'AlexTheGreat',
    displayName: 'Alex The Great',
    active: true,
    streak: 12,
    xp: 4500,
    subject: 'Python 101',
    score: '3-2',
    isWinning: true,
  },
  {
    id: '2',
    name: 'CodeNinja',
    displayName: 'Code Ninja',
    active: true,
    streak: 5,
    xp: 2100,
    subject: 'Economics',
    score: '3-6',
    isWinning: false,
  },
  {
    id: '3',
    name: 'SarahDev',
    displayName: 'Sarah Dev',
    active: true,
    streak: 28,
    xp: 8900,
    subject: 'Mathematics',
    score: '2-2',
    isWinning: null,
  },
  {
    id: '4',
    name: 'PythonMaster',
    displayName: 'Python Master',
    active: false,
    streak: 2,
    xp: 1200,
    subject: 'Python 101',
    score: '5-0',
    isWinning: true,
  },
  {
    id: '5',
    name: 'ByteMe',
    displayName: 'Byte Me',
    active: false,
    streak: 0,
    xp: 500,
    subject: 'Computer Science',
    score: '2-3',
    isWinning: false,
  },
  {
    id: '6',
    name: 'AlgoRhythm',
    displayName: 'Algo Rhythm',
    active: false,
    streak: 15,
    xp: 6700,
    subject: 'Mathematics',
    score: '1-1',
    isWinning: null,
  },
].sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1));

const dummyRequests = [
  {
    id: '101',
    name: 'EpicCoder',
    displayName: 'Epic Coder',
    subject: 'Python Basics',
    score: '3-2',
    isWinning: true,
  },
  {
    id: '102',
    name: 'DataWizard',
    displayName: 'Data Wizard',
    subject: 'Computer Science',
    score: '1-4',
    isWinning: false,
  },
  {
    id: '103',
    name: 'MathGenius',
    displayName: 'Math Genius',
    subject: 'Mathematics',
    score: '2-2',
    isWinning: null,
  },
  {
    id: '104',
    name: 'LogicPro',
    displayName: 'Logic Pro',
    subject: 'Python Basics',
    score: '5-0',
    isWinning: true,
  },
  {
    id: '105',
    name: 'AlgoRhythm',
    displayName: 'Algo Rhythm',
    subject: 'Computer Science',
    score: '2-3',
    isWinning: false,
  },
  {
    id: '106',
    name: 'ByteMe',
    displayName: 'Byte Me',
    subject: 'Mathematics',
    score: '1-1',
    isWinning: null,
  },
  {
    id: '107',
    name: 'CodeNinja',
    displayName: 'Code Ninja',
    subject: 'Python Basics',
    score: '4-3',
    isWinning: true,
  },
  {
    id: '108',
    name: 'SyntaxError',
    displayName: 'Syntax Error',
    subject: 'Computer Science',
    score: '0-5',
    isWinning: false,
  },
  {
    id: '109',
    name: 'BugHunter',
    displayName: 'Bug Hunter',
    subject: 'Mathematics',
    score: '3-3',
    isWinning: null,
  },
  {
    id: '110',
    name: 'LoopMaster',
    displayName: 'Loop Master',
    subject: 'Python Basics',
    score: '2-1',
    isWinning: true,
  },
];

const dummyChampionships = [
  {
    id: 'c1',
    title: 'Weekend Hackathon',
    participants: 1240,
    prizePool: '50k XP',
    status: 'Enrolling',
  },
  {
    id: 'c2',
    title: 'Global Python Clash',
    participants: 850,
    prizePool: '25k XP',
    status: 'Starts in 2h',
  },
  {
    id: 'c3',
    title: 'Algorithm Arena',
    participants: 320,
    prizePool: '10k XP',
    status: 'Enrolling',
  },
];

const dummyPractices = [
  { id: 'p1', title: 'Warmup Bot (Easy)', desc: 'Practice basic syntax with a slow bot.' },
  { id: 'p2', title: 'Challenger Bot (Medium)', desc: 'Standard speed, good for daily practice.' },
  { id: 'p3', title: 'Terminator Bot (Hard)', desc: 'Instant answers. Test your reflexes.' },
  { id: 'p4', title: 'Bot Championship', desc: 'Face a gauntlet of increasingly difficult bots.' },
];

export default function BattlegroundPage() {
  const [activeTab, setActiveTab] = useState<Tab>('CHALLENGE_NOW');

  // Native scrolling is used, no arrow buttons needed

  const renderContent = () => {
    switch (activeTab) {
      case 'CHALLENGE_NOW':
        return (
          <motion.div
            key="challenge"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col h-full w-full max-w-full min-w-0 p-5"
          >
            <div className="text-2xl font-extrabold text-text mb-6 flex items-center gap-2">
              <Swords className="text-amber-500" /> Challenge Active Friends
            </div>
            <div className="flex items-center gap-4 w-full max-w-full min-w-0 relative">
              <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-6 pb-4 w-full max-w-full min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {dummyFriends.map((friend) => (
                  <UserMatchCard key={friend.id} user={friend}>
                    <Button
                      variant="primary"
                      fullWidth
                      style={{
                        background: '#4ade80',
                        color: 'black',
                        border: 'none',
                        fontWeight: 700,
                        borderRadius: '8px',
                      }}
                    >
                      Challenge now
                    </Button>
                  </UserMatchCard>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'REQUESTS':
        return (
          <motion.div
            key="requests"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col h-full w-full max-w-full min-w-0"
          >
            <div className="text-2xl font-extrabold text-text mb-6 flex items-center gap-2">
              <BellRing className="text-rose-500" /> Incoming Challenges
            </div>
            {dummyRequests.length === 0 ? (
              <div className="text-zinc-500 italic mt-4">No pending requests.</div>
            ) : (
              <div className="flex items-center gap-4 w-full max-w-full min-w-0 relative">
                <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-6 pb-4 w-full max-w-full min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {dummyRequests.map((req) => (
                    <UserMatchCard key={req.id} user={req as any}>
                      <Button
                        variant="secondary"
                        fullWidth
                        style={{
                          background: '#e2755e',
                          color: 'black',
                          border: 'none',
                          fontWeight: 700,
                          borderRadius: '8px',
                        }}
                      >
                        Decline
                      </Button>
                      <Button
                        variant="primary"
                        fullWidth
                        style={{
                          background: '#4ade80',
                          color: 'black',
                          border: 'none',
                          fontWeight: 700,
                          borderRadius: '8px',
                        }}
                      >
                        Accept
                      </Button>
                    </UserMatchCard>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        );

      case 'CHAMPIONSHIP':
        return (
          <motion.div
            key="championship"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col h-full w-full min-w-0"
          >
            <div className="text-2xl font-extrabold text-text mb-6 flex items-center gap-2">
              <Trophy className="text-yellow-500" /> Global Championships
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
              {dummyChampionships.map((champ) => (
                <div
                  key={champ.id}
                  className="bg-white/5 border border-white/5 rounded-2xl p-6 flex justify-between items-center transition-all duration-200 hover:bg-white/10 hover:border-white/10 hover:translate-x-1"
                >
                  <div>
                    <h4 className="text-[1.1rem] font-bold mb-1">{champ.title}</h4>
                    <p className="flex items-center gap-2 mt-1 text-[0.85rem] text-text-light">
                      <Users size={14} className="text-blue-400" /> {champ.participants}
                      <span className="text-zinc-600">|</span>
                      <Star size={14} className="text-yellow-500" /> {champ.prizePool}
                    </p>
                  </div>
                  <Button variant="primary">Join</Button>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 'PRACTICE':
        return (
          <motion.div
            key="practice"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col h-full w-full min-w-0"
          >
            <div className="text-2xl font-extrabold text-text mb-6 flex items-center gap-2">
              <Bot className="text-cyan-500" /> Practice vs AI
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
              {dummyPractices.map((prac) => (
                <div
                  key={prac.id}
                  className="bg-white/5 border border-white/5 rounded-2xl p-6 flex justify-between items-center transition-all duration-200 hover:bg-white/10 hover:border-white/10 hover:translate-x-1"
                >
                  <div>
                    <h4 className="text-[1.1rem] font-bold mb-1">{prac.title}</h4>
                    <p className="mt-1 text-[0.85rem] text-text-light">{prac.desc}</p>
                  </div>
                  <Button variant="secondary">Start</Button>
                </div>
              ))}
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-var(--topbar-height,0px))] p-6 gap-8 w-full max-w-full min-w-0 overflow-x-hidden bg-background">
      {/* Row 1: Logo */}
      <div className="flex items-center justify-center h-[5vh] w-full rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md">
        <h1 className="text-[2.5rem] font-black tracking-[4px] uppercase bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(249,115,22,0.2)]">
          BATTLEGROUND
        </h1>
      </div>

      {/* Row 2: Tabs */}
      <div className="flex flex-row gap-4 w-full justify-center md:grid-cols-2">
        <div
          className={`flex flex-col items-center justify-center w-fit h-[150px] aspect-square bg-surface border-2 rounded-2xl p-1 cursor-pointer transition-all duration-200 gap-3 hover:border-orange-500/50 hover:bg-white/5 hover:-translate-y-0.5 ${
            activeTab === 'CHALLENGE_NOW'
              ? 'border-orange-500 text-orange-500 bg-gradient-to-b from-orange-500/10 to-transparent shadow-[0_4px_20px_rgba(249,115,22,0.15)]'
              : 'border-border text-text-light'
          }`}
          onClick={() => setActiveTab('CHALLENGE_NOW')}
        >
          <Swords size={40} strokeWidth={1.5} />
          <span className="text-[0.9rem] font-bold text-center">Challenge Now</span>
        </div>

        <div
          className={`flex flex-col items-center justify-center w-fit h-[150px] aspect-square bg-surface border-2 rounded-2xl p-1 cursor-pointer transition-all duration-200 gap-3 hover:border-orange-500/50 hover:bg-white/5 hover:-translate-y-0.5 ${
            activeTab === 'REQUESTS'
              ? 'border-orange-500 text-orange-500 bg-gradient-to-b from-orange-500/10 to-transparent shadow-[0_4px_20px_rgba(249,115,22,0.15)]'
              : 'border-border text-text-light'
          }`}
          onClick={() => setActiveTab('REQUESTS')}
        >
          <BellRing size={40} strokeWidth={1.5} />
          <span className="text-[0.9rem] font-bold text-center">Requests</span>
        </div>

        <div
          className={`flex flex-col items-center justify-center w-fit h-[150px] aspect-square bg-surface border-2 rounded-2xl p-1 cursor-pointer transition-all duration-200 gap-3 hover:border-orange-500/50 hover:bg-white/5 hover:-translate-y-0.5 ${
            activeTab === 'CHAMPIONSHIP'
              ? 'border-orange-500 text-orange-500 bg-gradient-to-b from-orange-500/10 to-transparent shadow-[0_4px_20px_rgba(249,115,22,0.15)]'
              : 'border-border text-text-light'
          }`}
          onClick={() => setActiveTab('CHAMPIONSHIP')}
        >
          <Trophy size={40} strokeWidth={1.5} />
          <span className="text-[0.9rem] font-bold text-center">Championship</span>
        </div>
        <div
          className={`flex flex-col items-center justify-center w-fit h-[150px] aspect-square bg-surface border-2 rounded-2xl p-1 cursor-pointer transition-all duration-200 gap-3 hover:border-orange-500/50 hover:bg-white/5 hover:-translate-y-0.5 ${
            activeTab === 'RANDOM'
              ? 'border-orange-500 text-orange-500 bg-gradient-to-b from-orange-500/10 to-transparent shadow-[0_4px_20px_rgba(249,115,22,0.15)]'
              : 'border-border text-text-light'
          }`}
          onClick={() => setActiveTab('RANDOM')}
        >
          <Globe size={40} strokeWidth={1.5} />
          <span className="text-[0.9rem] font-bold text-center">Random</span>
        </div>

        <div
          className={`flex flex-col items-center justify-center w-fit h-[150px] aspect-square bg-surface border-2 rounded-2xl p-1 cursor-pointer transition-all duration-200 gap-3 hover:border-orange-500/50 hover:bg-white/5 hover:-translate-y-0.5 ${
            activeTab === 'PRACTICE'
              ? 'border-orange-500 text-orange-500 bg-gradient-to-b from-orange-500/10 to-transparent shadow-[0_4px_20px_rgba(249,115,22,0.15)]'
              : 'border-border text-text-light'
          }`}
          onClick={() => setActiveTab('PRACTICE')}
        >
          <Bot size={40} strokeWidth={1.5} />
          <span className="text-[0.9rem] font-bold text-center">Practice</span>
        </div>

        <div
          className={`flex flex-col items-center justify-center w-fit h-[150px] aspect-square bg-surface border-2 rounded-2xl p-1 cursor-pointer transition-all duration-200 gap-3 hover:border-orange-500/50 hover:bg-white/5 hover:-translate-y-0.5 ${
            activeTab === 'SEARCH'
              ? 'border-orange-500 text-orange-500 bg-gradient-to-b from-orange-500/10 to-transparent shadow-[0_4px_20px_rgba(249,115,22,0.15)]'
              : 'border-border text-text-light'
          }`}
          onClick={() => setActiveTab('SEARCH')}
        >
          <Search size={40} strokeWidth={1.5} />
          <span className="text-[0.9rem] font-bold text-center">Search</span>
        </div>
      </div>

      {/* Row 3: Content Area */}
      <div className="flex-1  min-w-0 max-w-full flex flex-col bg-surface rounded-[24px]  ">
        {renderContent()}
      </div>
    </div>
  );
}
