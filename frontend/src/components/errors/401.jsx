import React from "react";

function Error401() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-9xl text-center font-bold leading-tight tracking-tight text-red-700">
        Error 401
      </h1>
      <h1 className="text-6xl text-center font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
        Unauthorized
      </h1>
    </div>
  );
}

export default Error401;
