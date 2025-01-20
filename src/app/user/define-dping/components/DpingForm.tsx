"use client";

import { Dataset } from "@/types/userfeat";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createDpingAsync } from "@/store/userfeat/dpingThunks";
import { toast } from "react-hot-toast";

interface DpingFormProps {
  datasets: Dataset[];
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  selectedDataProduct: string;
  setSelectedDataProduct: (product: string) => void;
}

export function DpingForm({
  datasets,
  selectedProject,
  setSelectedProject,
  selectedDataProduct,
  setSelectedDataProduct,
}: DpingFormProps) {
  const dispatch = useAppDispatch();
  const [selectedDataset, setSelectedDataset] = useState("");
  const [testcoverageversion, setTestcoverageversion] = useState("");
  const [comments, setComments] = useState("");
  const [dpingShortname, setDpingShortname] = useState("");
  const [htmlFilename, setHtmlFilename] = useState("");

  const projects = useAppSelector((state) =>
    state.project.projectAssigns
      .filter((pa) => pa.useremail == state.user.currentUser.useremail && pa.is_active)
      .map((pa) => pa.projectshortname)
  );
  // Get unique project names from datasets
  const uniqueProjects = Array.from(new Set(projects));
  // Get data products for selected project
  const availableDataProducts = datasets
    .filter((d) => d.projectshortname === selectedProject)
    .map((d) => d.dataproductshortname)
    .filter((value, index, self) => self.indexOf(value) === index);

  // Get datasets for selected project and data product
  const availableDatasets = datasets
    .filter(
      (d) =>
        d.projectshortname === selectedProject &&
        d.dataproductshortname === selectedDataProduct
    )
    .map((d) => d.datasetshortname);

  // Update derived fields when selections change
  useEffect(() => {
    if (selectedProject && selectedDataProduct && selectedDataset) {
      const projectId = selectedProject.split("-")[0]; // Assuming format like "p5-projectname"
      const dpshort =
        `${projectId}-${selectedDataProduct}-${selectedDataset}-p`.toLowerCase();
      const htmlfile =
        `${projectId}-${selectedDataProduct}-${selectedDataset}.html`.toLowerCase();
      setDpingShortname(dpshort);
      setHtmlFilename(htmlfile);
    }
  }, [selectedProject, selectedDataProduct, selectedDataset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(
        createDpingAsync({
          dpshortname: dpingShortname,
          htmlfilename: htmlFilename,
          projectshortname: selectedProject,
          datasetshortname: selectedDataset,
          dataproductshortname: selectedDataProduct,
        })
      ).unwrap();

      toast.success("DPing created successfully");
      // Reset form
      setSelectedProject("");
      setSelectedDataProduct("");
      setSelectedDataset("");
      setDpingShortname("");
      setHtmlFilename("");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create DPing");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Create New DPing
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
              setSelectedDataProduct("");
              setSelectedDataset("");
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

        <div>
          <label
            htmlFor="dataProduct"
            className="block text-sm font-medium text-gray-700"
          >
            Data Product
          </label>
          <select
            id="dataProduct"
            value={selectedDataProduct}
            onChange={(e) => {
              setSelectedDataProduct(e.target.value);
              setSelectedDataset("");
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
            disabled={!selectedProject}
          >
            <option value="">Select Data Product</option>
            {availableDataProducts.map((dp) => (
              <option key={dp} value={dp}>
                {dp}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="dataset"
            className="block text-sm font-medium text-gray-700"
          >
            Dataset
          </label>
          <select
            id="dataset"
            value={selectedDataset}
            onChange={(e) => setSelectedDataset(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
            disabled={!selectedDataProduct}
          >
            <option value="">Select Dataset</option>
            {availableDatasets.map((ds) => (
              <option key={ds} value={ds}>
                {ds}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create DPing
          </button>
        </div>
      </form>
    </div>
  );
}
