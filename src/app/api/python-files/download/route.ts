import { backendLink } from '@/utils/links';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const filetype = searchParams.get('filetype');
    const project_id = searchParams.get('project_id');

    if (!filetype) {
      return NextResponse.json(
        { error: 'File type is required' },
        { status: 400 }
      );
    }

    // if (!project_id) {
    //   return NextResponse.json(
    //     { error: 'Project ID is required' },
    //     { status: 400 }
    //   );
    // }

    // Forward the request to backend
    const response = await fetch(
      `${backendLink}/filemanagment/python-files/download?filetype=${filetype}&project_id=${project_id}`,
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
      return NextResponse.json(
        { message: errorMessage.message },
        { status: response.status }
      );
    }

    const data = await response.blob();
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=${filetype}-files.zip`
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