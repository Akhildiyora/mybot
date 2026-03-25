'use client'

import { useState } from "react";

type PageProps = {
  params: {
    chatname: string;
  };
}

export default function NewChat({ params }: PageProps) {
  const { chatname } = params
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

const handleSubmit = async() => {
  if (!message.trim()) return;
  
  try{
    setLoading(true);
    
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message })
    })

    const data = await res.json();

    if(!res.ok){
      setResponse(data.error || 'somthhing went wrong');      
    }

    setResponse(data.reply);
  } catch (error) {
    console.error(error);
    setResponse('Failed to generate response');
  } finally {
    setLoading(false);
  }
};
  

  return (
    <div className="flex h-screen items-center justify-center font-sans bg-zinc-900">
      <main className="flex flex-col gap-4 w-full max-w-3xl items-center justify-center text-xl bg-zinc-900 sm:items-start">
        This is your {chatname}

        <input type="text" name='message' value={message} placeholder='enter somthing' onChange={(e)=>setMessage(e.target.value)}/>
        <button className="border border-zinc-600 text-xl rounded-lg bg-zinc-800 py-2 px-4 cursor-pointer" onClick={handleSubmit}>Ganrate response</button>


        response is {response}
      </main>
    </div>
  );
}
