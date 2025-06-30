import { GoogleGenerativeAI } from '@google/generative-ai'

// Load your Gemini API key
const API_KEY = process.env.GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(API_KEY)

// Generic email templates for fallback
const FALLBACK_TEMPLATES = {
    default: `Dear [RECIPIENT NAME],

I hope this email finds you well. I am writing to you regarding [SUBJECT MATTER] and wanted to reach out to discuss this further.

[SPECIFIC DETAILS OR CONTEXT] would be greatly appreciated. Please let me know if you have any questions or if there's anything else I can provide to help move this forward.

I look forward to hearing from you soon and appreciate your time and consideration in this matter.

Best regards,
[YOUR NAME]`,

    meeting: `Dear [RECIPIENT NAME],

Thank you for taking the time to meet with me [DATE/TIME]. I wanted to follow up on our discussion about [TOPIC] and provide any additional information you might need.

As we discussed, [KEY POINTS FROM MEETING] are the next steps we should focus on. I believe this approach will help us achieve [DESIRED OUTCOME] effectively.

Please let me know if you have any questions or if you'd like to schedule another meeting to discuss this further. I'm available [YOUR AVAILABILITY] and happy to accommodate your schedule.

Looking forward to our continued collaboration.

Best regards,
[YOUR NAME]`,

    inquiry: `Dear [RECIPIENT NAME],

I hope you are doing well. I am reaching out to inquire about [SPECIFIC TOPIC/SERVICE/PRODUCT] and would appreciate any information you can provide.

Specifically, I am interested in learning more about [DETAILED REQUIREMENTS] and how this might align with [YOUR NEEDS/GOALS]. Any guidance or resources you could share would be extremely helpful.

If you have time for a brief call or meeting to discuss this further, I would be happy to work around your schedule. Thank you for your time and consideration.

Best regards,
[YOUR NAME]`
}

// Utility: validate email body meets minimum requirements
function validateEmailBody(body) {
    if (!body || typeof body !== 'string') {
        return { valid: false, reason: 'Empty or invalid body' }
    }

    const trimmedBody = body.trim()
    const wordCount = trimmedBody.split(/\s+/).filter(word => word.length > 0).length

    if (wordCount < 30) {
        return { valid: false, reason: `Too short: ${wordCount} words (minimum 30 required)` }
    }

    if (trimmedBody.length < 100) {
        return { valid: false, reason: 'Body too short in characters' }
    }

    return { valid: true, wordCount }
}

// Utility: determine fallback template based on subject
function selectFallbackTemplate(subject) {
    const subjectLower = subject.toLowerCase()

    if (subjectLower.includes('meeting') || subjectLower.includes('follow up') || subjectLower.includes('followup')) {
        return FALLBACK_TEMPLATES.meeting
    } else if (subjectLower.includes('inquiry') || subjectLower.includes('question') || subjectLower.includes('information')) {
        return FALLBACK_TEMPLATES.inquiry
    }

    return FALLBACK_TEMPLATES.default
}

// Utility: create a structured prompt for email body generation
function buildEmailBodyPrompt(subject, attempt = 1) {
    const additionalInstructions = attempt > 1 ?
        `\n\nIMPORTANT: This is attempt ${attempt}. Please generate a COMPLETE and DETAILED email body with at least 30 words. The previous attempt was too short or incomplete.` : ''

    return `
You are an intelligent email writing assistant. Generate a complete email body based on the given subject line.

Requirements:
- Create a professional and natural email body with AT LEAST 30 words
- Include placeholders in square brackets like [YOUR NAME], [SPECIFIC DETAILS], [DATE], etc. for user customization
- Make it contextually appropriate for the subject
- Return only the email body content in plain text
- Keep it professional but ensure it's comprehensive and complete
- Include proper greeting, main content, and closing

Subject: "${subject}"${additionalInstructions}

Generate the email body:
`
}

// Generate email body using Gemini API with retry logic
export async function generateEmailBody(subject, maxRetries = 3) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const prompt = buildEmailBodyPrompt(subject, attempt)

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "text/plain",
                    temperature: 0.7,
                    maxOutputTokens: 600, // Increased for longer responses
                    topP: 0.8,
                    topK: 40
                }
            })

            const response = result.response
            const emailBody = response.text().trim()

            // Validate the generated email body
            const validation = validateEmailBody(emailBody)

            if (validation.valid) {
                return emailBody
            } else {
                if (attempt === maxRetries) {
                    console.log('Max retries reached, using fallback template')
                    break
                }
                continue
            }

        } catch (err) {
            if (attempt === maxRetries) {
                console.log('Max retries reached due to errors, using fallback template')
                break
            }
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    }

    // If all attempts failed, return fallback template
    const fallbackTemplate = selectFallbackTemplate(subject)

    return fallbackTemplate
}

// // Enhanced test function with detailed output
// export async function testEmailGeneration(subject) {
//     console.log(`\n🚀 Testing email generation for: "${subject}"`)
//     console.log('='.repeat(60))

//     const result = await generateEmailBody(subject)

//     console.log('\n📊 RESULT:')
//     console.log(`Success: ${result.success}`)
//     console.log(`Source: ${result.source}`)
//     console.log(`Attempts: ${result.attempt}`)
//     console.log(`Word Count: ${result.wordCount}`)
//     if (result.message) console.log(`Message: ${result.message}`)

//     console.log('\n📧 GENERATED EMAIL BODY:')
//     console.log('-'.repeat(40))
//     console.log(result.body)
//     console.log('-'.repeat(40))

//     return result
// }

// // Example usage (uncomment to test):

// testEmailGeneration("Follow up on our meeting yesterday").then(result => {
//     // Result will contain success status, body, attempts, etc.
// })

// testEmailGeneration("Requesting information about your services").then(result => {
//     // Another test
// })