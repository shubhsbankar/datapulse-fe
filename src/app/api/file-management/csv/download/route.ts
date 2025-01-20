import { backendLink } from '@/utils/links';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const project = searchParams.get('project');
    const timestamp = searchParams.get('timestamp');
    const table = searchParams.get('table');

    if (!project || !table) {
      return NextResponse.json(
        { error: 'Project and table name are required' },
        { status: 400 }
      );
    }

    // Forward the request to backend
    const response = await fetch(
      `${backendLink}/filemanagment/csv/download/${project}?timestamp=${timestamp}&table=${table}`,
      {
        headers: {
          ...(req.headers.get('authorization') 
            ? { 'Authorization': req.headers.get('authorization')! }
            : {})
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.blob();
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=${project}_${table}_files.zip`
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