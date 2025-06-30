import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';

// define scopes :

const SCOPES = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
];

// fetch and store the token :
const auth = await authenticate({
    scopes: SCOPES,
    keyfilePath: path.join(__dirname, '../../credentials.json'),
});