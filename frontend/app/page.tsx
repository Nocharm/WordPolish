import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">Word Templator</h1>
      <p className="mt-2 text-sm text-gray-600">
        .docx 문서를 빌트인 템플릿으로 표준화합니다.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/login" className="rounded border px-4 py-2">로그인</Link>
        <Link href="/signup" className="rounded border px-4 py-2">회원가입</Link>
      </div>
    </main>
  );
}
