'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllDatasetsAsync } from '@/store/userfeat/datasetThunks';
import { getAllDvCompPtsAsync } from '@/store/userfeat/dvcompptThunks';
import { toast } from 'react-hot-toast';
import { PtForm } from '../../components/PtForm';

export default function EditPtPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('');

  const datasets = useAppSelector((state) => state.userfeat.dataset);
  
  const [dvid, setDvid] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await params;
      setDvid(parseInt(resolvedParams.id));
    };

    fetchParams();
  }, [params]);

  const dvcompPt = useAppSelector((state) => 
    state.userfeat.dvcomppt
  );
  const pt = dvcompPt.find(pt => pt.dvid === dvid);

  useEffect(() => {
    if (pt) {
      setSelectedProject(pt.projectshortname);
    }
  }, [pt]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(getAllDatasetsAsync()),
          dispatch(getAllDvCompPtsAsync())
        ]);
        
        if (pt) {
          setSelectedProject(pt.projectshortname);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load pt data:', error);
        toast.error('Failed to load pt data');
        router.push('/user/config-pt');
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!pt) {
    router.push('/user/config-pt');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit PT Configuration</h1>
      </div>

      <PtForm
      setQueryResult={() => {}}
        datasets={datasets}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        selectedRecord={pt}
        isUpdate={true}
      />
    </div>
  );
} 