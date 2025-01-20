"use client";

import { Rs, Rt } from "@/types/userfeat";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createStrAsync } from "@/store/userfeat/strThunks";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface StrFormProps {
  rsRecords: Rs[];
  rtRecords: Rt[];
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  selectedDataProduct: string;
  setSelectedDataProduct: (product: string) => void;
  selectedDataset: string;
  setSelectedDataset: (dataset: string) => void;
}

export function StrForm({
  rsRecords,
  rtRecords,
  selectedProject,
  setSelectedProject,
}: StrFormProps) {
  const dispatch = useAppDispatch();

  // Separate states for S1 and T1
  const [selectedS1DataProduct, setSelectedS1DataProduct] = useState("");
  const [selectedS1Dataset, setSelectedS1Dataset] = useState("");
  const [selectedT1DataProduct, setSelectedT1DataProduct] = useState("");
  const [selectedT1Dataset, setSelectedT1Dataset] = useState("");

  // Get selected records using separate states
  const selectedRs = rsRecords.find(
    (rs) =>
      rs.projectshortname === selectedProject &&
      rs.dpname === selectedS1DataProduct &&
      rs.srcdataset === selectedS1Dataset
  );

  const selectedRt = rtRecords.find(
    (rt) =>
      rt.projectshortname === selectedProject &&
      rt.dpname === selectedT1DataProduct &&
      rt.tgtdataset === selectedT1Dataset
  );

  // Get unique project names
  const {projectAssigns} = useAppSelector(state => state.project);
    const isProjectAssignedAndActive = (p: string) => projectAssigns.some(project => project.is_active && project.projectshortname === p);
  const uniqueProjects = Array.from(
    new Set(rsRecords.map((r) => r.projectshortname))
  ).filter(isProjectAssignedAndActive);

  // Separate filters for S1 and T1
  const availableS1Dps = rsRecords
    .filter((r) => r.projectshortname === selectedProject)
    .map((r) => r.dpname)
    .filter((value, index, self) => self.indexOf(value) === index);

  const availableS1Ds = rsRecords
    .filter(
      (r) =>
        r.projectshortname === selectedProject &&
        r.dpname === selectedS1DataProduct
    )
    .map((r) => r.srcdataset)
    .filter((value, index, self) => self.indexOf(value) === index);

  const availableT1Dps = rtRecords
    .filter((r) => r.projectshortname === selectedProject)
    .map((r) => r.dpname)
    .filter((value, index, self) => self.indexOf(value) === index);

  const availableT1Ds = rtRecords
    .filter(
      (r) =>
        r.projectshortname === selectedProject &&
        r.dpname === selectedT1DataProduct
    )
    .map((r) => r.tgtdataset)
    .filter((value, index, self) => self.indexOf(value) === index);

  // Validation for matching dropdowns
  const validateDropdowns = (): boolean => {
    if (!selectedRs || !selectedRt) {
      toast.error("Please select both RS and RT configurations");
      return false;
    }

    const s1Keys = parseInt(selectedRs.bkeys || "0");
    const t1Keys = parseInt(selectedRt.bkeys || "0");

    if (s1Keys !== t1Keys) {
      toast.error(
        `Number of keys must match: S1 has ${s1Keys} keys while T1 has ${t1Keys} keys`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDropdowns()) return;
    try {
      const payload = {
        projectshortname: selectedProject,
        srctgthash: `${selectedProject}-${selectedS1DataProduct}-${selectedS1Dataset}-${selectedT1DataProduct}-${selectedT1Dataset}-r`,
        srchash: `${selectedS1DataProduct}-${selectedS1Dataset}`,
        tgthash: `${selectedT1DataProduct}-${selectedT1Dataset}`,
        rtype: null,
        rdata: null,
        rfield: null,
        hr_exec: null,
        createdate: new Date().toISOString(),
        rsbkeys: selectedRs?.bkeys,
        rtbkeys: selectedRt?.bkeys,
      };

      await dispatch(createStrAsync(payload)).unwrap();
      toast.success("STR definition created successfully");

      // Reset form
      setSelectedS1DataProduct("");
      setSelectedS1Dataset("");
      setSelectedT1DataProduct("");
      setSelectedT1Dataset("");
    } catch (error: any) {
      toast.error(error.message || "Failed to create STR definition");
    }
  };

  // Get validation status
  const getValidationStatus = () => {
    if (!selectedProject) return undefined;

    const validationResults = [];
    let isValid = true;

    // Check number of data product options
    const s1DpCount = availableS1Dps.length;
    const t1DpCount = availableT1Dps.length;

    if (s1DpCount !== t1DpCount) {
      validationResults.push({
        isValid: true,
        message: `Data Product options mismatch: S1 has ${s1DpCount} options while T1 has ${t1DpCount} options`,
      });
    } else {
      validationResults.push({
        isValid: true,
        message: `Data Product options match: Both have ${s1DpCount} options`,
      });
    }

    // Check number of dataset options if data products are selected
    if (selectedS1DataProduct && selectedT1DataProduct) {
      const s1DsCount = availableS1Ds.length;
      const t1DsCount = availableT1Ds.length;

      if (s1DsCount !== t1DsCount) {
        // isValid = false;
        validationResults.push({
          isValid: true,
          message: `Dataset options mismatch: S1 has ${s1DsCount} options while T1 has ${t1DsCount} options`,
        });
      } else {
        validationResults.push({
          isValid: true,
          message: `Dataset options match: Both have ${s1DsCount} options`,
        });
      }
    }

    // Check column selection mode if both RS and RT are selected
    if (selectedRs && selectedRt) {
      const s1SelectAll = !selectedRs.srctabfields;
      const t1SelectAll = !selectedRt.tgttabfields;

      if (s1SelectAll !== t1SelectAll) {
        validationResults.push({
          isValid: true,
          message: `Column selection mode mismatch: S1 (${s1SelectAll ? "All" : "Multiple"
            }) ≠ T1 (${t1SelectAll ? "All" : "Multiple"})`,
        });
      } else {
        if (
          selectedRs.srctabfields &&
          selectedRt.tgttabfields &&
          selectedRs.srctabfields.toString() ===
          selectedRt.tgttabfields.toString()
        ) {
          validationResults.push({
            isValid: true,
            message: `Column selection mode match: Both using ${s1SelectAll ? "All" : "Multiple"
              } columns`,
          });
        } else {
          validationResults.push({
            isValid: true,
            message: `Column selection mismatch: S1 (${selectedRs.srctabfields?.join(
              ", "
            )}) ≠ T1 (${selectedRt.tgttabfields?.join(", ")})`,
          });
        }
      }
    }

    // Check number of bkeys
    if (selectedRs && selectedRt) {
      const s1BKeys = parseInt(selectedRs.bkeys || "0");
      const t1BKeys = parseInt(selectedRt.bkeys || "0");

      if (s1BKeys !== t1BKeys) {
        isValid = false;
        validationResults.push({
          isValid: false,
          message: `Number of BKeys mismatch: S1 has ${s1BKeys} keys while T1 has ${t1BKeys} keys`,
        });
      } else {
        validationResults.push({
          isValid: true,
          message: `Number of BKeys match: Both have ${s1BKeys} keys`,
        });
      }
    }

    return {
      isValid,
      results: validationResults,
      details: [
        "• Please ensure S1 bkeys count and its order tallies with T1 bkeys count and its order.",
        "• Please ensure S1 columns selected (all/multi) are same in count and order with T1 columns selected.",
      ],
    };
  };

  const validationStatus = getValidationStatus();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Define STR</h2>

      {/* Updated Validation Messages */}
      {validationStatus && (
        <div
          className={`mb-6 p-4 rounded-md ${validationStatus.isValid ? "bg-blue-50" : "bg-red-50"
            }`}
        >
          {validationStatus.results.map((result, index) => (
            <div
              key={index}
              className={`mb-2 ${result.isValid ? "text-blue-800" : "text-red-800"
                }`}
            >
              <p className="text-sm font-medium">{result.message}</p>
            </div>
          ))}
          <ul
            className={`ml-5 mt-3 text-sm ${validationStatus.isValid ? "text-blue-700" : "text-red-700"
              }`}
          >
            {validationStatus.details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Selection */}
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
              setSelectedS1DataProduct("");
              setSelectedS1Dataset("");
              setSelectedT1DataProduct("");
              setSelectedT1Dataset("");
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

        {/* S1 Selections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="s1dp"
              className="block text-sm font-medium text-gray-700"
            >
              S1 Data Product
            </label>
            <select
              id="s1dp"
              value={selectedS1DataProduct}
              onChange={(e) => {
                setSelectedS1DataProduct(e.target.value);
                setSelectedS1Dataset("");
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
              disabled={!selectedProject}
            >
              <option value="">Select S1 Data Product</option>
              {availableS1Dps.map((dp) => (
                <option key={dp} value={dp}>
                  {dp}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="t1dp"
              className="block text-sm font-medium text-gray-700"
            >
              T1 Data Product
            </label>
            <select
              id="t1dp"
              value={selectedT1DataProduct}
              onChange={(e) => {
                setSelectedT1DataProduct(e.target.value);
                setSelectedT1Dataset("");
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
              disabled={!selectedProject}
            >
              <option value="">Select T1 Data Product</option>
              {availableT1Dps.map((dp) => (
                <option key={dp} value={dp}>
                  {dp}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* T1 Selections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="s1ds"
              className="block text-sm font-medium text-gray-700"
            >
              S1 Dataset
            </label>
            <select
              id="s1ds"
              value={selectedS1Dataset}
              onChange={(e) => setSelectedS1Dataset(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
              disabled={!selectedS1DataProduct}
            >
              <option value="">Select S1 Dataset</option>
              {availableS1Ds.map((ds) => (
                <option key={ds} value={ds}>
                  {ds}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="t1ds"
              className="block text-sm font-medium text-gray-700"
            >
              T1 Dataset
            </label>
            <select
              id="t1ds"
              value={selectedT1Dataset}
              onChange={(e) => setSelectedT1Dataset(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
              disabled={!selectedT1DataProduct}
            >
              <option value="">Select T1 Dataset</option>
              {availableT1Ds.map((ds) => (
                <option key={ds} value={ds}>
                  {ds}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
            >
              S1 BKeys
            </label>
            <select
              value=""
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              disabled
            >
              <option value="">{selectedRs?.bkeys || "Number of BKeys in S1"}</option>
            </select>
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700"
            >
              T1 BKeys
            </label>
            <select
              value=""
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              disabled
            >
              <option value="">{selectedRt?.bkeys || "Number of BKeys in S1"}</option>
            </select>
          </div>

        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            disabled={validationStatus && !validationStatus.isValid}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create STR
          </button>
        </div>
      </form>
    </div>
  );
}
