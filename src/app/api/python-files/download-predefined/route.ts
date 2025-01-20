import { backendLink } from '@/utils/links';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Forward the request to backend
    const response = await fetch(
      `${backendLink}/filemanagment/python-files/download-predefined`,
      {
        headers: {
          ...(req.headers.get('authorization') 
            ? { 'Authorization': req.headers.get('authorization')! }
            : {})
        }
      }
    );

    if (!response.ok) {
      const errorMessage = await response.json();
      console.error('Download error:', errorMessage.message);
      return NextResponse.json(
        { message: errorMessage.message },
        { status: response.status }
      );
    }

    const data = await response.blob();
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=predefined-python-files.zip`
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download files' },
      { status: 500 }
    );
  }
} 