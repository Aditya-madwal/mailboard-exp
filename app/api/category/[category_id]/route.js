// app/api/category/[category_id]/route.js

import dbConnect from '@/lib/db'
import { NextResponse } from 'next/server'
import UserCategory from '@/models/UserCategory'
import { validateAuth } from '@/lib/auth'

export async function GET(request, { params }) {
    try {
        await dbConnect()
        const authResult = await validateAuth(request)
        if (!authResult.isValid) {
            return NextResponse.json({ error: authResult.error }, { status: 401 })
        }

        const { category_id } = await params
        const category = await UserCategory.findOne({ _id: category_id, user: authResult.user.userId })

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }

        return NextResponse.json({ category }, { status: 200 })
    } catch (err) {
        console.error('Error fetching category:', err)
        return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
    }
}

export async function PATCH(request, { params }) {
    try {
        await dbConnect()
        const authResult = await validateAuth(request)
        if (!authResult.isValid) {
            return NextResponse.json({ error: authResult.error }, { status: 401 })
        }

        const { category_id } = await params
        const body = await request.json()
        const { name, color } = body

        const updates = {}
        if (name) updates.name = name.trim()
        if (color) updates.color = color

        const category = await UserCategory.findOneAndUpdate(
            { _id: category_id, user: authResult.user.userId },
            updates,
            { new: true }
        )

        if (!category) {
            return NextResponse.json({ error: 'Category not found or unauthorized' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Category updated', category }, { status: 200 })
    } catch (err) {
        console.error('Error updating category:', err)
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect()
        const authResult = await validateAuth(request)
        if (!authResult.isValid) {
            return NextResponse.json({ error: authResult.error }, { status: 401 })
        }

        const { category_id } = await params

        const result = await UserCategory.findOneAndDelete({ _id: category_id, user: authResult.user.userId })

        if (!result) {
            return NextResponse.json({ error: 'Category not found or unauthorized' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 })
    } catch (err) {
        console.error('Error deleting category:', err)
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
    }
}
