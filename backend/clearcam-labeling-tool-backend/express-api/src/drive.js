import { google } from 'googleapis';

export async function ensureFolder(name, parentId) {
  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/drive']
  });
  const drive = google.drive({ version: 'v3', auth });
  const { data } = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : []
    },
    fields: 'id,name,webViewLink'
  });
  return data;
}
