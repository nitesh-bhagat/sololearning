'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  SocketEvents,
  MatchInitPayload,
  RoundStartPayload,
  RoundEndPayload,
  MatchEndPayload,
} from '@sololearning/socket-contracts';

interface IncomingChallenge {
  challengeId: string;
  inviter: {
    id: string;
    username: string;
    avatar: string | null;
  };
  courseId?: string;
}

interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
  isQueued: boolean;
  matchId: string | null;
  countdown: number | null;
  gameState: MatchInitPayload | null;
  roundData: RoundStartPayload | null;
  roundEndData: RoundEndPayload | null;
  matchEndData: MatchEndPayload | null;
  opponentSubmittedScore: number | null;
  incomingInvite: IncomingChallenge | null;

  // Actions
  joinQueue: (subjectId?: string) => void;
  leaveQueue: () => void;
  sendInvite: (inviteeId: string, courseId?: string) => void;
  acceptInvite: (challengeId: string) => void;
  declineInvite: (challengeId: string) => void;
  submitAnswer: (roundIndex: number, selectedIndex: number, timeTakenMs: number) => void;
  forfeitMatch: () => void;
  resetMatchState: () => void;
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isQueued, setIsQueued] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gameState, setGameState] = useState<MatchInitPayload | null>(null);
  const [roundData, setRoundData] = useState<RoundStartPayload | null>(null);
  const [roundEndData, setRoundEndData] = useState<RoundEndPayload | null>(null);
  const [matchEndData, setMatchEndData] = useState<MatchEndPayload | null>(null);
  const [opponentSubmittedScore, setOpponentSubmittedScore] = useState<number | null>(null);
  const [incomingInvite, setIncomingInvite] = useState<IncomingChallenge | null>(null);

  useEffect(() => {
    // Only connect if the user is authenticated
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const isBrowser = typeof window !== 'undefined';
    const socketUrl = isBrowser
      ? `${window.location.protocol}//${window.location.hostname}:4000`
      : 'http://localhost:4000';

    const socketInstance = io(socketUrl, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to API server');
      setIsConnected(true);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket] Disconnected from API server');
      setIsConnected(false);
      setIsQueued(false);
    });

    socketInstance.on(SocketEvents.MATCHMAKING_MATCHED, (data: { matchId: string }) => {
      console.log('[Socket] Match found! matchId:', data.matchId);
      setMatchId(data.matchId);
      setIsQueued(false);
    });

    socketInstance.on(SocketEvents.MATCH_INIT, (data: MatchInitPayload) => {
      console.log('[Socket] Match initialized:', data);
      setGameState(data);
      setMatchId(data.matchId);
      setCountdown(null);
      setRoundData(null);
      setRoundEndData(null);
      setMatchEndData(null);
      setOpponentSubmittedScore(null);
    });

    socketInstance.on(SocketEvents.MATCH_COUNTDOWN, (data: { seconds: number }) => {
      setCountdown(data.seconds);
    });

    socketInstance.on(SocketEvents.ROUND_START, (data: RoundStartPayload) => {
      console.log('[Socket] Round start:', data);
      setRoundData(data);
      setRoundEndData(null);
      setCountdown(null);
    });

    socketInstance.on(SocketEvents.ROUND_OPPONENT_SUBMITTED, (data: { score: number }) => {
      setOpponentSubmittedScore(data.score);
    });

    socketInstance.on(SocketEvents.ROUND_END, (data: RoundEndPayload) => {
      console.log('[Socket] Round end:', data);
      setRoundEndData(data);
      if (data.scores) {
        setGameState((prev) => {
          if (!prev) return null;
          const oppId = prev.opponent.id;
          const myId = prev.player.id;
          return {
            ...prev,
            player: { ...prev.player, score: data.scores[myId] ?? prev.player.score },
            opponent: { ...prev.opponent, score: data.scores[oppId] ?? prev.opponent.score },
          };
        });
      }
    });

    socketInstance.on(SocketEvents.MATCH_END, (data: MatchEndPayload) => {
      console.log('[Socket] Match ended:', data);
      setMatchEndData(data);
      setRoundData(null);
      setRoundEndData(null);
    });

    socketInstance.on(SocketEvents.CHALLENGE_INVITED, (data: IncomingChallenge) => {
      console.log('[Socket] Received challenge invite:', data);
      setIncomingInvite(data);
    });

    socketInstance.on(SocketEvents.CHALLENGE_DECLINED, (data: { reason: string }) => {
      console.log('[Socket] Challenge invite was declined:', data.reason);
      alert(`Challenge invite declined. Reason: ${data.reason}`);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  const joinQueue = (subjectId?: string) => {
    if (socket && isConnected) {
      socket.emit(SocketEvents.MATCHMAKING_JOIN, { subjectId });
      setIsQueued(true);
    }
  };

  const leaveQueue = () => {
    if (socket && isConnected) {
      socket.emit(SocketEvents.MATCHMAKING_LEAVE);
      setIsQueued(false);
    }
  };

  const sendInvite = (inviteeId: string, courseId?: string) => {
    if (socket && isConnected) {
      socket.emit(SocketEvents.CHALLENGE_INVITE, { inviteeId, courseId });
    }
  };

  const acceptInvite = (challengeId: string) => {
    if (socket && isConnected) {
      socket.emit(SocketEvents.CHALLENGE_ACCEPT, { challengeId });
      setIncomingInvite(null);
    }
  };

  const declineInvite = (challengeId: string) => {
    if (socket && isConnected) {
      socket.emit(SocketEvents.CHALLENGE_DECLINE, { challengeId });
      setIncomingInvite(null);
    }
  };

  const submitAnswer = (roundIndex: number, selectedIndex: number, timeTakenMs: number) => {
    if (socket && isConnected && matchId) {
      socket.emit(SocketEvents.ROUND_SUBMIT, {
        matchId,
        roundIndex,
        selectedIndex,
        timeTakenMs,
      });
    }
  };

  const forfeitMatch = () => {
    if (socket && isConnected && matchId) {
      socket.emit(SocketEvents.MATCH_FORFEIT, { matchId });
      resetMatchState();
    }
  };

  const resetMatchState = () => {
    setMatchId(null);
    setGameState(null);
    setRoundData(null);
    setRoundEndData(null);
    setMatchEndData(null);
    setCountdown(null);
    setOpponentSubmittedScore(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        isQueued,
        matchId,
        countdown,
        gameState,
        roundData,
        roundEndData,
        matchEndData,
        opponentSubmittedScore,
        incomingInvite,
        joinQueue,
        leaveQueue,
        sendInvite,
        acceptInvite,
        declineInvite,
        submitAnswer,
        forfeitMatch,
        resetMatchState,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
