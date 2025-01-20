'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllDatasetsAsync } from '@/store/userfeat/datasetThunks';
import { getAllDvCompSg1sAsync, updateDvCompSg1Async } from '@/store/userfeat/dvcompsg1Thunks';
import { toast } from 'react-hot-toast';
import { SgForm } from '../../components/SgForm';

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

  const dvcompSg1 = useAppSelector((state) => 
    state.userfeat.dvcompsg1
  );
  const sg = dvcompSg1.find(sg => sg.rdvid === rdvid);

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
          dispatch(getAllDvCompSg1sAsync())
        ]);
        
        if (sg) {
          setSelectedProject(sg.projectshortname);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load SG data:', error);
        toast.error('Failed to load SG data');
        router.push('/user/config-sg');
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!sg) {
    router.push('/user/config-sg');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit SG Configuration</h1>
      </div>

      <SgForm
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