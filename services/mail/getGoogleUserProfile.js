import { google } from 'googleapis'

export async function getGoogleUserProfile({ accessToken }) {
    try {
        const oauth2Client = new google.auth.OAuth2()
        oauth2Client.setCredentials({ access_token: accessToken })

        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })

        const { data } = await oauth2.userinfo.get()

        return {
            name: data.name,
            email: data.email,
            picture: data.picture,
        }
    } catch (error) {
        console.error('Failed to fetch Google user profile:', error)
        throw new Error('Failed to fetch user profile from Google')
    }
}
