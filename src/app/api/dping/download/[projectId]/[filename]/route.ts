import { backendLink } from '@/utils/links';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const filename = searchParams.get('filename');
    
    if (!projectId || !filename) {
      return NextResponse.json(
        { message: 'Project ID and filename are required' },
        { status: 400 }
      );
    }

    // Forward the request to backend
    const response = await fetch(
      `${backendLink}/filemanagment/dping/download/${projectId}/${filename}`,
      {
        headers: {
          ...(request.headers.get('authorization') 
            ? { 'Authorization': request.headers.get('authorization')! }
            : {})
        }
      }
    );

    if (!response.ok) {
      const errorMessage = await response.json();
      return NextResponse.json(
        { message: errorMessage.message },
        { status: response.status }
      );
    }

    const data = await response.blob();
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=${filename}.zip`
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