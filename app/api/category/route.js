// app/api/category/route.js

import dbConnect from '@/lib/db'
import { NextResponse } from 'next/server'
import UserCategory from '@/models/UserCategory'
import { validateAuth } from '@/lib/auth'

export async function GET(request) {
    try {
        await dbConnect()

        const authResult = await validateAuth(request)
        if (!authResult.isValid) {
            return NextResponse.json({ error: authResult.error }, { status: 401 })
        }

        const userId = authResult.user.userId

        const categories = await UserCategory.find({ user: userId }).sort({ createdAt: -1 })

        return NextResponse.json({ data: categories }, { status: 200 })
    } catch (err) {
        console.error('Error fetching user categories:', err)
        return NextResponse.json({ error: 'Failed to fetch user categories' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        await dbConnect()

        const authResult = await validateAuth(request)
        if (!authResult.isValid) {
            return NextResponse.json({ error: authResult.error }, { status: 401 })
        }

        const userId = authResult.user.userId
        const body = await request.json()
        const { name, color } = body

        if (!name || !color) {
            return NextResponse.json({ error: 'Category name and color are required' }, { status: 400 })
        }

        const existing = await UserCategory.findOne({ name, user: userId })
        if (existing) {
            return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 })
        }

        const newCategory = new UserCategory({
            name: name.trim(),
            color,
            user: userId,
        })

        await newCategory.save()

        return NextResponse.json({ message: 'Category created successfully', category: newCategory }, { status: 201 })
    } catch (err) {
        console.error('Error creating category:', err)
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
    }
}