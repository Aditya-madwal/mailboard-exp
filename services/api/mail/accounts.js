import axios from 'axios'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export async function fetchEmailAccounts() {
    try {
        const response = await axios.get(`${BASE_URL}/api/mail/accounts/`)
        const accounts = response.data.data || []

        // Transform API response to your UI format
        return accounts.map((acc, idx) => ({
            id: acc._id,
            email: acc.email,
            name: acc.name,
            avatar: acc.picture || `https://api.dicebear.com/8.x/fun-emoji/svg?seed=${Math.random()}`,
            unread: Math.floor(Math.random() * 10), // Placeholder until real value exists
            isActive: idx === 0, // First account active by default
        }))
    } catch (err) {
        console.error("Failed to fetch email accounts:", err)
        return []
    }
}
