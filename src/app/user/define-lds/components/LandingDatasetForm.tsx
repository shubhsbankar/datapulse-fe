"use client";

import { LandingDataset } from "@/types/userfeat";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAllProjectAssignmentsAsync } from "@/store/project/projectThunk";
import { useEffect } from "react";

interface LandingDatasetFormProps {
  dataset: LandingDataset;
  setLnddsshortname: (value: string) => void;
  comments: string;
  setComments: (value: string) => void;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onTest: () => Promise<void>;
  isTestSuccessful: boolean;
}

export function LandingDatasetForm({
  dataset,
  setLnddsshortname,
  comments,
  setComments,
  onInputChange,
  onSubmit,
  onTest,
  isTestSuccessful,
}: LandingDatasetFormProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getAllProjectAssignmentsAsync());
  }, [dispatch]);

  // useEffect(() => {
  //   const requiredFields = [
  //     "projectshortname",
  //     "srcdataproductshortname", 
  //     "srcdatasetshortname",
  //     "lnddataproductshortname",
  //     "lnddatasetshortname"
  //   ];

  //   const hasAllRequiredFields = requiredFields.every(
  //     (field) => dataset[field as keyof LandingDataset]
  //   );

  //   if (hasAllRequiredFields) {
  //     setLnddsshortname(dataset.projectshortname + "_" + dataset.srcdatasetshortname + "_" + dataset.srcdataproductshortname + "_" + dataset.lnddatasetshortname + "_" + dataset.lnddataproductshortname);
  //   }
  // }, [dataset, setLnddsshortname]);


  useEffect(() => {
    if (!dataset) return;
  
    const {
      projectshortname = '',
      srcdatasetshortname = '',
      srcdataproductshortname = '',
      lnddatasetshortname = '',
      lnddataproductshortname = ''
    } = dataset;
  
    if (isFormValid()) {
      setLnddsshortname(`${projectshortname}_${srcdatasetshortname}_${srcdataproductshortname}_${lnddatasetshortname}_${lnddataproductshortname}`);
    }
  }, [dataset]);

  const projectNames = useAppSelector((state) =>
    state.project.projectAssigns
      .filter((p) => p.useremail === state.user.currentUser?.useremail && p.is_active)
      .map((p) => p.projectshortname)
  );

  const srcdataproductNames = useAppSelector((state) =>
    Array.from(new Set(
      state.userfeat.dataset
        .filter((p) => p.projectshortname === dataset.projectshortname && (p.csvname === '' || p.csvname === null || p.csvname === undefined))
        .map((p) => p.dataproductshortname)
    ))
  );

  const srcdatasetNames = useAppSelector((state) =>
    Array.from(new Set(
      state.userfeat.dataset
        .filter((p) => p.projectshortname === dataset.projectshortname && (p.csvname === '' || p.csvname === null || p.csvname === undefined))
        .map((p) => p.datasetshortname)
    ))
  );

  const lnddataproductNames = useAppSelector((state) =>
    Array.from(new Set(
      state.userfeat.dataset
        .filter((p) => p.projectshortname === dataset.projectshortname && p.csvname !== '')
        .map((p) => p.dataproductshortname)
    ))
  );

  const lnddatasetNames = useAppSelector((state) =>
    Array.from(new Set(
      state.userfeat.dataset
        .filter((p) => p.projectshortname === dataset.projectshortname && p.csvname !== '')
        .map((p) => p.datasetshortname)
    ))
  );

  const isFormValid = () => {
    const requiredFields = [
      "projectshortname",
      "srcdataproductshortname",
      "srcdatasetshortname", 
      "lnddataproductshortname",
      "lnddatasetshortname"
    ];

    return requiredFields.every(
      (field) => dataset[field as keyof LandingDataset]
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Create New LDS</h2>
      <form
        onSubmit={onSubmit}
        //className="space-y-4 grid grid-cols-2 gap-4"
        className="space-y-4 flex flex-col gap-4"
      >
        {/* Basic fields similar to DatasetForm */}
        <div>
          <label
            htmlFor="projectshortname"
            className="mt-4 block text-sm font-medium text-gray-700"
          >
            Project
          </label>
          <select
            id="projectshortname"
            name="projectshortname"
            value={dataset.projectshortname}
            onChange={onInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select a project</option>
            {projectNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="srcdataproductshortname"
            className="block text-sm font-medium text-gray-700"
          >
            Source Data Product Name
          </label>
          {/* <input
            type="text"
            id="srcdataproductshortname"
            name="srcdataproductshortname"
            value={dataset.srcdataproductshortname || ''}
            onChange={onInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          /> */}
          <select
            id="srcdataproductshortname"
            name="srcdataproductshortname"
            value={dataset.srcdataproductshortname || ''}
            onChange={onInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select Source Data Product</option>
            {srcdataproductNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="srcdatasetshortname"
            className="block text-sm font-medium text-gray-700"
          >
            Source Dataset Name
          </label>
          {/* <input
            type="text"
            id="srcdatasetshortname"
            name="srcdatasetshortname"
            value={dataset.srcdatasetshortname || ''}
            onChange={onInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          /> */}
          <select
            id="srcdatasetshortname"
            name="srcdatasetshortname"
            value={dataset.srcdatasetshortname || ''}
            onChange={onInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select Source Dataset</option>
            {srcdatasetNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="lnddataproductshortname"
            className="block text-sm font-medium text-gray-700"
          >
            Landing Data Product Name
          </label>
          {/* <input
            type="text"
            id="lnddataproductshortname"
            name="lnddataproductshortname"
            value={dataset.lnddataproductshortname || ''}
            onChange={onInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          /> */}
          <select
            id="lnddataproductshortname"
            name="lnddataproductshortname"
            value={dataset.lnddataproductshortname || ''}
            onChange={onInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select Landing Data Product</option>
            {lnddataproductNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="lnddatasetshortname"
            className="block text-sm font-medium text-gray-700"
          >
            Landing Dataset Name
          </label>
          {/* <input
            type="text"
            id="lnddatasetshortname"
            name="lnddatasetshortname"
            value={dataset.lnddatasetshortname || ''}
            onChange={onInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          /> */}
          <select
            id="lnddatasetshortname"
            name="lnddatasetshortname"
            value={dataset.lnddatasetshortname || ''}
            onChange={onInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select Landing Dataset</option>
            {lnddatasetNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

      {/* Comments textarea */}
      <div>
        <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
          Comments
        </label>
        <textarea
          id="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          placeholder="Enter description of changes"
        />
      </div>

     
        {/* Test and Submit buttons */}
        <div className="col-span-2 flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onTest}
            disabled={!isFormValid()}
            className={cn(
              "inline-flex justify-center py-2 px-4 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
              isTestSuccessful
                ? "border-green-500 text-green-700 bg-green-50 hover:bg-green-100"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
              !isFormValid() && "opacity-50 cursor-not-allowed"
            )}
          >
            {isTestSuccessful ? "✓ Configuration Tested" : "Test Configuration"}
          </button>
          <button
            type="submit"
            disabled={!isTestSuccessful}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Landing Dataset
          </button>
        </div>
      </form>
    </div>
  );
}
