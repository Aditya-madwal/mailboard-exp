import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

/**
 * Login user
 */
export async function loginUser(credentials) {
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, credentials)
        return response.data
    } catch (err) {
        console.error("Login failed:", err)
        throw new Error(err.response?.data?.message || "Login request failed")
    }
}

/**
 * Register user
 */
export async function registerUser(userData) {
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/register`, userData)
        return response.data
    } catch (err) {
        console.error("Registration failed:", err)
        throw new Error(err.response?.data?.message || "Registration request failed")
    }
}

/**
 * Logout user
 */
export async function logoutUser() {
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
            withCredentials: true // Important: Include cookies in the request
        })
        return response.data
    } catch (err) {
        console.error("Logout failed:", err)
        throw new Error(err.response?.data?.message || "Logout request failed")
    }
}