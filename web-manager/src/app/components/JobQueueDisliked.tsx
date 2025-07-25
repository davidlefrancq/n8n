'use client';

import { IJobEntity } from "@/types/IJobEntity";
import { useAppDispatch, useAppSelector } from "../store";
import { JobQueueEnum } from "@/constants/JobQueueEnum";
import { RepositoryFactory } from "../dal/RepositoryFactory";
import { useEffect, useRef, useState } from "react";
import { setDislikedJobs, setDislikedSkip, setDislikedCounter, setJobSelected } from "../store/jobsReducer";
import { addAlert } from "../store/alertsReducer";
import { MessageType } from "@/types/MessageType";
import JobModal from "./JobModal";
import JobTable from "./JobTable";

const jobRepository = RepositoryFactory.getInstance().getJobRepository();

let firstLoad = true;

export default function JobQueueDisliked() {
  const dispatch = useAppDispatch()
  const { dislikedJobs, jobQueueSelected, dislikedLimit: limit, dislikedSkip: skip, jobSelected } = useAppSelector(state => state.jobsReducer)

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const addJobs = (newJobs: IJobEntity[]) => {
    // Jobs filtered without newJobs
    const filteredJobs = dislikedJobs.filter(job => !newJobs.some(newJob => newJob._id === job._id));
    // Persist in the store
    dispatch(setDislikedJobs([...filteredJobs, ...newJobs]));
    dispatch(setDislikedSkip(skip + newJobs.length));
    // Disable the loader if there are no more jobs from load
    if (newJobs.length < limit) {
      setHasMore(false);
    }
  }

  const loadDislikedJobs = async () => {
    const data = await jobRepository.getAll({ filter: { preference: 'dislike' }, limit, skip });
    if (data) {
      addJobs(data);
    }
  }

  const loadDislikedJobsCounter = () => {
    jobRepository.getJobsDislikedCounter().then(count => {
      if (count >= 0) {
        dispatch(setDislikedCounter(count));
      } else {
        handleAddError('Failed to load disliked jobs counter.', 'error');
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

  // Load the first batch of jobs
  useEffect(() => {
    if (firstLoad && jobQueueSelected === JobQueueEnum.Disliked) {
      firstLoad = false;
      loadDislikedJobsCounter()
      loadDislikedJobs().then(() => {}).catch(err => {
        handleAddError(err.message, 'error');
      });
    }
  }, [jobQueueSelected]);

  useEffect(() => {
    if (jobQueueSelected !== JobQueueEnum.Disliked || !loaderRef.current || !hasMore || isFetching) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setIsFetching(true);
          loadDislikedJobs()
            .catch(err => handleAddError(err.message, 'error'))
            .finally(() => setIsFetching(false));
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loaderRef, hasMore, isFetching, skip]);

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 mt-1 ${jobQueueSelected === JobQueueEnum.Disliked ? '' : 'hidden'}`}>
      
      <JobTable jobs={dislikedJobs} onView={(job: IJobEntity) => dispatch(setJobSelected(job))} />

      <div ref={loaderRef} className="h-10"></div>
      <div className="text-center text-sm text-gray-400 mt-2 mb-6">
        {!hasMore && "No more disliked job"}
        {isFetching && hasMore && "Loading..."}
      </div>

      { jobSelected ? <JobModal onClose={() => dispatch(setJobSelected(null))} /> : null }
    </div>
  );
}