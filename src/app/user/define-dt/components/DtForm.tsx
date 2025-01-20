"use client";

import { Dataset } from "@/types/userfeat";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createDtgAsync } from "@/store/userfeat/dtgThunks";
import { toast } from "react-hot-toast";

interface DtFormProps {
  datasets: Dataset[];
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  selectedTargetDataProduct: string;
  setSelectedTargetDataProduct: (product: string) => void;
  selectedSourceDataProduct: string;
  setSelectedSourceDataProduct: (product: string) => void;
  selectedTargetDataset: string;
  setSelectedTargetDataset: (dataset: string) => void;
  selectedSourceDataset: string;
  setSelectedSourceDataset: (dataset: string) => void;
  testcoverageversion: string;
  setTestcoverageversion: (version: string) => void;
}

export function DtForm({ datasets, selectedProject, setSelectedProject, selectedTargetDataProduct, setSelectedTargetDataProduct, selectedSourceDataProduct, setSelectedSourceDataProduct, selectedTargetDataset, setSelectedTargetDataset, selectedSourceDataset, setSelectedSourceDataset, testcoverageversion, setTestcoverageversion }: DtFormProps) {
  const dispatch = useAppDispatch();
  const [comments, setComments] = useState("");
  const [dtshortname, setDtshortname] = useState("");
  const [yamlfilename, setYamlfilename] = useState("");
  const [currentDatasrcnum, setCurrentDatasrcnum] = useState(1);

  // Get unique project names from datasets
  const projects = useAppSelector(state=>state.project.projectAssigns.filter(pa=>pa.useremail==state.user.currentUser.useremail && pa.is_active).map(pa=>pa.projectshortname));
  const uniqueProjects = Array.from(new Set(projects))

  // Get data products for selected project
  const availableDataProducts = datasets
    .filter((d) => d.projectshortname === selectedProject)
    .map((d) => d.dataproductshortname)
    .filter((value, index, self) => self.indexOf(value) === index);

  // Get datasets for selected project and data product
  const availableTargetDatasets = datasets
    .filter(
      (d) =>
        d.projectshortname === selectedProject &&
        d.dataproductshortname === selectedTargetDataProduct
    )
    .map((d) => d.datasetshortname);

  const availableSourceDatasets = datasets
    .filter(
      (d) =>
        d.projectshortname === selectedProject &&
        d.dataproductshortname === selectedSourceDataProduct
    )
    .map((d) => d.datasetshortname);

  // Reset datasrcnum when left side selections change
  useEffect(() => {
    setCurrentDatasrcnum(1);
  }, [selectedProject, selectedTargetDataProduct, selectedTargetDataset, testcoverageversion]);

  // Update derived fields when selections change
  useEffect(() => {
    if (
      selectedProject &&
      selectedTargetDataProduct &&
      selectedTargetDataset &&
      testcoverageversion
    ) {
      const projectId = selectedProject.split("-")[0]; // Assuming format like "p5-projectname"
      const dtshort =
        `${projectId}-${selectedTargetDataProduct}-${selectedTargetDataset}-${testcoverageversion}-t`.toLowerCase();
      const yamlfile =
        `${projectId}-${selectedTargetDataProduct}-${selectedTargetDataset}-${testcoverageversion}.yaml`.toLowerCase();
      setDtshortname(dtshort);
      setYamlfilename(yamlfile);
    }
  }, [
    selectedProject,
    selectedTargetDataProduct,
    selectedTargetDataset,
    testcoverageversion,
  ]);

  const handleT1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !selectedTargetDataProduct || !selectedTargetDataset || !testcoverageversion) {
      toast.error("Please select all fields: Project, Target Data Product, Target Dataset, Test Coverage Version");
      return;
    }
    try {
      await dispatch(
        createDtgAsync({
          dtshortname,
          chkfilename: yamlfilename,
          projectshortname: selectedProject,
          datasetshortname: selectedTargetDataset,
          dataproductshortname: selectedTargetDataProduct,
          datasettype: "Target",
          testcoverageversion,
          comments,
          datasrcnum: "1", // T1 submission
        })
      ).unwrap();

      toast.success("T1 definition created successfully");
      // Don't reset form values as they're needed for S1
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create T1 definition");
    }
  };

  const handleS1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !selectedSourceDataProduct || !selectedSourceDataset || !testcoverageversion) {
      toast.error("Please select all fields: Project, Source Data Product, Source Dataset, Test Coverage Version");
      return;
    }
    try {
      await dispatch(
        createDtgAsync({
          dtshortname,
          chkfilename: yamlfilename,
          projectshortname: selectedProject,
          datasetshortname: selectedSourceDataset,
          dataproductshortname: selectedSourceDataProduct,
          testcoverageversion,
          datasettype: "Source",
          comments,
          datasrcnum: currentDatasrcnum.toString(), // Use current counter value
        })
      ).unwrap();

      toast.success("S1 definition created successfully");
      // Increment counter for next S1 submission
      setCurrentDatasrcnum(prev => prev + 1);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create S1 definition");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Define DT</h2>
      <form className="space-y-4">
        <div>
          <label
            htmlFor="project"
            className="block text-sm font-medium text-gray-700"
          >
            Project
          </label>
          <select
            id="project"
            value={selectedProject}
            onChange={(e) => {
              setSelectedProject(e.target.value);
              setSelectedTargetDataProduct("");
              setSelectedTargetDataset("");
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          >
            <option value="">Select Project</option>
            {uniqueProjects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-between gap-2">
          <div>
            <label
              htmlFor="targetDataProduct"
              className="block text-sm font-medium text-gray-700"
            >
              Target Data Product
            </label>
            <select
              id="targetDataProduct"
              value={selectedTargetDataProduct}
              onChange={(e) => {
                setSelectedTargetDataProduct(e.target.value);
                setSelectedTargetDataset("");
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
              disabled={!selectedProject}
            >
              <option value="">Select Target Data Product</option>
              {availableDataProducts.map((dp) => (
                <option key={dp} value={dp}>
                  {dp}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="sourceDataProduct"
              className="block text-sm font-medium text-gray-700"
            >
              Source Data Product
            </label>
            <select
              id="sourceDataProduct"
              value={selectedSourceDataProduct}
              onChange={(e) => {
                setSelectedSourceDataProduct(e.target.value);
                setSelectedSourceDataset("");
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
              disabled={!selectedProject}
            >
              <option value="">Select Source Data Product</option>
              {availableDataProducts.map((dp) => (
                <option key={dp} value={dp}>
                  {dp}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between gap-2">
          <div>
            <label
              htmlFor="targetDataset"
              className="block text-sm font-medium text-gray-700"
            >
              Target Dataset
            </label>
            <select
              id="targetDataset"
              value={selectedTargetDataset}
              onChange={(e) => setSelectedTargetDataset(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
              disabled={!selectedTargetDataProduct}
            >
              <option value="">Select Target Dataset</option>
              {availableTargetDatasets.map((ds) => (
                <option key={ds} value={ds}>
                  {ds}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="sourceDataset"
              className="block text-sm font-medium text-gray-700"
            >
              Source Dataset
            </label>
            <select
              id="sourceDataset"
              value={selectedSourceDataset}
              onChange={(e) => setSelectedSourceDataset(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
              disabled={!selectedSourceDataProduct}
            >
              <option value="">Select Source Dataset</option>
              {availableSourceDatasets.map((ds) => (
                <option key={ds} value={ds}>
                  {ds}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="testcoverageversion"
            className="block text-sm font-medium text-gray-700"
          >
            Test Coverage Version
          </label>
          <input
            type="text"
            id="testcoverageversion"
            value={testcoverageversion}
            onChange={(e) => setTestcoverageversion(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor="comments"
            className="block text-sm font-medium text-gray-700"
          >
            Comments (Optional)
          </label>
          <textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-between gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              DT Short Name
            </label>
            <input
              type="text"
              value={dtshortname}
              readOnly
              className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              YAML File Name
            </label>
            <input
              type="text"
              value={yamlfilename}
              readOnly
              className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="flex justify-between space-x-4">
          <button
            type="button"
            onClick={handleT1Submit}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Define T1
          </button>
          <button
            type="button"
            onClick={handleS1Submit}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Define S1
          </button>
        </div>
      </form>
    </div>
  );
}
