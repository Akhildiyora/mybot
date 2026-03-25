import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST (req: Request) {
    try{

        const body = await req.json();
        const message = body.message;

        if(!message) {
            return NextResponse.json(
                {error : 'Message is required'},
                { status: 400 }
            )
        }
        
        const response = await client.responses.create({
            model: process.env.MY_MODEL,
            input: message
        });
        
        console.log(response.output_text);
        
        return NextResponse.json({
            reply: response.output_text,
        });
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            {error : "Failed to generate response"},
            { status: 500 }
        );
    }
}
