'use client';

import { Datastore } from '@/types/datastore';
import { TabConfig, TABS } from '@/types/datastoreTabs';
import { cn } from '@/lib/utils';
import { BasicConnectionTab } from './tabs/BasicConnectionTab';
import { RedshiftTab } from './tabs/RedshiftTab';
import { BigQueryTab } from './tabs/BigQueryTab';
import { SnowflakeTab } from './tabs/SnowflakeTab';
import { KafkaTab } from './tabs/KafkaTab';
import { FileStoreTab } from './tabs/FileStoreTab';

interface TabContainerProps {
  activeTab: TabConfig['id'];
  setActiveTab: (tab: TabConfig['id']) => void;
  datastore: Datastore;
  onChange: (field: keyof Datastore, value: string) => void;
  onAddCustomField?: (columnName: string, value: string) => void;
}

export function TabContainer({ 
  activeTab, 
  setActiveTab, 
  datastore, 
  onChange,
  onAddCustomField 
}: TabContainerProps) {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BasicConnectionTab datastore={datastore} onChange={onChange} />;
      case 'filestore':
        return <FileStoreTab datastore={datastore} onChange={onChange} />;
      case 'redshift':
        return <RedshiftTab datastore={datastore} onChange={onChange} />;
      case 'bigquery':
        return <BigQueryTab datastore={datastore} onChange={onChange} />;
      case 'snowflake':
        return <SnowflakeTab datastore={datastore} onChange={onChange} />;
      case 'kafka':
        return <KafkaTab datastore={datastore} onChange={onChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
              title={tab.description}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-4">
        {renderTabContent()}
      </div>
    </div>
  );
} 