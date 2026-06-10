import { Server, Socket } from 'socket.io';
import { prisma } from '@sololearning/db';
import { SocketEvents, RoundSubmitPayload } from '@sololearning/socket-contracts';
import { calculateRoundScore, GAME_CONSTANTS, verifyAnswer } from '@sololearning/game-engine';

interface PlayerState {
  userId: string;
  socketId: string;
  username: string;
  avatar: string | null;
  score: number;
  answers: (number | null)[];
  timeTaken: (number | null)[];
}

interface MatchState {
  matchId: string;
  player1: PlayerState;
  player2: PlayerState;
  questions: {
    id: string;
    question: string;
    options: string[];
    answer: number;
  }[];
  roundIndex: number;
  roundStartTime: number;
  roundTimer: NodeJS.Timeout | null;
  isFinished: boolean;
  disconnectTimeout: {
    [userId: string]: NodeJS.Timeout | null;
  };
}

interface MatchmakingUser {
  userId: string;
  socketId: string;
  subjectId?: string;
}

const DEFAULT_QUESTIONS = [
  {
    id: 'def-1',
    question: 'What is the output of print(2 ** 3) in Python?',
    options: ['6', '8', '9', '5'],
    answer: 1,
  },
  {
    id: 'def-2',
    question: 'Which data type is mutable in Python?',
    options: ['Tuple', 'String', 'List', 'Integer'],
    answer: 2,
  },
  {
    id: 'def-3',
    question: 'What keyword is used to define a function in JavaScript?',
    options: ['def', 'function', 'func', 'define'],
    answer: 1,
  },
  {
    id: 'def-4',
    question: 'Which of the following is NOT a JavaScript framework/library?',
    options: ['React', 'Angular', 'Django', 'Vue'],
    answer: 2,
  },
  {
    id: 'def-5',
    question: 'What is the default port for PostgreSQL?',
    options: ['3306', '27017', '6379', '5432'],
    answer: 3,
  },
];

class PvPManager {
  private activeMatches = new Map<string, MatchState>();
  private matchmakingQueue: MatchmakingUser[] = [];

  // Track open challenges: challengeId -> details
  private pendingChallenges = new Map<
    string,
    {
      challengeId: string;
      inviterId: string;
      inviteeId: string;
      inviterUsername: string;
      courseId?: string;
      createdAt: number;
    }
  >();

