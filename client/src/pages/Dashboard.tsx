import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Loader2, Plus } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: teams, isLoading } = trpc.teams.list.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ダッシュボード</h1>
          <p className="text-muted-foreground mt-2">
            {user?.name}さん、こんにちは
          </p>
        </div>
        <Button onClick={() => setLocation("/teams")}>
          <Plus className="mr-2 h-4 w-4" />
          新規チーム作成
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams?.map((team) => (
          <Card key={team.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{team.name}</CardTitle>
              <CardDescription>{team.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation(`/players?teamId=${team.id}`)}
                >
                  選手管理
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation(`/match/history?teamId=${team.id}`)}
                >
                  試合履歴
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!teams || teams.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              チームがまだ登録されていません。
              <Button variant="link" onClick={() => setLocation("/teams")}>
                チームを作成
              </Button>
              してください。
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
