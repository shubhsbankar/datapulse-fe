import { backendLink } from '@/utils/links';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const project = searchParams.get('project');
    const filename = searchParams.get('filename');

    if (!project) {
      return NextResponse.json(
        { error: 'Project shortname is required' },
        { status: 400 }
      );
    }

    // if (!filename) {
    //   return NextResponse.json(
    //     { error: 'Filename is required' },
    //     { status: 400 }
    //   );
    // }

    // Forward the request to backend
    const response = await fetch(
      `${backendLink}/filemanagment/yaml/download/${project}` + (filename ? `?filename=${filename}` : ''),
      {
        headers: {
          ...(req.headers.get('authorization') 
            ? { 'Authorization': req.headers.get('authorization')! }
            : {})
        }
      }
    );

    if (!response.ok) {
      const data = await response.json();
      // console.log({data})
      const {status, message} = data;
      // throw new Error(message || `Backend responded with status: ${status}`);
      return NextResponse.json(
        { error: message || `Backend responded with status: ${status}` },
        { status: status }
      );
    }

    const data = await response.blob();
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=${project}_yaml_files.zip`
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to download files' },
      { status: 500 }
    );
  }
} 