  // Socket setup interface
  public handleConnection(socket: Socket, io: Server) {
    const userId = socket.data.userId;
    if (!userId) return;

    // Reconnection handling: check if user is in an active match
    const existingMatch = this.findMatchByUserId(userId);
    if (existingMatch) {
      console.log(`[PVP] User ${userId} reconnected to active match ${existingMatch.matchId}`);

      // Update socket ID for the player who reconnected
      const isP1 = existingMatch.player1.userId === userId;
      if (isP1) {
        existingMatch.player1.socketId = socket.id;
      } else {
        existingMatch.player2.socketId = socket.id;
      }

      // Join the socket room again
      socket.join(`match:${existingMatch.matchId}`);

      // Clear any disconnect timeout
      if (existingMatch.disconnectTimeout[userId]) {
        clearTimeout(existingMatch.disconnectTimeout[userId]!);
        existingMatch.disconnectTimeout[userId] = null;
      }

      // Send current match state info to reconnected player
      const opponent = isP1 ? existingMatch.player2 : existingMatch.player1;
      const player = isP1 ? existingMatch.player1 : existingMatch.player2;

      socket.emit(SocketEvents.MATCH_INIT, {
        matchId: existingMatch.matchId,
        opponent: {
          id: opponent.userId,
          username: opponent.username,
          avatar: opponent.avatar,
          score: opponent.score,
        },
        player: {
          id: player.userId,
          username: player.username,
          avatar: player.avatar,
          score: player.score,
        },
        questionsCount: existingMatch.questions.length,
      });

      // Resume round details
      if (!existingMatch.isFinished) {
        const currentQuestion = existingMatch.questions[existingMatch.roundIndex];
        const elapsedSec = Math.floor((Date.now() - existingMatch.roundStartTime) / 1000);
        const remainingTime = Math.max(0, GAME_CONSTANTS.LIMIT_TIME_SEC - elapsedSec);

        socket.emit(SocketEvents.ROUND_START, {
          roundIndex: existingMatch.roundIndex,
          question: currentQuestion.question,
          options: currentQuestion.options,
          limitTime: remainingTime,
        });
      }
    }

    // Matchmaking events
    socket.on(SocketEvents.MATCHMAKING_JOIN, async (data: { subjectId?: string }) => {
      await this.addToQueue(userId, socket.id, data?.subjectId, io);
    });

    socket.on(SocketEvents.MATCHMAKING_LEAVE, () => {
      this.removeFromQueue(userId);
    });

    // Direct Challenge events
    socket.on(
      SocketEvents.CHALLENGE_INVITE,
      async (data: { inviteeId: string; courseId?: string }) => {
        const inviter = await prisma.user.findUnique({ where: { id: userId } });
        const invitee = await prisma.user.findUnique({ where: { id: data.inviteeId } });

        if (!inviter || !invitee) {
          socket.emit('challenge:error', { message: 'User not found' });
          return;
        }

        const challengeId = `chall:${userId}-${data.inviteeId}-${Date.now()}`;
        this.pendingChallenges.set(challengeId, {
          challengeId,
          inviterId: userId,
          inviteeId: data.inviteeId,
          inviterUsername: inviter.username,
          courseId: data.courseId,
          createdAt: Date.now(),
        });

        // Emit to invitee if online
        const inviteeSockets = this.getUserSockets(data.inviteeId, io);
        if (inviteeSockets.length > 0) {
          io.to(inviteeSockets).emit(SocketEvents.CHALLENGE_INVITED, {
            challengeId,
            inviter: {
              id: inviter.id,
              username: inviter.username,
              avatar: inviter.avatar,
            },
            courseId: data.courseId,
          });
        } else {
          socket.emit(SocketEvents.CHALLENGE_DECLINED, { reason: 'User is offline' });
          this.pendingChallenges.delete(challengeId);
        }
      },
    );

    socket.on(SocketEvents.CHALLENGE_ACCEPT, async (data: { challengeId: string }) => {
      const challenge = this.pendingChallenges.get(data.challengeId);
      if (!challenge) {
        socket.emit('challenge:error', { message: 'Challenge expired or not found' });
        return;
      }

      this.pendingChallenges.delete(data.challengeId);

      const inviterSockets = this.getUserSockets(challenge.inviterId, io);
      if (inviterSockets.length === 0) {
        socket.emit('challenge:error', { message: 'Challenger went offline' });
        return;
      }

      // Start the match!
      await this.startMatch(
        challenge.inviterId,
        inviterSockets[0],
        challenge.inviteeId,
        socket.id,
        challenge.courseId,
        io,
      );
    });

    socket.on(SocketEvents.CHALLENGE_DECLINE, (data: { challengeId: string }) => {
      const challenge = this.pendingChallenges.get(data.challengeId);
      if (challenge) {
        this.pendingChallenges.delete(data.challengeId);
        const inviterSockets = this.getUserSockets(challenge.inviterId, io);
        if (inviterSockets.length > 0) {
          io.to(inviterSockets).emit(SocketEvents.CHALLENGE_DECLINED, { reason: 'declined' });
        }
      }
    });

    // Game play events
    socket.on(SocketEvents.ROUND_SUBMIT, (data: RoundSubmitPayload) => {
      this.handleRoundSubmit(userId, data, io);
    });

    socket.on(SocketEvents.MATCH_FORFEIT, (data: { matchId: string }) => {
      this.handleForfeit(data.matchId, userId, io);
    });
  }

  public handleDisconnect(socket: Socket, io: Server) {
    const userId = socket.data.userId;
    if (!userId) return;

    this.removeFromQueue(userId);

    const activeMatch = this.findMatchByUserId(userId);
    if (activeMatch && !activeMatch.isFinished) {
      console.log(
        `[PVP] User ${userId} disconnected from match ${activeMatch.matchId}. Starting forfeit grace period.`,
      );

      // Set a 10s grace period for reconnection
      activeMatch.disconnectTimeout[userId] = setTimeout(() => {
        if (!activeMatch.isFinished) {
          console.log(`[PVP] User ${userId} failed to reconnect in time. Declaring forfeit.`);
          this.handleForfeit(activeMatch.matchId, userId, io);
        }
      }, 10000);
    }
  }

