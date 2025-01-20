'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllDatasetsAsync } from '@/store/userfeat/datasetThunks';
import { getAllDvCompBrgsAsync } from '@/store/userfeat/dvcompbrgThunks';
import { toast } from 'react-hot-toast';
import { BrgForm } from '../../components/BrgForm';
import { DvCompBrg } from '@/types/userfeat';

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

  const dvcompBrg = useAppSelector((state) => 
    state.userfeat.dvcompbrg
  );
  const sg= dvcompBrg.find(sg => sg.dvid === rdvid);

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
          dispatch(getAllDvCompBrgsAsync())
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

  // if (!sg) {
  //   router.push('/user/config-sg');
  //   return null;
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit SG Configuration</h1>
      </div>

      <BrgForm
      setQueryResult={() => {}}
        // datasets={datasets}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        selectedRecord={sg}
        isUpdate={true}
      />
    </div>
  );
} 