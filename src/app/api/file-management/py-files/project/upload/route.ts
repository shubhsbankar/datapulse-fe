import { backendLink } from '@/utils/links';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const project = req.nextUrl.searchParams.get('project');
    // Forward the request to backend
    const response = await fetch(`${backendLink}/filemanagment/python-files/upload?project_id=${project}&filetype=`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(req.headers.get('authorization') 
          ? { 'Authorization': req.headers.get('authorization')! }
          : {})
      }
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      console.log(errorMessage);
      return NextResponse.json(
        { message: errorMessage.message },
        { status: response.status }
      );
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