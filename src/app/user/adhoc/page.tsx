'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllDatasetsAsync } from '@/store/userfeat/datasetThunks';
import { getAllDtgsAsync } from '@/store/userfeat/dtgThunks';
import { SqlForm } from './components/SqlForm';
import { SqlTabs } from './components/SqlTabs';
import { formatDate } from '@/utils/dateFormatter';
import { SqlResults } from './components/SqlResults';
import { backendLink } from '@/utils/links';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 10;

type Adhoc = {
  py_id: string;
  execution_date: string;
  input_1: string;
  input_2: string;
  input_3: string;
}

export default function ExecuteSqlPage() {
  const dispatch = useAppDispatch();
  const [inputs, setInputs] = useState<Adhoc>({
    py_id: '',
    execution_date: '',
    input_1: '',
    input_2: '',
    input_3: ''
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    fetch(`${backendLink}/adhoc/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(inputs)
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        toast.success('Adhoc executed successfully');
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to execute adhoc');
      });
  }

  const uniqueTypes = ["Type 1", "Type 2"]

  // Helper function to determine if fields are required
  const isFieldRequired = (fieldName: string) => {
    if (inputs.py_id === 'Type 1') {
      return ['execution_date', 'input_1'].includes(fieldName);
    }
    if (inputs.py_id === 'Type 2') {
      return true; // All fields required for Type 3
    }
    return false;
  };

  return (
    <div className="space-y-6 mt-8">
      <form onSubmit={onSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <h1 className='text-xl font-semibold'>Adhoc Execution</h1>

        <div>
          <label htmlFor="py_id" className="block text-sm font-medium text-gray-700">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            id="py_id"
            value={inputs.py_id}
            onChange={(e) => setInputs((prev) => ({ ...prev, py_id: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          >
            <option value="">Select Type</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="execution_date" className="block text-sm font-medium text-gray-700">
            Execution Date {isFieldRequired('execution_date') && <span className="text-red-500">*</span>}
          </label>
          <input
            id="execution_date"
            type="text"
            value={inputs.execution_date}
            onChange={(e) => setInputs((prev) => ({ ...prev, execution_date: e.target.value }))}
            required={isFieldRequired('execution_date')}
            //pattern='[0-9]{4}-[0-9]{2}-[0-9]{2}'
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm font-mono"
            placeholder='yyyy-mm-dd'
          />
        </div>

        <div>
          <label htmlFor="input_1" className="block text-sm font-medium text-gray-700">
            Input 1 {isFieldRequired('input_1') && <span className="text-red-500">*</span>}
          </label>
          <input
            id="input_1"
            type="text"
            value={inputs.input_1}
            onChange={(e) => setInputs((prev) => ({ ...prev, input_1: e.target.value }))}
            required={isFieldRequired('input_1')}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm font-mono"
          />
        </div>

        <div>
          <label htmlFor="input_2" className="block text-sm font-medium text-gray-700">
            Input 2 {isFieldRequired('input_2') && <span className="text-red-500">*</span>}
          </label>
          <input
            id="input_2"
            type="text"
            value={inputs.input_2}
            onChange={(e) => setInputs((prev) => ({ ...prev, input_2: e.target.value }))}
            required={isFieldRequired('input_2')}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm font-mono"
          />
        </div>

        <button type='submit' className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'>
          Schedule Execution
        </button>
      </form>
    </div>
  );
} 