import React from 'react';
import { Button } from '@sololearning/ui';

export interface MatchUser {
  id: string;
  name: string;
  displayName: string;
  subject: string;
  score: string;
  isWinning: boolean | null;
}

interface UserMatchCardProps {
  user: MatchUser;
  children?: React.ReactNode;
}

export function UserMatchCard({ user, children }: UserMatchCardProps) {
  return (
    <div className="flex-none snap-start w-[240px] bg-white/5 border border-white/5 rounded-2xl p-6 px-4 flex flex-col items-center text-center gap-3 transition-all duration-200 hover:-translate-y-1 hover:border-white/10 hover:bg-white/10">
      <div className="w-[72px] h-[72px] bg-white border-4 border-orange-500 rounded-xl flex items-center justify-center text-3xl font-bold text-orange-500 shadow-[0_4px_15px_rgba(16,185,129,0.2)] mb-1">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <h4 className="text-[0.9rem] font-medium text-text-light mb-[0.1rem]">{user.name}</h4>
        <p className="text-[1.1rem] font-extrabold text-white mt-0">{user.displayName}</p>
      </div>
      <div className="text-[0.9rem] font-bold text-white bg-[#262626] py-2 px-4 rounded-lg w-full border-none">
        {user.subject}
      </div>
      <div
        className={`flex flex-col items-center bg-[#222] rounded-xl py-3 px-4 w-full my-1 ${
          user.isWinning === true
            ? 'text-green-400'
            : user.isWinning === false
              ? 'text-rose-500'
              : 'text-slate-400'
        }`}
      >
        <div className="text-[0.8rem] font-bold text-white mb-1">Score</div>
        <div className="text-[2.5rem] font-black tracking-[2px] leading-[1.1]">{user.score}</div>
        <div className="text-[0.8rem] font-bold mt-1">
          {user.isWinning === true
            ? "You're winning"
            : user.isWinning === false
              ? "You're loosing"
              : "It's a tie"}
        </div>
      </div>
      <div className="flex w-full gap-2 mt-auto">{children}</div>
    </div>
  );
}
