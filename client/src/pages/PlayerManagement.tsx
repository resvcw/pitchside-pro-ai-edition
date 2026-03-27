import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function PlayerManagement() {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerNumber, setNewPlayerNumber] = useState("");
  const [newPlayerPosition, setNewPlayerPosition] = useState("");
  const [newPlayerPhoto, setNewPlayerPhoto] = useState<string | null>(null);

  const { data: teams } = trpc.teams.list.useQuery();
  const { data: categories } = trpc.teamCategories.list.useQuery(
    { teamId: selectedTeamId || 0 },
    { enabled: !!selectedTeamId }
  );
  const { data: players, refetch: refetchPlayers } = trpc.players.list.useQuery(
    { teamId: selectedTeamId || 0, teamCategoryId: selectedCategoryId || 0 },
    { enabled: !!selectedTeamId && !!selectedCategoryId }
  );

  const createPlayerMutation = trpc.players.create.useMutation({
    onSuccess: () => {
      setNewPlayerName("");
      setNewPlayerNumber("");
      setNewPlayerPosition("");
      setNewPlayerPhoto(null);
      refetchPlayers();
      toast.success("選手を追加しました");
    },
    onError: () => toast.error("選手追加に失敗しました"),
  });

  const deletePlayerMutation = trpc.players.delete.useMutation({
    onSuccess: () => {
      refetchPlayers();
      toast.success("選手を削除しました");
    },
    onError: () => toast.error("選手削除に失敗しました"),
  });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setNewPlayerPhoto(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePlayer = () => {
    if (!selectedTeamId || !selectedCategoryId) {
      toast.error("チームとカテゴリを選択してください");
      return;
    }
    if (!newPlayerName.trim()) {
      toast.error("選手名を入力してください");
      return;
    }
    createPlayerMutation.mutate({
      teamId: selectedTeamId,
      teamCategoryId: selectedCategoryId,
      name: newPlayerName,
      number: newPlayerNumber ? parseInt(newPlayerNumber) : undefined,
      position: newPlayerPosition || undefined,
      photoUrl: newPlayerPhoto || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">選手管理</h1>
        <p className="text-muted-foreground mt-2">選手情報を登録・管理します</p>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">選手一覧</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>選手を追加</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="player-name">選手名</Label>
                    <Input
                      id="player-name"
                      placeholder="選手名"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="player-number">背番号</Label>
                    <Input
                      id="player-number"
                      type="number"
                      placeholder="10"
                      value={newPlayerNumber}
                      onChange={(e) => setNewPlayerNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="player-position">ポジション</Label>
                    <Input
                      id="player-position"
                      placeholder="FW"
                      value={newPlayerPosition}
                      onChange={(e) => setNewPlayerPosition(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="player-photo">写真</Label>
                    <Input
                      id="player-photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                    />
                    {newPlayerPhoto && (
                      <img src={newPlayerPhoto} alt="preview" className="mt-2 h-20 w-20 rounded" />
                    )}
                  </div>
                  <Button
                    onClick={handleCreatePlayer}
                    disabled={createPlayerMutation.isPending}
                  >
                    {createPlayerMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    追加
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {selectedCategoryId ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {players?.map((player) => (
                  <div key={player.id} className="p-3 border rounded flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{player.name}</p>
                      {player.number && (
                        <p className="text-sm text-muted-foreground">#{player.number}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePlayerMutation.mutate({ playerId: player.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
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
