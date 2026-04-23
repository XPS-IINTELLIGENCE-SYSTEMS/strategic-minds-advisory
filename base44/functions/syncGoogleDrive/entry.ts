import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { query, connectorId } = await req.json();

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(connectorId);

    const searchQuery = encodeURIComponent(query || 'mimeType contains "application/vnd.google-apps"');
    const url = `https://www.googleapis.com/drive/v3/files?q=${searchQuery}&fields=files(id,name,mimeType,modifiedTime,webViewLink,size)&pageSize=20&orderBy=modifiedTime desc`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Drive API error');

    return Response.json({ files: data.files || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});