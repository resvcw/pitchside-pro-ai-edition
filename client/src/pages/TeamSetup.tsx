import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TeamSetup() {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  const { data: teams, isLoading: teamsLoading, refetch: refetchTeams } = trpc.teams.list.useQuery();
  const { data: categories, refetch: refetchCategories } = trpc.teamCategories.list.useQuery(
    { teamId: selectedTeamId || 0 },
    { enabled: !!selectedTeamId }
  );

  const createTeamMutation = trpc.teams.create.useMutation({
    onSuccess: () => {
      setNewTeamName("");
      setNewTeamDesc("");
      refetchTeams();
      toast.success("チームを作成しました");
    },
    onError: () => toast.error("チーム作成に失敗しました"),
  });

  const createCategoryMutation = trpc.teamCategories.create.useMutation({
    onSuccess: () => {
      setNewCategoryName("");
      refetchCategories();
      toast.success("カテゴリを作成しました");
    },
    onError: () => toast.error("カテゴリ作成に失敗しました"),
  });

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) {
      toast.error("チーム名を入力してください");
      return;
    }
    createTeamMutation.mutate({
      name: newTeamName,
      description: newTeamDesc || undefined,
    });
  };

  const handleCreateCategory = () => {
    if (!selectedTeamId) {
      toast.error("チームを選択してください");
      return;
    }
    if (!newCategoryName.trim()) {
      toast.error("カテゴリ名を入力してください");
      return;
    }
    createCategoryMutation.mutate({
      teamId: selectedTeamId,
      name: newCategoryName,
    });
  };

  if (teamsLoading) {
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
          <h1 className="text-3xl font-bold">チーム管理</h1>
          <p className="text-muted-foreground mt-2">チームとカテゴリを管理します</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規チーム作成
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新規チーム作成</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="team-name">チーム名</Label>
                <Input
                  id="team-name"
                  placeholder="例：たこFC"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="team-desc">説明</Label>
                <Textarea
                  id="team-desc"
                  placeholder="チームの説明"
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                />
              </div>
              <Button
                onClick={handleCreateTeam}
                disabled={createTeamMutation.isPending}
              >
                {createTeamMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                作成
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>チーム一覧</CardTitle>
            <CardDescription>登録されているチーム</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {teams?.map((team) => (
                <div
                  key={team.id}
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedTeamId === team.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedTeamId(team.id)}
                >
                  <p className="font-semibold">{team.name}</p>
                  {team.description && (
                    <p className="text-sm opacity-75">{team.description}</p>
                  )}
                </div>
              ))}
              {!teams || teams.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  チームがまだ登録されていません
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>カテゴリ管理</CardTitle>
            <CardDescription>
              {selectedTeamId ? "選択したチームのカテゴリ" : "チームを選択してください"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedTeamId ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  {categories?.map((cat) => (
                    <div key={cat.id} className="p-3 border rounded">
                      <p className="font-semibold">{cat.name}</p>
                      {cat.description && (
                        <p className="text-sm text-muted-foreground">{cat.description}</p>
                      )}
                    </div>
                  ))}
                  {!categories || categories.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      カテゴリがまだ登録されていません
                    </p>
                  )}
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      カテゴリ追加
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>カテゴリを追加</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="category-name">カテゴリ名</Label>
                        <Input
                          id="category-name"
                          placeholder="例：Aチーム"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={handleCreateCategory}
                        disabled={createCategoryMutation.isPending}
                      >
                        {createCategoryMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        追加
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                左側からチームを選択してください
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
