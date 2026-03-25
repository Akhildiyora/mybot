import React from 'react'



export default function ChatsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='bg-zinc-900 h-full w-full p-4 '>
      <span className='text-sm'>model:</span> <span className='font-bold'>gpt-5-nano</span>
      {children}
    </div>
  )
}

