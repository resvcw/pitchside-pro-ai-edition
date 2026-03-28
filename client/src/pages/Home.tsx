import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { BarChart3, Zap, Users, FileText, ArrowRight } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* ヘッダー */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚽</span>
            </div>
            <h1 className="text-xl font-bold text-white">PitchSide Pro AI</h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-300 hover:text-white transition">
              機能
            </a>
            <a href="#benefits" className="text-slate-300 hover:text-white transition">
              メリット
            </a>
            <Button
              onClick={handleGetStarted}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {isAuthenticated ? "ダッシュボード" : "ログイン"}
            </Button>
          </nav>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="container max-w-6xl mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                サッカー試合を<br />
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  スマートに記録
                </span>
              </h2>
              <p className="text-lg text-slate-300">
                リアルタイムイベント記録、AI戦評分析、プロフェッショナルなレポート出力。
                コーチの試合分析を次のレベルへ。
              </p>
            </div>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 w-fit"
            >
              今すぐ始める
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-2xl blur-3xl"></div>
            <div className="relative bg-slate-800 rounded-2xl border border-slate-700 p-8 space-y-4">
              <div className="h-8 bg-slate-700 rounded w-3/4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-5/6"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="h-12 bg-slate-700 rounded"></div>
                <div className="h-12 bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 機能セクション */}
      <section id="features" className="container max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white mb-4">主な機能</h3>
          <p className="text-slate-300 text-lg">
            コーチの試合分析を支援する、包括的な機能セット
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 機能1 */}
          <Card className="bg-slate-800 border-slate-700 hover:border-emerald-500/50 transition">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-emerald-400" />
              </div>
              <CardTitle className="text-white">リアルタイム記録</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400">
                得点、カード、交代を試合中にリアルタイムで記録
              </CardDescription>
            </CardContent>
          </Card>

          {/* 機能2 */}
          <Card className="bg-slate-800 border-slate-700 hover:border-emerald-500/50 transition">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-cyan-400" />
              </div>
              <CardTitle className="text-white">統計分析</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400">
                チーム成績と選手個人成績を自動集計
              </CardDescription>
            </CardContent>
          </Card>

          {/* 機能3 */}
          <Card className="bg-slate-800 border-slate-700 hover:border-emerald-500/50 transition">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">選手管理</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400">
                選手情報と写真を一元管理
              </CardDescription>
            </CardContent>
          </Card>

          {/* 機能4 */}
          <Card className="bg-slate-800 border-slate-700 hover:border-emerald-500/50 transition">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-orange-400" />
              </div>
              <CardTitle className="text-white">AI戦評</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400">
                AIが試合を分析し、戦評を自動生成
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* メリットセクション */}
      <section id="benefits" className="container max-w-6xl mx-auto px-4 py-20 bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">なぜPitchSide Pro AIか</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="text-2xl font-bold text-emerald-400">⚡</div>
            <h4 className="text-lg font-semibold text-white">迅速な記録</h4>
            <p className="text-slate-400">
              試合中の操作を最小限に。直感的なUIで素早くイベントを記録
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-2xl font-bold text-cyan-400">📊</div>
            <h4 className="text-lg font-semibold text-white">データ駆動</h4>
            <p className="text-slate-400">
              自動集計された統計で、客観的な分析が可能
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-2xl font-bold text-purple-400">🤖</div>
            <h4 className="text-lg font-semibold text-white">AI分析</h4>
            <p className="text-slate-400">
              試合データからAIが改善点とハイライトを提案
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container max-w-6xl mx-auto px-4 py-20 text-center">
        <h3 className="text-3xl font-bold text-white mb-6">
          試合分析の新しい標準を体験
        </h3>
        <Button
          onClick={handleGetStarted}
          size="lg"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
        >
          無料で始める
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </section>

      {/* フッター */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8">
        <div className="container max-w-6xl mx-auto px-4 text-center text-slate-400">
          <p>&copy; 2026 PitchSide Pro AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
