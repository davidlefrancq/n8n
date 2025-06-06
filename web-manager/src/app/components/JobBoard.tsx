'use client';

import { useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Lora } from "next/font/google";
import { useAppDispatch, useAppSelector } from '@/app/store';
import { removeNotification } from '@/app/store/notificationsReducer';
import BtnLoading from './BtnLoading';
import NotificationsPanel from './NotificationsPanel';
import Link from 'next/link';
import ErrorsPanel from './ErrorsPanel';
import N8NWorkflowPanel from './N8NWorkflowPanel';
import JobQueuePanel from './JobQueuePanel';

const lora = Lora({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export default function JobBoard() {
  const dispatch = useAppDispatch()
  const { notifications } = useAppSelector(state => state.notificationsReducer)

  const [startedFtWorkflows, setStartedFtWorkflows] = useState(false);

  const handleRemoveNotification = (id: number) => {
    dispatch(removeNotification(id));
  }

  return (
    <div className="w-full mx-0 p-3">
      <div className="flex justify-between items-center pt-2 ms-2 pe-2 pb-8 mb-1 border-b border-gray-200">
        {/* App Name */}
        <div className="flex items-center gap-0">
          <img src="icon-192-jobby-persona-logo-rounded.png" alt="Job Board Logo" className="h-14 w-14 rounded-full" />
          <h1 className={`${lora.className} text-3xl font-bold text-gray-800`}>Jobby</h1>
        </div>
        
        {/* Actions bar */}
        <div className="flex items-center gap-2">
          
          {/* Worflows Button */}
          <BtnLoading
            title={<RefreshCcw size={18} />}
            width={'40px'}
            loading={startedFtWorkflows}
            onClick={() => setStartedFtWorkflows(!startedFtWorkflows)}
          />
          
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

      <N8NWorkflowPanel started={startedFtWorkflows} onFinish={() => setStartedFtWorkflows(false)} />
      <ErrorsPanel />
      <JobQueuePanel />
    </div>
  );
}
