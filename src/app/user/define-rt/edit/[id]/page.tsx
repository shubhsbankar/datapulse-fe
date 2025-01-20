'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllDatasetsAsync } from '@/store/userfeat/datasetThunks';
import { getAllRtAsync, updateRtAsync } from '@/store/userfeat/rtThunks';
import { toast } from 'react-hot-toast';
import { RtForm } from '../../components/RtForm';

export default function EditRtPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDataProduct, setSelectedDataProduct] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedDatastore, setSelectedDatastore] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [rtHashId, setRtHashId] = useState<number | null>(null);
  
  const datasets = useAppSelector((state) => state.userfeat.dataset);
  
  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await params;
      setRtHashId(parseInt(resolvedParams.id));
    };

    fetchParams();
  }, [params]);
  
  const rt = useAppSelector((state) => 
    state.userfeat.rt.find(rt => rt.tgthashid === rtHashId)
  );

  console.log({rt});

  useEffect(() => {
    dispatch(getAllRtAsync());
  }, [dispatch]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setSelectedProject(rt?.projectshortname || '');
        setSelectedDataProduct(rt?.dpname || '');
        setSelectedDataset(rt?.tgtdataset || '');
        setSelectedDatastore(rt?.datastoreshortname || '');
        setSelectedTable(rt?.tablename || '');
        setSelectedColumns(rt?.tgttabfields || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load RT data:', error);
        toast.error('Failed to load RT data');
      }
    };

    loadData();
  }, [rt, dispatch, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit RT</h1>
      </div>

      <RtForm
        datasets={datasets}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        selectedDataProduct={selectedDataProduct}
        setSelectedDataProduct={setSelectedDataProduct}
        selectedDataset={selectedDataset}
        setSelectedDataset={setSelectedDataset}
        selectedDatastore={selectedDatastore}
        setSelectedDatastore={setSelectedDatastore}
        selectedTable={selectedTable}
        setSelectedTable={setSelectedTable}
        selectedColumns={selectedColumns}
        setSelectedColumns={setSelectedColumns}
        keysNumInitial={Number(rt?.bkeys) || undefined}
        keysInitial={rt ? (Object.keys(rt).filter(k => k.startsWith('bkey') && k !== 'bkeys') || []).reduce((obj: any, k: any) => {
          obj[k] = rt[k as keyof typeof rt];
          return obj
        }, {}) : {}}
        isEdit={true}
        onSubmit={async (formData) => {
          try {
            await dispatch(updateRtAsync({ tgthashid: rtHashId as number, rtData: formData })).unwrap();
            toast.success('RT updated successfully');
            router.push('/user/define-rt');
          } catch (error: any) {
            toast.error(error.message || 'Failed to update RT');
          }
        }}
      />
    </div>
  );
} 