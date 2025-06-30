import { google } from 'googleapis'
import GmailAccount from '@/models/GmailAccount'

export async function getValidOAuthClient(mail_id) {
    const gmailAccount = await GmailAccount.findById(mail_id)
    if (!gmailAccount) throw new Error('Gmail account not found')

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    )

    const now = Date.now()
    const expiry = gmailAccount.tokenExpiryDate?.getTime() || 0

    // ✅ Set credentials first
    oauth2Client.setCredentials({
        access_token: gmailAccount.accessToken,
        refresh_token: gmailAccount.refreshToken,
    })

    // ✅ Check expiry and refresh only if token is expiring AND refresh token exists
    if (expiry - now < 5 * 60 * 1000 && gmailAccount.refreshToken) {
        const { credentials } = await oauth2Client.refreshAccessToken()

        // Update DB with new token values
        gmailAccount.accessToken = credentials.access_token
        gmailAccount.tokenExpiryDate = new Date(credentials.expiry_date)

        // Some providers don't send refresh_token again, so only update if present
        if (credentials.refresh_token) {
            gmailAccount.refreshToken = credentials.refresh_token
        }

        await gmailAccount.save()

        // Re-set the refreshed credentials
        oauth2Client.setCredentials({
            access_token: gmailAccount.accessToken,
            refresh_token: gmailAccount.refreshToken
        })
    }

    return { oauth2Client, gmailAccount }
}
