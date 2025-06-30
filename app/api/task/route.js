// apis for creation of task
// and getting all tasks

// app/api/task/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Task from '@/models/Task'
import { validateAuth } from '@/lib/auth'

export async function POST(request) {
    try {
        await dbConnect()

        const authResult = await validateAuth(request)
        if (!authResult.isValid) {
            return NextResponse.json({ error: authResult.error }, { status: 401 })
        }

        const userId = authResult.user.userId

        const body = await request.json()
        body.createdBy = userId

        const newTask = await Task.create(body)
        return NextResponse.json(newTask, { status: 201 })
    } catch (err) {
        console.error('Task creation error:', err)
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }
}

export async function GET(request) {
    try {
        await dbConnect()

        const authResult = await validateAuth(request)
        if (!authResult.isValid) {
            return NextResponse.json({ error: authResult.error }, { status: 401 })
        }
        const userId = authResult.user.userId

        const tasks = await Task.find({ createdBy: userId }).sort({ createdAt: -1 })
        return NextResponse.json(tasks)
    } catch (err) {
        console.error('Fetching tasks error:', err)
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }
}
