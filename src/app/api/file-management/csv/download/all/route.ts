import { backendLink } from '@/utils/links';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const project_id = formData.get("project_id")
    const timestamp = formData.get("timestamp")
    // Forward the request to backend
    const response = await fetch(`${backendLink}/filemanagment/csv/all/download/${project_id}/${timestamp}`, {
      method: 'GET',
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

    const data = await response.blob();
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=${project_id}_all_files.zip`
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
} 