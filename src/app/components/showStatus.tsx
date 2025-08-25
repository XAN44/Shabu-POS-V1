"use client";

import React from "react";

interface ShowStatusProps {
  error?: string;
  success?: string;
}

const ShowStatus: React.FC<ShowStatusProps> = ({ error, success }) => {
  if (!error && !success) return null;

  return (
    <div className="w-full max-w-md mx-auto my-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mb-2">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md">
          {success}
        </div>
      )}
    </div>
  );
};

export default ShowStatus;
