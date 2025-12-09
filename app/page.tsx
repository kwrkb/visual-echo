import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 font-sans text-slate-900">

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Visual Echo
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            AI Image Telephone — 画像と言葉で織りなす連想ゲーム。<br />
            あなたの解釈が、新しい世界を創り出します。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/gallery"
              className="px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-bold hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 shadow-blue-200 shadow-md"
            >
              ギャラリーを見る
            </Link>
            <Link
              href="/create"
              className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-full text-lg font-bold hover:bg-blue-50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
            >
              新しいお題でスタート
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">

          {/* Card 1: View */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-2xl">
              👁️
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">View</h3>
            <p className="text-slate-600 leading-relaxed">
              提示された1枚の画像を見て、そこに何が描かれているか、何を感じるかを観察しましょう。
            </p>
          </div>

          {/* Card 2: Input */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 text-2xl">
              ✍️
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">Describe</h3>
            <p className="text-slate-600 leading-relaxed">
              あなたの解釈を言葉にして入力します。正解はありません。あなたの感性が全てです。
            </p>
          </div>

          {/* Card 3: Generate (Link) */}
          <Link
            href="/create"
            className="group block bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-8xl">✨</span>
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 text-2xl shadow-sm group-hover:scale-110 transition-transform">
                🤖
              </div>
              <h3 className="text-xl font-bold mb-3 text-blue-900 group-hover:text-blue-700 transition-colors">Generate</h3>
              <p className="text-blue-800/80 leading-relaxed">
                AIがあなたの言葉から新しい画像を生成します。
                <span className="block mt-2 font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                  今すぐ始める →
                </span>
              </p>
            </div>
          </Link>

        </div>
      </section>

      {/* Footer / Connection Test */}
      <footer className="py-12 text-center text-slate-400 text-sm">
        <p>© Visual Echo Project</p>
        <div className="mt-4">
          <Link href="/test" className="hover:text-slate-600 transition-colors">
            System Status Check
          </Link>
        </div>
      </footer>
    </main>
  );
}
