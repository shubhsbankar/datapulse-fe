'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllDatasetsAsync } from '@/store/userfeat/datasetThunks';
import { getAllDvCompBrg2sAsync } from '@/store/userfeat/dvcompbrg2Thunks';
import { toast } from 'react-hot-toast';
import { Brg2Form } from '../../components/Brg2Form';
import { DvCompBrg2 } from '@/types/userfeat';

export default function EditBrg2Page({ params }: { params: Promise<{ id: string }> }) {
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

  const dvcompBrg = useAppSelector((state) => 
    state.userfeat.dvcompbrg2
  );
  const brg= dvcompBrg.find(brg => brg.dvid === rdvid);

  useEffect(() => {
    if (brg) {
      setSelectedProject(brg.projectshortname);
    }
  }, [brg]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(getAllDatasetsAsync()),
          dispatch(getAllDvCompBrg2sAsync())
        ]);
        
        if (brg) {
          setSelectedProject(brg.projectshortname);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load brg data:', error);
        toast.error('Failed to load brg data');
        router.push('/user/config-brg');
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!brg) {
    router.push('/user/config-brg');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit brg2 Configuration</h1>
      </div>

      <Brg2Form
        setQueryResult={() => {}}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        selectedRecord={brg}
        dvcompbrgs={dvcompBrg}
      />
    </div>
  );
} 