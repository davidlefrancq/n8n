'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RepositoryFactory } from "../dal/RepositoryFactory";
import { useAppDispatch, useAppSelector } from "../store";
import { IJobEntity } from "@/types/IJobEntity";
import { setUnratedJobs, setUnratedSkip, removeUnratedJob, setUnratedCounter, addLikedJob, addDislikedJob } from "../store/jobsReducer";
import {  } from "../store/n8nReducer";
import JobCard from "./JobCard";
import { addAlert } from "../store/alertsReducer";
import { MessageType } from "@/types/MessageType";
import { JobQueueEnum } from "@/constants/JobQueueEnum";

const jobRepository = RepositoryFactory.getInstance().getJobRepository();

let firstLoad = true;

export default function JobQueueUnrated() {
  const dispatch = useAppDispatch()
  const { unratedJobs: jobs, jobQueueSelected, uratedLimit: limit, unratedSkip: skip, unratedCounter} = useAppSelector(state => state.jobsReducer)
  const { franceTravailStarted, googleAlertsStarted, linkedInStarted } = useAppSelector(state => state.n8nReducer)

  const [jobsUnrated, setJobsUnrated] = useState<IJobEntity[]>([]);
  const [jobTargeted, setJobTargeted] = useState<IJobEntity | null>(null);
  const [inLoading, setInLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const addJobs = (newJobs: IJobEntity[]) => {
    // jobs filtered without newJobs
    const filteredJobs = jobs.filter(job => !newJobs.some(newJob => newJob._id === job._id));
    // persist in the store
    dispatch(setUnratedJobs([...filteredJobs, ...newJobs]));
    dispatch(setUnratedSkip(skip + newJobs.length));
  }

  const loadUnratedJobs = async () => {
    if (!inLoading && hasMore) {
      setInLoading(true);
      try {
        const data = await jobRepository.getAll({ filter: { preference: 'null' }, limit, skip });
        if (data && data.length > 0) {
          addJobs(data);
          setInLoading(false);
        } else if (data && data.length === 0) {
          setInLoading(false);
          setHasMore(false);
        } else {
          console.log({ data })
          setInLoading(false);
          handleAddError('Failed to load unrated jobs.', 'error');
        }
      } catch (error) {
        console.error(error);
        setInLoading(false);
        handleAddError('Failed to load unrated jobs.', 'error');
      }
    }
  }

  const loadUnratedJobsCounter = () => {
    jobRepository.getJobsUnratedCounter().then(count => {
      if (count >= 0) {
        dispatch(setUnratedCounter(count));
      } else {
        handleAddError('Failed to load unrated jobs counter.', 'error');
      }
    }).catch(err => {
      handleAddError(err.message, 'error');
    })
  }

  const handleAddError = (message: string, type: MessageType) => {
    const errorMessage = {
      date: new Date().toISOString(),
      message,
      type,
    };
    dispatch(addAlert(errorMessage));
  }

  const handleLike = async (job: IJobEntity) => {
    try {
      await saveUpdatedJobs({ job: { _id: job._id, preference: 'like' } });
      dispatch(removeUnratedJob(job._id.toString()));
      dispatch(addLikedJob(job));
    } catch (error) {
      console.error(error);
      handleAddError('Failed to like job.', 'error');
    }
  };

  const handleDislike = async (job: IJobEntity) => {
    try { 
      await saveUpdatedJobs({ job: { _id: job._id, preference: 'dislike', interest_indicator: '🔴' } });
      dispatch(removeUnratedJob(job._id.toString()));
      dispatch(addDislikedJob(job));
    } catch (error) {
      console.error(error);
      handleAddError('Failed to dislike job.', 'error');
    }
  };

  const saveUpdatedJobs = async ({ job }: { job: Partial<IJobEntity> }) => {
    let response: IJobEntity | null = null
    const { _id, ...jobRest } = job;
    if (_id) {
      try {
        response = await jobRepository.update(_id.toString(), jobRest);
      } catch (err) {
        let msg = 'Failed to update job.';
        if (err instanceof Error) msg = err.message;
        handleAddError(msg, 'error');
      }
    }
    return response;
  }

  // Load the first batch of jobs
  useEffect(() => {
    if (firstLoad) {
      firstLoad = false;
      loadUnratedJobsCounter()
      loadUnratedJobs().then(() => {}).catch(err => {
        handleAddError(err.message, 'error');
      });
    }
  }, []);

  // Load more when n8n workflows are finished
  useEffect(() => {
    if (!firstLoad) {
      if (!franceTravailStarted && !googleAlertsStarted && !linkedInStarted) {
        loadUnratedJobs().then(() => {}).catch(err => {
          handleAddError(err.message, 'error');
        });
      }
    }
  }, [franceTravailStarted, googleAlertsStarted, linkedInStarted]);

  // Update jobsUnrated list from jobs
  useEffect(() => {
    setJobsUnrated(jobs.filter(job => job.preference === undefined || job.preference === null));
  }, [jobs]);

  // Update jobTargeted when jobsUnrated changes
  useEffect(() => {
    if (jobsUnrated.length > 0) {
      setJobTargeted(jobsUnrated[0]);
    } else {
      setJobTargeted(null);
      loadUnratedJobs().then(() => {}).catch(err => {
        handleAddError(err.message, 'error');
      });
    }
  }, [jobsUnrated]);

  useEffect(() => {

  }, [unratedCounter]);

  return (      
    <div className={`grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 overflow-x-hidden ${jobQueueSelected === JobQueueEnum.Unrated ? '' : 'hidden'}`}>
      {/* { jobTargeted ? <JobCard key={jobTargeted._id.toString()} job={jobTargeted} onLike={handleLike}  onDislike={handleDislike} /> : null } */}

      <AnimatePresence mode="wait">
        {jobTargeted && (
          <motion.div
            key={jobTargeted._id.toString()}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <JobCard
              job={jobTargeted}
              onLike={handleLike}
              onDislike={handleDislike}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-center w-full h-full">
        <span className="text-lg font-semibold text-gray-500">{unratedCounter ? unratedCounter : 'No more offers.'}</span>
      </div>
    </div>      
  );
}