import { backendLink } from '@/utils/links';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Forward the request to backend
    const response = await fetch(`${backendLink}/filemanagment/bigquery/upload`, {
      method: 'POST',
      body: formData,
      // Include any auth headers if needed
      headers: {
        // Forward authorization header if present
        ...(req.headers.get('authorization') 
          ? { 'Authorization': req.headers.get('authorization')! }
          : {})
      }
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
} 