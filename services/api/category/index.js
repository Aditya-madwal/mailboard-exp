import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

/**
 * Get all categories
 */
export async function getAllCategories() {
    try {
        const response = await axios.get(`${BASE_URL}/api/category/`)
        return response.data.data
    } catch (err) {
        console.error("Failed to fetch categories:", err)
        return []
    }
}

/**
 * Get a specific category by ID
 */
export async function getCategory(categoryId) {
    try {
        const response = await axios.get(`${BASE_URL}/api/category/${categoryId}/`)
        return response.data
    } catch (err) {
        console.error("Failed to fetch category:", err)
        return null
    }
}

/**
 * Create a new category
 */
export async function createCategory(categoryData) {
    try {
        const response = await axios.post(`${BASE_URL}/api/category/`, categoryData)
        return response.data
    } catch (err) {
        throw new Error("Failed to create category: " + err.message)
    }
}

/**
 * Update an existing category
 */
export async function updateCategory(categoryId, categoryData) {
    try {
        const response = await axios.patch(`${BASE_URL}/api/category/${categoryId}/`, categoryData)
        return response.data
    } catch (err) {
        console.error("Failed to update category:", err)
        return null
    }
}

/**
 * Delete a category
 */
export async function deleteCategory(categoryId) {
    try {
        const response = await axios.delete(`${BASE_URL}/api/category/${categoryId}/`)
        return response.data
    } catch (err) {
        console.error("Failed to delete category:", err)
        return null
    }
}