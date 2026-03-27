import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function MatchHistory() {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const { data: teams } = trpc.teams.list.useQuery();
  const { data: categories } = trpc.teamCategories.list.useQuery(
    { teamId: selectedTeamId || 0 },
    { enabled: !!selectedTeamId }
  );
  const { data: matches, isLoading } = trpc.matches.list.useQuery(
    { teamId: selectedTeamId || 0, teamCategoryId: selectedCategoryId || 0 },
    { enabled: !!selectedTeamId && !!selectedCategoryId }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">試合レポート</h1>
        <p className="text-muted-foreground mt-2">過去の試合結果を確認・編集できます</p>
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
            <CardTitle className="text-lg">試合一覧</CardTitle>
            <CardDescription>
              {selectedCategoryId ? "選択したカテゴリの試合" : "カテゴリを選択してください"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCategoryId ? (
              <div className="space-y-3">
                {matches?.map((match) => (
                  <Card key={match.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold">{match.opponentName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(match.matchDate).toLocaleDateString("ja-JP")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {match.homeTeamScore} - {match.awayTeamScore}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {match.status === "completed" ? "終了" : "予定"}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
                {!matches || matches.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    試合がまだ記録されていません
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                カテゴリを選択してください
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
