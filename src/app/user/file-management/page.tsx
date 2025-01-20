'use client';

import { useState } from 'react';
import { CsvSection } from './components/CsvSection';
import { YamlSection } from './components/YamlSection';
import { ProjectPySection } from './components/ProjectPySection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FileManagementPage() {
  const [selectedProject, setSelectedProject] = useState('');

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">File Management</h1>

      <Tabs defaultValue="csv" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="csv">CSV Files</TabsTrigger>
          <TabsTrigger value="yaml">YAML Files</TabsTrigger>
          <TabsTrigger value="project-py">Project Python Files</TabsTrigger>
        </TabsList>

        <TabsContent value="csv">
          <CsvSection 
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
          />
        </TabsContent>

        <TabsContent value="yaml">
          <YamlSection 
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
          />
        </TabsContent>


        <TabsContent value="project-py">
          <ProjectPySection 
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 