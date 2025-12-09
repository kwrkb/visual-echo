import { PromptForm } from "@/app/gallery/[id]/components/PromptForm";
import Link from "next/link";

export default function CreatePage() {
    return (
        <main className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
            <div className="w-full max-w-2xl">
                <div className="mb-6">
                    <Link
                        href="/"
                        className="text-blue-600 hover:underline text-sm font-medium inline-flex items-center gap-1"
                    >
                        ← トップに戻る
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Imagination Tree
                    </h1>
                    <p className="text-gray-600">
                        新しいイマジネーションの種を蒔きましょう
                    </p>
                </div>

                <PromptForm parentId={null} />
            </div>
        </main>
    );
}
