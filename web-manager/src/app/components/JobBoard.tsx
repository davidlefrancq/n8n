'use client';

import { useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { removeNotification } from '@/app/store/notificationsReducer';
import BtnLoading from './BtnLoading';
import NotificationsPanel from './NotificationsPanel';
import Link from 'next/link';
import ErrorsPanel from './ErrorsPanel';
import N8NWorkflowPanel from './N8NWorkflowPanel';
import JobQueuePanel from './JobQueuePanel';


export default function JobBoard() {
  const dispatch = useAppDispatch()
  const { notifications } = useAppSelector(state => state.notificationsReducer)

  const [startedFtWorkflow, setStartedFtWorkflow] = useState(false);

  const handleRemoveNotification = (id: number) => {
    dispatch(removeNotification(id));
  }

  return (
    <div className="relative pb-12">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          {/* App Name */}
          <h1 className="text-4xl font-bold text-gray-800">Jobby</h1>
          
          {/* Actions bar */}
          <div className="flex items-center gap-2">
            
            {/* Worflows Button */}
            <BtnLoading title={<RefreshCcw size={18} />} width={'40px'} loading={startedFtWorkflow} onClick={() => setStartedFtWorkflow(!startedFtWorkflow)} />
            
            {/* N8N Button */}
            <Link
              href={"http://localhost:5678"}
              target="_blank"
              className="bg-red-400 text-white p-0 rounded-full opacity-75 hover:opacity-100"
            >
              <img src="n8n.png" alt="Rocket" className="w-10 h-10 rounded-full" />
            </Link>

            {/* Notifications Button */}
            <NotificationsPanel notifications={notifications} removeNotification={(id: number) => handleRemoveNotification(id)} />
          </div>
        </div>

        <N8NWorkflowPanel startedFtWorkflow={startedFtWorkflow} resetStartedFtWorkflow={() => setStartedFtWorkflow(false)} />
        <ErrorsPanel />
        <JobQueuePanel />

      </div>
    </div>
  );
}
