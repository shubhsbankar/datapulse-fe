'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllDatasetsAsync } from '@/store/userfeat/datasetThunks';
import { getAllRsAsync, updateRsAsync } from '@/store/userfeat/rsThunks';
import { toast } from 'react-hot-toast';
import { RssForm } from '../../components/RssForm';

export default function EditRssPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDataProduct, setSelectedDataProduct] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedDatastore, setSelectedDatastore] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectAllColumns, setSelectAllColumns] = useState(false);
  const [selectMultipleColumns, setSelectMultipleColumns] = useState(false);
  const [rsHashId, setRsHashId] = useState<number | null>(null);
  const datasets = useAppSelector((state) => state.userfeat.dataset);
  
  useEffect(() => {
    // Resolve the `params` Promise and update `dsid`
    const fetchParams = async () => {
      const resolvedParams = await params;
      setRsHashId(parseInt(resolvedParams.id));
    };

    fetchParams();
  }, [params]);
  
  const rs = useAppSelector((state) => state.userfeat.rs.find(rs => rs.srchashid === rsHashId));
  useEffect(() => {
    dispatch(getAllRsAsync());
    
  }, [dispatch]);
  const datastore = useAppSelector(state => state.datastore.datastores.find(ds => ds.datastorename === datasets.find(d=>d.datasetshortname===rs?.srcdataset)?.datastoreshortname));
  useEffect(() => {
    const loadData = async () => {
      try {
        setSelectedProject(rs?.projectshortname || '');
        setSelectedDataProduct(rs?.dpname || '');
        setSelectedDataset(rs?.srcdataset || '');
        setSelectedDatastore(rs?.datastoreshortname || '');
        setSelectedColumns(rs?.srctabfields || []);
        // setSelectedTable(rs?.tablename || '');
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load RSS data:', error);
        toast.error('Failed to load RSS data');
      }
    };

    loadData();
  }, [rs, dispatch, router, datastore]);
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit RSS</h1>
      </div>

      <RssForm
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
        isEdit={true}
        keysInitial={rs ? (Object.keys(rs).filter(k => k.startsWith('bkey') && k !== 'bkeys') || []).reduce((obj: any, k: any) => {
          obj[k] = rs[k as keyof typeof rs];
          return obj
        }, {}) : {}}
        keysNumInitial={Number(rs?.bkeys)}
        onSubmit={async (formData) => {
          try {
            await dispatch(updateRsAsync({ id: rsHashId as number, rsData: formData })).unwrap();
            toast.success('RSS updated successfully');
            router.push('/user/define-rss');
          } catch (error: any) {
            toast.error(error.message || 'Failed to update RSS');
          }
        }}
      />
    </div>
  );
} 