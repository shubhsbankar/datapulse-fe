'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllDatasetsAsync } from '@/store/userfeat/datasetThunks';
import { getAllDvCompSg2sAsync } from '@/store/userfeat/dvcompsg2Thunks';
import { toast } from 'react-hot-toast';
import { Sg2Form } from '../../components/Sg2Form';

export default function EditSgPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('');

  const datasets = useAppSelector((state) => state.userfeat.dataset);
  
  const [rdvid, setRdvid] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await params;
      setRdvid(parseInt(resolvedParams.id));
    };

    fetchParams();
  }, [params]);

  const dvcompsg2 = useAppSelector((state) => 
    state.userfeat.dvcompsg2
  );
  const sg = dvcompsg2.find(sg => sg.dvid === rdvid);

  useEffect(() => {
    if (sg) {
      setSelectedProject(sg.projectshortname);
    }
  }, [sg]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(getAllDatasetsAsync()),
          dispatch(getAllDvCompsg2sAsync())
        ]);
        
        if (sg) {
          setSelectedProject(sg.projectshortname);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load SG2 data:', error);
        toast.error('Failed to load SG2 data');
        router.push('/user/config-sg2');
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!sg) {
    router.push('/user/config-sg2');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit SG Configuration</h1>
      </div>

      <Sg2Form
      setQueryResult={() => {}}
        datasets={datasets}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        selectedRecord={sg}
        isUpdate={true}
      />
    </div>
  );
} 