  // --- Helper Methods ---

  private getUserSockets(userId: string, io: Server): string[] {
    const sockets = io.sockets.adapter.rooms.get(userId);
    // Alternatively, check our onlineUsers map
    // We can also query all connected sockets to see which has user data
    const list: string[] = [];
    io.sockets.sockets.forEach((s) => {
      if (s.data.userId === userId) {
        list.push(s.id);
      }
    });
    return list;
  }

  private findMatchByUserId(userId: string): MatchState | undefined {
    for (const match of this.activeMatches.values()) {
      if (match.player1.userId === userId || match.player2.userId === userId) {
        return match;
      }
    }
    return undefined;
  }

  private async addToQueue(
    userId: string,
    socketId: string,
    subjectId: string | undefined,
    io: Server,
  ) {
    // Check if already in queue
    if (this.matchmakingQueue.some((u) => u.userId === userId)) {
      return;
    }

    // Check if user has an active match running. If so, don't allow joining matchmaking queue
    if (this.findMatchByUserId(userId)) {
      return;
    }

    console.log(`[PVP] User ${userId} joined matchmaking queue`);

    // Look for matching user (either subject specific or global fallback)
    const matchIndex = this.matchmakingQueue.findIndex(
      (u) => u.userId !== userId && (!subjectId || !u.subjectId || u.subjectId === subjectId),
    );

    if (matchIndex !== -1) {
      // Found a match!
      const opponent = this.matchmakingQueue[matchIndex];
      this.matchmakingQueue.splice(matchIndex, 1);

      console.log(`[PVP] Match found between ${userId} and ${opponent.userId}`);
      await this.startMatch(userId, socketId, opponent.userId, opponent.socketId, subjectId, io);
    } else {
      // Put in queue
      this.matchmakingQueue.push({ userId, socketId, subjectId });
    }
  }

  private removeFromQueue(userId: string) {
    const index = this.matchmakingQueue.findIndex((u) => u.userId === userId);
    if (index !== -1) {
      this.matchmakingQueue.splice(index, 1);
      console.log(`[PVP] User ${userId} left matchmaking queue`);
    }
  }

  private async startMatch(
    p1Id: string,
    p1SocketId: string,
    p2Id: string,
    p2SocketId: string,
    courseOrSubjectId: string | undefined,
    io: Server,
  ) {
    const matchId = `match:${p1Id}-${p2Id}-${Date.now()}`;

    // Fetch user info from database
    const user1 = await prisma.user.findUnique({ where: { id: p1Id } });
    const user2 = await prisma.user.findUnique({ where: { id: p2Id } });

    if (!user1 || !user2) {
      console.error(`[PVP] Error starting match: One of the users could not be found.`);
      return;
    }

    // Load questions dynamically from the database
    let questions = await this.fetchQuestions(courseOrSubjectId);
    if (questions.length < GAME_CONSTANTS.QUESTIONS_COUNT) {
      questions = DEFAULT_QUESTIONS;
    }

    const matchState: MatchState = {
      matchId,
      player1: {
        userId: p1Id,
        socketId: p1SocketId,
        username: user1.username,
        avatar: user1.avatar,
        score: 0,
        answers: new Array(questions.length).fill(null),
        timeTaken: new Array(questions.length).fill(null),
      },
      player2: {
        userId: p2Id,
        socketId: p2SocketId,
        username: user2.username,
        avatar: user2.avatar,
        score: 0,
        answers: new Array(questions.length).fill(null),
        timeTaken: new Array(questions.length).fill(null),
      },
      questions,
      roundIndex: 0,
      roundStartTime: 0,
      roundTimer: null,
      isFinished: false,
      disconnectTimeout: {
        [p1Id]: null,
        [p2Id]: null,
      },
    };

    this.activeMatches.set(matchId, matchState);

    // Join room
    const s1 = io.sockets.sockets.get(p1SocketId);
    const s2 = io.sockets.sockets.get(p2SocketId);
    if (s1) s1.join(`match:${matchId}`);
    if (s2) s2.join(`match:${matchId}`);

    // Notify matching details to players
    io.to(`match:${matchId}`).emit(SocketEvents.MATCHMAKING_MATCHED, { matchId });

    // Initialize match details
    s1?.emit(SocketEvents.MATCH_INIT, {
      matchId,
      player: { id: p1Id, username: user1.username, avatar: user1.avatar, score: 0 },
      opponent: { id: p2Id, username: user2.username, avatar: user2.avatar, score: 0 },
      questionsCount: questions.length,
    });

    s2?.emit(SocketEvents.MATCH_INIT, {
      matchId,
      player: { id: p2Id, username: user2.username, avatar: user2.avatar, score: 0 },
      opponent: { id: p1Id, username: user1.username, avatar: user1.avatar, score: 0 },
      questionsCount: questions.length,
    });

    // Start 5 second countdown before round 1
    let countdown = 5;
    const countdownInterval = setInterval(() => {
      io.to(`match:${matchId}`).emit(SocketEvents.MATCH_COUNTDOWN, { seconds: countdown });
      countdown--;

      if (countdown < 0) {
        clearInterval(countdownInterval);
        this.startRound(matchId, io);
      }
    }, 1000);
  }

