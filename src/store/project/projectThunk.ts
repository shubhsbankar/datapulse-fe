import { createAsyncThunk } from '@reduxjs/toolkit';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { Project, ProjectBase, ProjectAssign, ProjectAssignBase } from '@/types/project';
import { isSuccessful } from '@/utils/helpers';
import { setProjects, setProjectAssigns, setAssignHistory } from './projectSlice';

// GET /projects/all
export const getAllProjectsAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
  'project/getAllProjects',
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const response = await fetch(`${backendLink}/project/all`, {
        headers: {
          'Authorization': `Bearer ${state.auth.token}`
        }
      });

      const jsonResponse = await response.json();
      if (isSuccessful(jsonResponse.status)) {
        console.log('Projects:', jsonResponse.data);
        dispatch(setProjects(jsonResponse.data));
        return jsonResponse;
      }
      return rejectWithValue(jsonResponse as ErrorResponse);
    } catch (error) {
      console.error(error);
      return rejectWithValue({ message: 'Failed to fetch projects' });
    }
  }
);

// GET /project/{project_id}
export const getProjectByIdAsync = createAsyncThunk<any, number, { rejectValue: ErrorResponse }>(
  'project/getProjectById',
  async (projectId, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const response = await fetch(`${backendLink}/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${state.auth.token}`
        }
      });

      const jsonResponse = await response.json();
      if (isSuccessful(jsonResponse.status)) {
        return jsonResponse;
      }
      return rejectWithValue(jsonResponse as ErrorResponse);
    } catch (error) {
      console.error(error);
      return rejectWithValue({ message: 'Failed to fetch project' });
    }
  }
);

// GET /project/assign/all
export const getAllProjectAssignmentsAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
  'project/getAllAssignments',
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const response = await fetch(`${backendLink}/project/assign/all`, {
        headers: {
          'Authorization': `Bearer ${state.auth.token}`
        }
      });

      const jsonResponse = await response.json();
      if (isSuccessful(jsonResponse.status)) {
        dispatch(setProjectAssigns(jsonResponse.data));
        
        // const assignedProjects = state.project.projects.filter((project: Project) => {
        //   return jsonResponse.data.some((assign: ProjectAssign) => assign.projectshortname === project.projectshortname && assign.is_active);
        // });
        // dispatch(setProjects(assignedProjects));
        // console.log('Assigned projects:', assignedProjects);
        return jsonResponse;
      }

      return rejectWithValue(jsonResponse as ErrorResponse);
    } catch (error) {
      console.error(error);
      return rejectWithValue({ message: 'Failed to fetch project assignments' });
    }
  }
);

// POST /project/create
export const createProjectAsync = createAsyncThunk<any, ProjectBase, { rejectValue: ErrorResponse }>(
  'project/create',
  async (projectData, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const response = await fetch(`${backendLink}/project/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.auth.token}`
        },
        body: JSON.stringify(projectData)
      });

      const jsonResponse = await response.json();
      if (isSuccessful(jsonResponse.status)) {
        dispatch(getAllProjectsAsync());
        return jsonResponse;
      }
      return rejectWithValue(jsonResponse as ErrorResponse);
    } catch (error) {
      console.error(error);
      return rejectWithValue({ message: 'Failed to create project' });
    }
  }
);

// POST /project/assign/create
export const createProjectAssignmentAsync = createAsyncThunk<any, ProjectAssignBase, { rejectValue: ErrorResponse }>(
  'project/createAssignment',
  async (assignData, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const response = await fetch(`${backendLink}/project/assign/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.auth.token}`
        },
        body: JSON.stringify(assignData)
      });

      const jsonResponse = await response.json();
      if (isSuccessful(jsonResponse.status)) {
        return jsonResponse;
      }
      return rejectWithValue(jsonResponse as ErrorResponse);
    } catch (error) {
      console.error(error);
      return rejectWithValue({ message: 'Failed to create project assignment' });
    }
  }
);

// PUT /project/{project_id}
export const updateProjectAsync = createAsyncThunk<any, { projectId: number; projectData: ProjectBase }, { rejectValue: ErrorResponse }>(
  'project/update',
  async ({ projectId, projectData }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const response = await fetch(`${backendLink}/project/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.auth.token}`
        },
        body: JSON.stringify(projectData)
      });

      const jsonResponse = await response.json();
      if (isSuccessful(jsonResponse.status)) {
        return jsonResponse;
      }
      return rejectWithValue(jsonResponse as ErrorResponse);
    } catch (error) {
      console.error(error);
      return rejectWithValue({ message: 'Failed to update project' });
    }
  }
);

// PUT /project/assign/{assign_id}
export const updateProjectAssignmentAsync = createAsyncThunk<any, { assignId: number; assignData: ProjectAssignBase }, { rejectValue: ErrorResponse }>(
  'project/updateAssignment',
  async ({ assignId, assignData }, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const response = await fetch(`${backendLink}/project/assign/${assignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.auth.token}`
        },
        body: JSON.stringify(assignData)
      });

      const jsonResponse = await response.json();
      dispatch(getAllProjectAssignmentsAsync());
      if (isSuccessful(jsonResponse.status)) {
        return jsonResponse;
      }
      return rejectWithValue(jsonResponse as ErrorResponse);
    } catch (error) {
      console.error(error);
      return rejectWithValue({ message: 'Failed to update project assignment' });
    }
  }
);

// Add this new thunk for assignment history
export const getAssignHistoryAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
  'project/getAssignHistory',
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const response = await fetch(`${backendLink}/project/assign/history`, {
        headers: {
          'Authorization': `Bearer ${state.auth.token}`
        }
      });

      const jsonResponse = await response.json();
      if (isSuccessful(jsonResponse.status)) {
        dispatch(setAssignHistory(jsonResponse.data));
        return jsonResponse;
      }
      return rejectWithValue(jsonResponse as ErrorResponse);
    } catch (error) {
      console.error(error);
      return rejectWithValue({ message: 'Failed to fetch assignment history' });
    }
  }
);
