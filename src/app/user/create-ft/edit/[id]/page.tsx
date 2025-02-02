'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllDatasetsAsync } from '@/store/userfeat/datasetThunks';
import { getAllDvCompFt1sAsync } from '@/store/userfeat/dvcompft1Thunks';
import { toast } from 'react-hot-toast';
import { FtForm } from '../../components/FtForm';

export default function EditFtPage({ params }: { params: Promise<{ id: string }> }) {
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

  const dvcompft1 = useAppSelector((state) => 
    state.userfeat.dvcompft
  );
  const ft = dvcompft1.find(ft => ft.dvid === rdvid);

  useEffect(() => {
    if (ft) {
      setSelectedProject(ft.projectshortname);
    }
  }, [ft]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(getAllDatasetsAsync()),
          dispatch(getAllDvCompFt1sAsync())
        ]);
        
        if (ft) {
          setSelectedProject(ft.projectshortname);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load FT data:', error);
        toast.error('Failed to load FT data');
        router.push('/user/config-ft');
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!ft) {
    router.push('/user/config-ft');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit FT Configuration</h1>
      </div>

      <FtForm
      setQueryResult={() => {}}
        datasets={datasets}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        selectedRecord={ft}
        isUpdate={true}
      />
    </div>
  );
} 