  private async fetchQuestions(courseOrSubjectId?: string) {
    try {
      // Try to find topics associated with the course or subject
      const whereClause = courseOrSubjectId
        ? {
            chapter: {
              courseId: courseOrSubjectId,
            },
          }
        : {};

      const topics = await prisma.topic.findMany({
        where: whereClause,
        take: 10,
        select: {
          id: true,
          content: true,
        },
      });

      const mcqList: { id: string; question: string; options: string[]; answer: number }[] = [];

      for (const topic of topics) {
        const content = topic.content as any;
        if (Array.isArray(content)) {
          for (const step of content) {
            if (
              step.type === 'mcq' &&
              step.question &&
              Array.isArray(step.options) &&
              typeof step.answer === 'number'
            ) {
              mcqList.push({
                id: `${topic.id}-${mcqList.length}`,
                question: step.question,
                options: step.options,
                answer: step.answer,
              });
            }
          }
        }
      }

      // Shuffle and pick 5
      return mcqList.sort(() => 0.5 - Math.random()).slice(0, GAME_CONSTANTS.QUESTIONS_COUNT);
    } catch (error) {
      console.error('[PVP] Error loading questions from DB:', error);
      return [];
    }
  }

  private startRound(matchId: string, io: Server) {
    const match = this.activeMatches.get(matchId);
    if (!match || match.isFinished) return;

    const currentQuestion = match.questions[match.roundIndex];
    match.roundStartTime = Date.now();

    // Reset current round player submits if any reconnect happens
    io.to(`match:${matchId}`).emit(SocketEvents.ROUND_START, {
      roundIndex: match.roundIndex,
      question: currentQuestion.question,
      options: currentQuestion.options,
      limitTime: GAME_CONSTANTS.LIMIT_TIME_SEC,
    });

    // Start server timer (authoritative limit)
    match.roundTimer = setTimeout(
      () => {
        this.endRound(matchId, io);
      },
      GAME_CONSTANTS.LIMIT_TIME_SEC * 1000 + 500,
    ); // 500ms safety buffer
  }

  private handleRoundSubmit(userId: string, payload: RoundSubmitPayload, io: Server) {
    const match = this.activeMatches.get(payload.matchId);
    if (!match || match.isFinished) return;

    // Anti-cheat: verify round index match
    if (match.roundIndex !== payload.roundIndex) {
      return;
    }

    const player = match.player1.userId === userId ? match.player1 : match.player2;
    const opponent = match.player1.userId === userId ? match.player2 : match.player1;

    // Check if player has already submitted for this round
    if (player.answers[match.roundIndex] !== null) {
      return;
    }

    // Verify time limit safety boundary (anti-cheat)
    const serverTimeElapsed = Date.now() - match.roundStartTime;
    if (serverTimeElapsed > GAME_CONSTANTS.LIMIT_TIME_SEC * 1000 + 2000) {
      // Answer submitted too late
      player.answers[match.roundIndex] = -1; // Timeout code
      player.timeTaken[match.roundIndex] = serverTimeElapsed;
    } else {
      // Record answer
      player.answers[match.roundIndex] = payload.selectedIndex;
      player.timeTaken[match.roundIndex] = payload.timeTakenMs;

      // Score calculation
      const currentQuestion = match.questions[match.roundIndex];
      const isCorrect = verifyAnswer(payload.selectedIndex, currentQuestion.answer);
      const points = calculateRoundScore(
        isCorrect,
        payload.timeTakenMs,
        GAME_CONSTANTS.LIMIT_TIME_SEC,
      );

      player.score += points;
    }

    // Notify opponent of real-time submission progress bar updating
    const oppSockets = this.getUserSockets(opponent.userId, io);
    if (oppSockets.length > 0) {
      io.to(oppSockets).emit(SocketEvents.ROUND_OPPONENT_SUBMITTED, {
        score: player.score,
      });
    }

    // If both players have submitted, end round immediately
    if (
      match.player1.answers[match.roundIndex] !== null &&
      match.player2.answers[match.roundIndex] !== null
    ) {
      if (match.roundTimer) {
        clearTimeout(match.roundTimer);
      }
      this.endRound(payload.matchId, io);
    }
  }

