import React from 'react';
import { RoadmapViewer } from './components/RoadmapViewer';
import roadmapDataRaw from './data/course-roadmap.json';
import userProgressRaw from './data/user-progress.json';
import type { RoadmapData, UserProgressData } from './types';

// Cast the imported JSON to our defined type
const roadmapData = roadmapDataRaw as unknown as RoadmapData;
const progressData = userProgressRaw as unknown as UserProgressData;

function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <RoadmapViewer data={roadmapData} progressData={progressData} />
    </div>
  );
}

export default App;
