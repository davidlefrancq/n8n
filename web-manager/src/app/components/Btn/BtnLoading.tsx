'use client';

import { CSSProperties } from "react";
import { GrowingSpinner } from "../GrowingSpinner";

interface BtnLoadingProps {
  title: string | React.ReactNode;
  loading: boolean;
  width?: string;
  height?: string;
  rounded?: 'rounded-sm' | 'rounded-md' | 'rounded-lg' | 'rounded-xl' | 'rounded-full';
  isDisabled?: boolean;
  onClick: () => void;
}

export default function BtnLoading({
  title,
  loading,
  width = '150px',
  height = '40px',
  rounded = 'rounded-full',
  isDisabled = false,
  onClick
}: BtnLoadingProps) {
  const handleClick = () => {
    if (!loading) {
      onClick();
    }
  }

  let btnClassName = `text-white text-center items-center focus:ring-4 font-medium text-sm px-2.5 py-2.5 focus:outline-none caret-transparent ${rounded} transition-all duration-200 ease-in-out `;
  const notAllowed = 'bg-gray-500 cursor-not-allowed';
  switch (true) {
    case isDisabled:
      btnClassName += notAllowed;
      break;
    case loading:
      btnClassName += notAllowed;
      break;
    default:
      btnClassName += 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-300 cursor-pointer';
      break;
  }


  const btnStyle: CSSProperties = {
    cursor: 'pointer',
    width,
    height,
    display: 'flex',
    justifyContent: 'center',
  }
  if (loading) {
    btnStyle.cursor = '';
  }

  return (
    <button
      type="button"
      className={btnClassName}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!loading && !isDisabled) handleClick();
      }}
      style={btnStyle}
      disabled={loading || isDisabled}
    >
      {!loading ? title : <GrowingSpinner />}
    </button>
  );
}