import React from "react";

function Error404() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-9xl text-center font-bold leading-tight tracking-tight text-red-700">
        Error 404
      </h1>
      <h1 className="text-6xl text-center font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
        Not Found
      </h1>
    </div>
  );
}

export default Error404;
