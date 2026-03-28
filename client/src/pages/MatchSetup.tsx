import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function MatchSetup() {
  const [, setLocation] = useLocation();
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<number | null>(null);
  const [additionalTime, setAdditionalTime] = useState(5);
  const [opponentName, setOpponentName] = useState("");
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: teams } = trpc.teams.list.useQuery();
  const { data: categories } = trpc.teamCategories.list.useQuery(
    { teamId: selectedTeam || 0 },
    { enabled: !!selectedTeam }
  );
  const { data: tournaments } = trpc.tournaments.list.useQuery();
  const createMatch = trpc.matches.create.useMutation();

  const handleStartMatch = async () => {
    if (!selectedTeam || !selectedCategory || !opponentName.trim()) {
      toast.error("チーム、カテゴリ、相手チーム名を入力してください");
      return;
    }

    try {
      const result = await createMatch.mutateAsync({
        teamId: selectedTeam,
        teamCategoryId: selectedCategory,
        tournamentId: selectedTournament || undefined,
        opponentName: opponentName.trim(),
        matchDate: new Date(matchDate),
        matchType: "friendly",
        venue: "",
      });

      toast.success("試合を開始しました");
      const matchId = ((result as any)?.id as number) || (Array.isArray(result) ? (result[0] as any)?.id : null);
      if (matchId) {
        setLocation(`/match/live/${matchId}`);
      }
    } catch (error) {
      toast.error("試合の開始に失敗しました");
      console.error(error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">試合設定</h1>
        <p className="text-muted-foreground mt-2">新しい試合を開始します</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
          <CardDescription>チームと試合の基本情報を入力してください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* チーム選択 */}
          <div className="space-y-2">
            <Label htmlFor="team">チーム名</Label>
            <Select value={selectedTeam?.toString() || ""} onValueChange={(val) => {
              setSelectedTeam(parseInt(val));
              setSelectedCategory(null);
            }}>
              <SelectTrigger id="team">
                <SelectValue placeholder="チームを選択" />
              </SelectTrigger>
              <SelectContent>
                {teams?.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* カテゴリ選択 */}
          {selectedTeam && (
            <div className="space-y-2">
              <Label htmlFor="category">カテゴリ</Label>
              <Select value={selectedCategory?.toString() || ""} onValueChange={(val) => setSelectedCategory(parseInt(val))}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 大会選択 */}
          <div className="space-y-2">
            <Label htmlFor="tournament">大会名（オプション）</Label>
            <Select value={selectedTournament?.toString() || ""} onValueChange={(val) => setSelectedTournament(val ? parseInt(val) : null)}>
              <SelectTrigger id="tournament">
                <SelectValue placeholder="大会を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">選択なし</SelectItem>
                {tournaments?.map((tournament) => (
                  <SelectItem key={tournament.id} value={tournament.id.toString()}>
                    {tournament.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 相手チーム名 */}
          <div className="space-y-2">
            <Label htmlFor="opponent">相手チーム名</Label>
            <Input
              id="opponent"
              placeholder="相手チーム名を入力"
              value={opponentName}
              onChange={(e) => setOpponentName(e.target.value)}
            />
          </div>

          {/* 試合日時 */}
          <div className="space-y-2">
            <Label htmlFor="date">試合日</Label>
            <Input
              id="date"
              type="date"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>アディショナルタイム設定</CardTitle>
          <CardDescription>想定されるアディショナルタイムを設定（試合中に変更可能）</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="at">アディショナルタイム（分）</Label>
            <div className="flex items-center gap-4">
              <Input
                id="at"
                type="number"
                min="0"
                max="10"
                value={additionalTime}
                onChange={(e) => setAdditionalTime(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">分</span>
            </div>
          </div>
          <div className="p-3 bg-muted rounded text-sm">
            <p>試合時間は <strong>45分×2</strong> に設定されます。</p>
            <p className="mt-1 text-muted-foreground">
              設定したアディショナルタイムは目安です。試合中に変更できます。
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          onClick={handleStartMatch}
          disabled={!selectedTeam || !selectedCategory || !opponentName.trim() || createMatch.isPending}
          className="flex-1"
        >
          {createMatch.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              開始中...
            </>
          ) : (
            "試合を開始"
          )}
        </Button>
        <Button variant="outline" onClick={() => setLocation("/dashboard")}>
          キャンセル
        </Button>
      </div>
    </div>
  );
}
