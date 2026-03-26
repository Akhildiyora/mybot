import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex h-screen w-screen items-center justify-center font-sans bg-zinc-900">
      <main className="flex w-full items-center justify-center">
        <Link href='/chat' className="border border-zinc-600 text-3xl rounded-lg bg-zinc-800 py-4 px-6 text-white cursor-pointer">Start Chat Now</Link>
      </main>
    </div>
  );
}
