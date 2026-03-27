import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

interface MatchLiveProps {
  matchId: number;
}

export default function MatchLive({ matchId }: MatchLiveProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [additionalTime, setAdditionalTime] = useState(0);

  const { data: match } = trpc.matches.get.useQuery({ matchId });
  const { data: events, refetch: refetchEvents } = trpc.matchEvents.list.useQuery({ matchId });
  const updateMatchMutation = trpc.matches.update.useMutation();
  const createEventMutation = trpc.matchEvents.create.useMutation({
    onSuccess: () => {
      refetchEvents();
      toast.success("イベントを記録しました");
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartMatch = () => {
    setElapsedTime(0);
    setIsRunning(true);
    updateMatchMutation.mutate({ matchId, status: "live" });
  };

  const handleEndMatch = () => {
    setIsRunning(false);
    updateMatchMutation.mutate({
      matchId,
      status: "completed",
      additionalTime,
    });
    toast.success("試合を終了しました");
  };

  const handleAddGoal = (isHome: boolean) => {
    createEventMutation.mutate({
      matchId,
      eventType: "goal",
      minute: Math.floor(elapsedTime / 60),
      additionalMinute: additionalTime,
      isHomeTeam: isHome,
    });
    if (isHome) {
      updateMatchMutation.mutate({
        matchId,
        homeTeamScore: (match?.homeTeamScore || 0) + 1,
      });
    } else {
      updateMatchMutation.mutate({
        matchId,
        awayTeamScore: (match?.awayTeamScore || 0) + 1,
      });
    }
  };

  if (!match) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold">{match.opponentName}</h1>
          <p className="text-slate-300 mt-2">vs 自チーム</p>
        </div>

        {/* Scoreboard */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-slate-400 text-sm mb-2">自チーム</p>
                <p className="text-6xl font-bold text-white">{match.homeTeamScore || 0}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">時間</p>
                <p className="text-4xl font-bold text-cyan-400">{formatTime(elapsedTime)}</p>
                {additionalTime > 0 && (
                  <p className="text-xl text-yellow-400 mt-2">+{additionalTime}</p>
                )}
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">相手チーム</p>
                <p className="text-6xl font-bold text-white">{match.awayTeamScore || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {!isRunning ? (
            <Button
              onClick={handleStartMatch}
              className="col-span-2 bg-green-600 hover:bg-green-700 text-white text-lg py-6"
            >
              キックオフ
            </Button>
          ) : (
            <Button
              onClick={handleEndMatch}
              className="col-span-2 bg-red-600 hover:bg-red-700 text-white text-lg py-6"
            >
              試合終了
            </Button>
          )}
          <Button
            onClick={() => handleAddGoal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            自チーム得点
          </Button>
          <Button
            onClick={() => handleAddGoal(false)}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            失点
          </Button>
        </div>

        {/* Additional Time Control */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">アディショナルタイム</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => setAdditionalTime(Math.max(0, additionalTime - 1))}
                variant="outline"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-2xl font-bold text-white w-16 text-center">
                {additionalTime}分
              </span>
              <Button
                onClick={() => setAdditionalTime(additionalTime + 1)}
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Event Log */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">イベントログ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {events?.map((event) => (
                <div key={event.id} className="p-2 bg-slate-700 rounded text-white text-sm">
                  <span className="font-semibold">{event.minute}分</span>
                  {event.additionalMinute && event.additionalMinute > 0 && (
                    <span className="ml-2 text-yellow-400">+{event.additionalMinute}</span>
                  )}
                  {": "}
                  <span>{event.eventType}</span>
                  {event.playerName && <span> - {event.playerName}</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
