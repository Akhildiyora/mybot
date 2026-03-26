export default async function ChatsPage() {
  return (
    <div className="flex h-full w-full items-center justify-center text-zinc-300">
      <div className="rounded-xl border border-zinc-700 bg-zinc-800/40 p-8 text-center">
        <h1 className="mb-2 text-3xl font-semibold text-white">
          Welcome to MyBot
        </h1>
        <p>Select a chat from the sidebar or create a new one.</p>
      </div>
    </div>
  );
}