  private endRound(matchId: string, io: Server) {
    const match = this.activeMatches.get(matchId);
    if (!match || match.isFinished) return;

    // Finalize missing submissions as timeout
    if (match.player1.answers[match.roundIndex] === null) {
      match.player1.answers[match.roundIndex] = -1;
      match.player1.timeTaken[match.roundIndex] = GAME_CONSTANTS.LIMIT_TIME_SEC * 1000;
    }
    if (match.player2.answers[match.roundIndex] === null) {
      match.player2.answers[match.roundIndex] = -1;
      match.player2.timeTaken[match.roundIndex] = GAME_CONSTANTS.LIMIT_TIME_SEC * 1000;
    }

    const currentQuestion = match.questions[match.roundIndex];

    io.to(`match:${matchId}`).emit(SocketEvents.ROUND_END, {
      roundIndex: match.roundIndex,
      correctIndex: currentQuestion.answer,
      scores: {
        [match.player1.userId]: match.player1.score,
        [match.player2.userId]: match.player2.score,
      },
      answers: {
        [match.player1.userId]: match.player1.answers[match.roundIndex]!,
        [match.player2.userId]: match.player2.answers[match.roundIndex]!,
      },
    });

    match.roundIndex++;

    if (match.roundIndex < match.questions.length) {
      // Schedule next round after a 3 second delay to let client render animations
      setTimeout(() => {
        this.startRound(matchId, io);
      }, 3500);
    } else {
      // Game set match!
      this.finishMatch(matchId, io);
    }
  }

  private async finishMatch(matchId: string, io: Server) {
    const match = this.activeMatches.get(matchId);
    if (!match || match.isFinished) return;

    match.isFinished = true;

    // Determine Winner
    let winnerId: string | null = null;
    let loserId: string | null = null;
    let isDraw = false;

    if (match.player1.score > match.player2.score) {
      winnerId = match.player1.userId;
      loserId = match.player2.userId;
    } else if (match.player2.score > match.player1.score) {
      winnerId = match.player2.userId;
      loserId = match.player1.userId;
    } else {
      isDraw = true;
    }

    const xpEarned: { [userId: string]: number } = {};

    if (isDraw) {
      xpEarned[match.player1.userId] = GAME_CONSTANTS.XP_DRAW;
      xpEarned[match.player2.userId] = GAME_CONSTANTS.XP_DRAW;
    } else {
      xpEarned[winnerId!] = GAME_CONSTANTS.XP_WIN;
      xpEarned[loserId!] = GAME_CONSTANTS.XP_LOSE;
    }

    // Award XP in DB
    await this.awardXp(match.player1.userId, xpEarned[match.player1.userId]);
    await this.awardXp(match.player2.userId, xpEarned[match.player2.userId]);

    // Create Feed Activities
    if (isDraw) {
      await prisma.activity.create({
        data: {
          userId: match.player1.userId,
          type: 'CHALLENGE_COMPLETED',
          content: `Drew a PvP Challenge against ${match.player2.username}!`,
          metadata: { opponentUsername: match.player2.username, score: match.player1.score },
        },
      });
      await prisma.activity.create({
        data: {
          userId: match.player2.userId,
          type: 'CHALLENGE_COMPLETED',
          content: `Drew a PvP Challenge against ${match.player1.username}!`,
          metadata: { opponentUsername: match.player1.username, score: match.player2.score },
        },
      });
    } else {
      const winnerName =
        winnerId === match.player1.userId ? match.player1.username : match.player2.username;
      const loserName =
        winnerId === match.player1.userId ? match.player2.username : match.player1.username;

      await prisma.activity.create({
        data: {
          userId: winnerId!,
          type: 'CHALLENGE_COMPLETED',
          content: `Won a PvP Challenge against ${loserName}! 🏆`,
          metadata: {
            opponentUsername: loserName,
            won: true,
            score: Math.max(match.player1.score, match.player2.score),
          },
        },
      });
      await prisma.activity.create({
        data: {
          userId: loserId!,
          type: 'CHALLENGE_COMPLETED',
          content: `Completed a PvP Challenge against ${winnerName}.`,
          metadata: {
            opponentUsername: winnerName,
            won: false,
            score: Math.min(match.player1.score, match.player2.score),
          },
        },
      });
    }

    // Emit match:end
    io.to(`match:${matchId}`).emit(SocketEvents.MATCH_END, {
      matchId,
      winnerId,
      finalScores: {
        [match.player1.userId]: match.player1.score,
        [match.player2.userId]: match.player2.score,
      },
      xpEarned,
    });

    // Cleanup active sockets room membership
    const s1 = io.sockets.sockets.get(match.player1.socketId);
    const s2 = io.sockets.sockets.get(match.player2.socketId);
    s1?.leave(`match:${matchId}`);
    s2?.leave(`match:${matchId}`);

    this.activeMatches.delete(matchId);
  }

