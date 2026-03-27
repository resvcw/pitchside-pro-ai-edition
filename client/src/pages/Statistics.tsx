import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Statistics() {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const { data: teams } = trpc.teams.list.useQuery();
  const { data: categories } = trpc.teamCategories.list.useQuery(
    { teamId: selectedTeamId || 0 },
    { enabled: !!selectedTeamId }
  );
  const { data: teamStats, isLoading: statsLoading } = trpc.teamStats.get.useQuery(
    { teamId: selectedTeamId || 0, teamCategoryId: selectedCategoryId || 0 },
    { enabled: !!selectedTeamId && !!selectedCategoryId }
  );
  const { data: players } = trpc.players.list.useQuery(
    { teamId: selectedTeamId || 0, teamCategoryId: selectedCategoryId || 0 },
    { enabled: !!selectedTeamId && !!selectedCategoryId }
  );

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">統計情報</h1>
        <p className="text-muted-foreground mt-2">チームと選手の成績を確認できます</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">チーム選択</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {teams?.map((team) => (
                <Button
                  key={team.id}
                  variant={selectedTeamId === team.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedTeamId(team.id);
                    setSelectedCategoryId(null);
                  }}
                >
                  {team.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">カテゴリ選択</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTeamId ? (
              <div className="space-y-2">
                {categories?.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategoryId === cat.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategoryId(cat.id)}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">チームを選択してください</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">チーム成績</CardTitle>
            <CardDescription>
              {selectedCategoryId ? "選択したカテゴリの成績" : "カテゴリを選択してください"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCategoryId && teamStats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded">
                  <p className="text-sm text-muted-foreground">試合数</p>
                  <p className="text-2xl font-bold">{teamStats.totalMatches}</p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <p className="text-sm text-muted-foreground">勝利</p>
                  <p className="text-2xl font-bold text-green-600">{teamStats.wins}</p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <p className="text-sm text-muted-foreground">引き分け</p>
                  <p className="text-2xl font-bold text-yellow-600">{teamStats.draws}</p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <p className="text-sm text-muted-foreground">敗北</p>
                  <p className="text-2xl font-bold text-red-600">{teamStats.losses}</p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <p className="text-sm text-muted-foreground">得点</p>
                  <p className="text-2xl font-bold">{teamStats.goalsFor}</p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <p className="text-sm text-muted-foreground">失点</p>
                  <p className="text-2xl font-bold">{teamStats.goalsAgainst}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                カテゴリを選択してください
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedCategoryId && (
        <Card>
          <CardHeader>
            <CardTitle>選手一覧</CardTitle>
            <CardDescription>登録されている選手</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players?.map((player) => (
                <Card key={player.id} className="p-4">
                  <p className="font-semibold">{player.name}</p>
                  {player.number && (
                    <p className="text-sm text-muted-foreground">#{player.number}</p>
                  )}
                  {player.position && (
                    <p className="text-sm text-muted-foreground">{player.position}</p>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
