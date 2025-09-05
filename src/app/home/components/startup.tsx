"use client";

import Link from "next/link";
import { Plus, Map } from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";

export function Startup() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ようこそ</h1>
        <p className="text-gray-600 mt-2">
          ロードマップを作成して、目標達成への道筋を明確にしましょう
        </p>
      </div>

      {/* Empty State */}
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Map className="w-8 h-8 text-blue-600" />
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              ロードマップがありません
            </h2>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              ロードマップの作成から始めてください。
            </p>

            {/* Action Button */}
            <Link href="/roadmaps/new">
              <Button className="w-full sm:w-auto hover:cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                ロードマップ作成
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Optional: Quick Start Guide */}
      <div className="mt-12 max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">はじめ方</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                1
              </div>
              <h4 className="font-medium">ロードマップ作成</h4>
            </div>
            <p className="text-sm text-gray-600">
              目標のタイトルを設定してロードマップを作成します
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                2
              </div>
              <h4 className="font-medium">ステップの設定</h4>
            </div>
            <p className="text-sm text-gray-600">
              目標達成のための具体的なステップとゴールを追加します
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                3
              </div>
              <h4 className="font-medium">ゴール達成に向け活動</h4>
            </div>
            <p className="text-sm text-gray-600">
              活動を行ったら記録を付けて、ゴール達成のステータスを更新します
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
