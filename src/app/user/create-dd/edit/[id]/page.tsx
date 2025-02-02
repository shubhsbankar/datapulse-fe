'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllDatasetsAsync } from '@/store/userfeat/datasetThunks';
import { getAllDvCompDdsAsync } from '@/store/userfeat/dvcompddThunks';
import { toast } from 'react-hot-toast';
import { DdForm } from '../../components/DdForm';

export default function EditDdPage({ params }: { params: Promise<{ id: string }> }) {
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

  const rdvcompdd = useAppSelector((state) => 
    state.userfeat.dvcompdd
  );
  const dd = rdvcompdd.find(dd => dd.dvid === rdvid);

  useEffect(() => {
    if (dd) {
      setSelectedProject(dd.projectshortname);
    }
  }, [dd]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(getAllDatasetsAsync()),
          dispatch(getAllDvCompDdsAsync())
        ]);
        
        if (dd) {
          setSelectedProject(dd.projectshortname);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load DD data:', error);
        toast.error('Failed to load DD data');
        router.push('/user/config-dd');
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!dd) {
    router.push('/user/config-dd');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit DD Configuration</h1>
      </div>

      <DdForm
      setQueryResult={() => {}}
        datasets={datasets}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        selectedRecord={dd}
        isUpdate={true}
      />
    </div>
  );
} 