  private async handleForfeit(matchId: string, forfeitedUserId: string, io: Server) {
    const match = this.activeMatches.get(matchId);
    if (!match || match.isFinished) return;

    match.isFinished = true;

    // Clear timers
    if (match.roundTimer) clearTimeout(match.roundTimer);
    if (match.disconnectTimeout[match.player1.userId])
      clearTimeout(match.disconnectTimeout[match.player1.userId]!);
    if (match.disconnectTimeout[match.player2.userId])
      clearTimeout(match.disconnectTimeout[match.player2.userId]!);

    const winnerId =
      match.player1.userId === forfeitedUserId ? match.player2.userId : match.player1.userId;
    const winnerUsername =
      match.player1.userId === winnerId ? match.player1.username : match.player2.username;
    const loserUsername =
      match.player1.userId === forfeitedUserId ? match.player1.username : match.player2.username;

    const xpEarned = {
      [winnerId]: GAME_CONSTANTS.XP_WIN,
      [forfeitedUserId]: 0,
    };

    await this.awardXp(winnerId, GAME_CONSTANTS.XP_WIN);

    await prisma.activity.create({
      data: {
        userId: winnerId,
        type: 'CHALLENGE_COMPLETED',
        content: `Won a PvP Challenge by forfeit against ${loserUsername}! 🏆`,
        metadata: { opponentUsername: loserUsername, won: true, forfeited: true },
      },
    });

    // Emit match:forfeit
    io.to(`match:${matchId}`).emit(SocketEvents.MATCH_END, {
      matchId,
      winnerId,
      finalScores: {
        [match.player1.userId]: match.player1.score,
        [match.player2.userId]: match.player2.score,
      },
      xpEarned,
      forfeited: true,
    });

    // Cleanup active sockets room membership
    const s1 = io.sockets.sockets.get(match.player1.socketId);
    const s2 = io.sockets.sockets.get(match.player2.socketId);
    s1?.leave(`match:${matchId}`);
    s2?.leave(`match:${matchId}`);

    this.activeMatches.delete(matchId);
  }

  private async awardXp(userId: string, xpGained: number) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return;

      const newXp = user.xp + xpGained;
      let newRank = user.rank;

      // Rank thresholds matching courses.ts
      if (newXp >= 3000) newRank = 'Gold';
      else if (newXp >= 1500) newRank = 'Silver';
      else if (newXp >= 500) newRank = 'Bronze';
      else newRank = 'Newbie';

      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: newXp,
          rank: newRank,
        },
      });

      if (newRank !== user.rank) {
        await prisma.activity.create({
          data: {
            userId,
            type: 'RANK_UP',
            content: `Reached rank ${newRank}!`,
            metadata: { newRank },
          },
        });
      }
    } catch (err) {
      console.error(`[PVP] Error updating XP for user ${userId}:`, err);
    }
  }
}

export const pvpManager = new PvPManager();
