import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex h-screen items-center justify-center font-sans bg-zinc-900">
      <main className="flex w-full items-center justify-center sm:items-start">
        <Link href='/chat/newchat' className="border border-zinc-600 text-3xl rounded-lg bg-zinc-800 py-2 px-4 cursor-pointer">Start Chat Now</Link>
      </main>
    </div>
  );
}
