import { useEffect, useRef, useState } from "react";
import { RepositoryFactory } from "../dal/RepositoryFactory";
import { useAppDispatch, useAppSelector } from "../store";
import { setCvs, setCvsCounter, setCvsSkip, setSelectedCvId } from "../store/cvsReducer";
import { addAlert } from "../store/alertsReducer";
import { MessageType } from "@/types/MessageType";
import { ICvEntity } from "@/types/ICvEntity";
import CVFormEdit from "./CVFormEdit";
import CvTable from "./CvTable";

const cvRepository = RepositoryFactory.getInstance().getCvRepository();

let firstLoad = true;

export default function CVPanel() {
  const dispatch = useAppDispatch()
  const { cvs, cvsLimit, cvsSkip, selectedCvId } = useAppSelector(state => state.cvsReducer)

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedCv, setSelectedCv] = useState<ICvEntity | undefined>(undefined);

  const addCvs = (newCvs: ICvEntity[]) => {
    // Cvs filtered without newCvs
    const filteredCvs = cvs.filter(cv => !newCvs.some(newCv => newCv._id === cv._id));
    // Persist in the store
    dispatch(setCvs([...filteredCvs, ...newCvs]));
    dispatch(setCvsSkip(cvsSkip + newCvs.length));
    // Disable the loader if there are no more cvs from load
    if (newCvs.length < cvsLimit) {
      setHasMore(false);
    }
  }

  const loadCvs = async () => {
    if (!isFetching) {
      setIsFetching(true);
      try {
        const data = await cvRepository.getAll(cvsLimit, cvsSkip)
        if (data && data.length > 0) {
          addCvs(data);
        } else {
          setHasMore(false);
        }
      } catch (err) {
        if (err && (err as Error).message) handleAddError((err as Error).message, 'error');
        else handleAddError(String(err), 'error');
      } finally {
        setIsFetching(false);
      }
    }
  }

  const loadCvsCounter = () => {
    cvRepository.count().then(count => {
      if (count >= 0) {
        dispatch(setCvsCounter(count));
      } else {
        handleAddError('Failed to load CVs counter.', 'error');
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

  // Load the first batch of cvs
  useEffect(() => {
    if (firstLoad) {
      firstLoad = false;
      loadCvs().then(() => {}).catch(err => {
        handleAddError(err.message, 'error');
      });
      loadCvsCounter();
    }
  }, []);

  // Load more cvs
  useEffect(() => {
    if (!loaderRef.current || !hasMore || isFetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          setIsFetching(true);
          loadCvs().then(() => {
            setIsFetching(false);
          }).catch(err => {
            handleAddError(err.message, 'error');
            setIsFetching(false);
          });
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, isFetching, cvsLimit, cvsSkip]);

  useEffect(() => {
    if (selectedCvId) {
      setSelectedCv(cvs.find(cv => cv._id?.toString() === selectedCvId));
    } else {
      setSelectedCv(undefined);
    }
  }, [selectedCvId]);

  return (
    <div>
      <div className="flex justify-end mb-4">
        {!showNewForm && !selectedCv && (
          <button
            onClick={() => setShowNewForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            + Ajouter un CV
          </button>
        )}
      </div>

      {(showNewForm || selectedCv) && (
        <CVFormEdit cv={selectedCv} onClose={() => {
          setShowNewForm(false)
          dispatch(setSelectedCvId(null));
        }} />
      )}

      {(!showNewForm && !selectedCv) && (
        <>
          <CvTable cvs={cvs} />
          <div ref={loaderRef} className="h-10"></div>
          <div className="text-center text-sm text-gray-400 mt-2 mb-6">
            {!hasMore && "No more CV."}
            {isFetching && hasMore && "Loading..."}
          </div>
        </>
      )}

    </div>
  );
}
