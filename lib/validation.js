import validator from 'validator'

export function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return { isValid: false, message: 'Email is required' }
    }

    if (!validator.isEmail(email)) {
        return { isValid: false, message: 'Please enter a valid email address' }
    }

    return { isValid: true }
}

export function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return { isValid: false, message: 'Password is required' }
    }

    if (password.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters long' }
    }

    if (password.length > 128) {
        return { isValid: false, message: 'Password must be less than 128 characters' }
    }

    return { isValid: true }
}

export function validateName(name) {
    if (!name || typeof name !== 'string') {
        return { isValid: false, message: 'Name is required' }
    }

    const trimmedName = name.trim()
    if (trimmedName.length < 2) {
        return { isValid: false, message: 'Name must be at least 2 characters long' }
    }

    if (trimmedName.length > 50) {
        return { isValid: false, message: 'Name must be less than 50 characters' }
    }

    // Only allow letters, spaces, hyphens, and apostrophes
    if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
        return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' }
    }

    return { isValid: true, sanitized: trimmedName }
}

export function sanitizeInput(input) {
    if (typeof input !== 'string') return input

    // Remove any HTML tags and trim whitespace
    return validator.escape(input.trim())
}

// Rate limiting helper
const attempts = new Map()

export function checkRateLimit(identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const now = Date.now()
    const userAttempts = attempts.get(identifier) || { count: 0, resetTime: now + windowMs }

    // Reset if window has passed
    if (now > userAttempts.resetTime) {
        userAttempts.count = 0
        userAttempts.resetTime = now + windowMs
    }

    userAttempts.count++
    attempts.set(identifier, userAttempts)

    if (userAttempts.count > maxAttempts) {
        return { allowed: false, resetTime: userAttempts.resetTime }
    }

    return { allowed: true }
}
