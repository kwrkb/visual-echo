import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function Home() {
  return (
    <div className="min-h-screen bg-ve-bg">
      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 text-center relative overflow-hidden">
        {/* Ripple SVG background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <svg width="600" height="600" viewBox="0 0 600 600" className="opacity-[0.06]">
            <circle cx="300" cy="300" r="80" stroke="var(--ve-accent)" strokeWidth="1" fill="none">
              <animate attributeName="r" values="80;250" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="300" cy="300" r="80" stroke="var(--ve-accent)" strokeWidth="1" fill="none">
              <animate attributeName="r" values="80;250" dur="4s" begin="1.3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0" dur="4s" begin="1.3s" repeatCount="indefinite" />
            </circle>
            <circle cx="300" cy="300" r="80" stroke="var(--ve-accent)" strokeWidth="1" fill="none">
              <animate attributeName="r" values="80;250" dur="4s" begin="2.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0" dur="4s" begin="2.6s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        <div className="max-w-4xl mx-auto space-y-8 relative animate-fade-up">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-ve-accent">
            Visual Echo
          </h1>
          <p className="text-lg md:text-xl text-ve-text-muted leading-relaxed max-w-2xl mx-auto">
            AI Image Telephone — 画像と言葉で織りなす連想ゲーム。
            <br />
            あなたの解釈が、新しい世界を創り出します。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button href="/gallery" size="lg">
              ギャラリーを見る
            </Button>
            <Button href="/create" variant="secondary" size="lg">
              新しいお題でスタート
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {/* Card 1: View */}
          <Card hover className="p-8">
            <div className="w-10 h-10 bg-ve-accent-light rounded-xl flex items-center justify-center mb-5">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 4C5.5 4 2 10 2 10s3.5 6 8 6 8-6 8-6-3.5-6-8-6Z" stroke="var(--ve-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="10" cy="10" r="2.5" stroke="var(--ve-accent)" strokeWidth="1.5"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-ve-text mb-2">View</h3>
            <p className="text-sm text-ve-text-muted leading-relaxed">
              提示された1枚の画像を見て、そこに何が描かれているか、何を感じるかを観察しましょう。
            </p>
          </Card>

          {/* Card 2: Describe */}
          <Card hover className="p-8">
            <div className="w-10 h-10 bg-ve-accent2-light rounded-xl flex items-center justify-center mb-5">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M14 3l3 3-9 9H5v-3l9-9Z" stroke="var(--ve-accent2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-ve-text mb-2">Describe</h3>
            <p className="text-sm text-ve-text-muted leading-relaxed">
              あなたの解釈を言葉にして入力します。正解はありません。あなたの感性が全てです。
            </p>
          </Card>

          {/* Card 3: Generate */}
          <Card hover className="p-8">
            <div className="w-10 h-10 bg-ve-accent-light rounded-xl flex items-center justify-center mb-5">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 2v4M10 14v4M2 10h4M14 10h4M4.93 4.93l2.83 2.83M12.24 12.24l2.83 2.83M4.93 15.07l2.83-2.83M12.24 7.76l2.83-2.83" stroke="var(--ve-accent)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-ve-text mb-2">Generate</h3>
            <p className="text-sm text-ve-text-muted leading-relaxed">
              AIがあなたの言葉から新しい画像を生成します。解釈の連鎖が広がっていきます。
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-ve-text-subtle text-xs">
        <p>&copy; Visual Echo Project</p>
      </footer>
    </div>
  );
}
