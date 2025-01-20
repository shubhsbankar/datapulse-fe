import { backendLink } from '@/utils/links';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const project = searchParams.get('project');
    const filepath = searchParams.get('filepath');

    if (!project) {
      return NextResponse.json(
        { error: 'Project shortname is required' },
        { status: 400 }
      );
    }

    // Forward the request to backend
    const response = await fetch(
      `${backendLink}/filemanagment/python-files/download?project_id=${project}` + (filepath ? `&filepath=${filepath}` : ""),
      {
        headers: {
          ...(req.headers.get('authorization') 
            ? { 'Authorization': req.headers.get('authorization')! }
            : {})
        }
      }
    );

    if (!response.ok) {
      const {status, message} = await response.json()
      // throw new Error(`Backend responded with status: ${response.status}`);
      throw new Error(message);
    }

    const data = await response.blob();
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=${project}_py_files.zip`
      }
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 