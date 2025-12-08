import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-20">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Visual Echo
          </h1>
          <p className="text-xl text-gray-900 mb-12">
            AI Image Telephone - 画像と言葉で連想ゲーム
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/gallery"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              ギャラリーを見る
            </Link>
            <Link
              href="/test"
              className="px-8 py-4 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl border border-gray-200"
            >
              接続テスト
            </Link>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">👁️</div>
              <h3 className="font-bold text-lg mb-2">View</h3>
              <p className="text-gray-900 text-sm">
                文脈が隠された1枚の画像を見ます
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">✍️</div>
              <h3 className="font-bold text-lg mb-2">Describe</h3>
              <p className="text-gray-900 text-sm">
                画像を言葉で説明します
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-bold text-lg mb-2">Generate</h3>
              <p className="text-gray-900 text-sm">
                AIが新しい画像を生成します
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
