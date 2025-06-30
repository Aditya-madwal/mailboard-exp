// app/api/task/[task_id]/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Task from '@/models/Task'
import { validateAuth } from '@/lib/auth'

export async function PATCH(request, { params }) {
    try {
        await dbConnect()

        const authResult = await validateAuth(request)
        if (!authResult.isValid) {
            return NextResponse.json({ error: authResult.error }, { status: 401 })
        }

        const { task_id } = await params
        const updates = await request.json()

        console.log(task_id)
        console.log(updates)

        const updatedTask = await Task.findOneAndUpdate({ _id: task_id, createdBy: authResult.user.userId }, updates, { new: true })
        if (!updatedTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        return NextResponse.json(updatedTask)
    } catch (err) {
        console.error('Task update error:', err)
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect()

        const authResult = await validateAuth(request)
        if (!authResult.isValid) {
            return NextResponse.json({ error: authResult.error }, { status: 401 })
        }

        const { task_id } = await params
        const deletedTask = await Task.findOneAndDelete({ _id: task_id, createdBy: authResult.user.userId })
        if (!deletedTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('Task deletion error:', err)
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
    }
}
