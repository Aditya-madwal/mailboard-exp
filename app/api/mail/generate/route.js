// app/api/generate-email/route.js
import { NextResponse } from "next/server"
import { generateEmailBody } from "@/services/ai/emailGenerator" // adjust import based on your project structure

export async function POST(request) {
    try {
        const body = await request.json()
        const subject = body.subject

        if (!subject || subject.trim().length === 0) {
            return NextResponse.json({ error: "Subject is required" }, { status: 400 })
        }

        const emailBody = await generateEmailBody(subject)

        if (!emailBody) {
            return NextResponse.json({ error: "Failed to generate email body" }, { status: 500 })
        }

        return NextResponse.json({ data: emailBody }, { status: 200 })
    } catch (error) {
        console.error("API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
