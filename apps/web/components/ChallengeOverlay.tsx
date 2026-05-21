'use client';

import React from 'react';
import { useSocket } from './socketContext';
import { Swords, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ChallengeOverlay: React.FC = () => {
  const { incomingInvite, acceptInvite, declineInvite } = useSocket();

  return (
    <AnimatePresence>
      {incomingInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Playful background glowing effect */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl" />

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mb-4">
                <Swords className="w-8 h-8 text-amber-500 animate-pulse" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">PvP Challenge!</h3>
              <p className="text-zinc-400 mb-6">
                <span className="text-amber-400 font-semibold">
                  {incomingInvite.inviter.username}
                </span>{' '}
                is challenging you to a real-time MCQ match!
              </p>

              {/* Action buttons */}
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => declineInvite(incomingInvite.challengeId)}
                  className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 bg-zinc-800/50 hover:bg-zinc-800 hover:text-white transition-all text-zinc-300 font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                  Decline
                </button>
                <button
                  onClick={() => acceptInvite(incomingInvite.challengeId)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-black hover:brightness-110 shadow-lg shadow-amber-500/15 transition-all font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-5 h-5" />
                  Accept
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
