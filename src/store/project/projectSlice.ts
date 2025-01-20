import { Project, ProjectAssign } from "@/types/project";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ProjectState = {
  projects: Project[];
  projectAssigns: ProjectAssign[];
  assignHistory: ProjectAssign[];
};

const initialState: ProjectState = {
  projects: [],
  projectAssigns: [],
  assignHistory: [],
};

export const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    setProjectAssigns: (state, action: PayloadAction<ProjectAssign[]>) => {
      state.projectAssigns = action.payload;
    },
    setAssignHistory: (state, action: PayloadAction<ProjectAssign[]>) => {
      state.assignHistory = action.payload;
    },
  },
});

export const { setProjects, setProjectAssigns, setAssignHistory } =
  projectSlice.actions;

export default projectSlice.reducer;
