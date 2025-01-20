import { backendLink } from '@/utils/links';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const searchParams = req.nextUrl.searchParams;
    const filetype = searchParams.get('filetype');
    const project_id = searchParams.get('project_id');

    // Forward the request to backend
    const response = await fetch(
      `${backendLink}/filemanagment/python-files/upload?filetype=${filetype}&project_id=${project_id}`,
      {
      method: 'POST',
      body: formData,
      headers: {
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