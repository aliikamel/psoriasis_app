import React from "react";

function Error403() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-9xl text-center font-bold leading-tight tracking-tight text-red-700">
        Error 403
      </h1>
      <h1 className="text-6xl text-center font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
        Forbidden
      </h1>
    </div>
  );
}

export default Error403;
