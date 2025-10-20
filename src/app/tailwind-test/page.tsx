"use client";

export default function TailwindTestPage() {
  // Button click handlers
  const handleBlueButtonClick = () => {
    alert("Blue button clicked!");
  };

  const handleGreenButtonClick = () => {
    alert("Green button clicked!");
  };

  const handleRedButtonClick = () => {
    alert("Red button clicked!");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold text-center text-gray-900">
                Tailwind CSS Test Page
              </h1>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <p className="text-blue-600 font-bold">
                  This text should be blue and bold if Tailwind is working.
                </p>
                <p className="italic text-green-500">
                  This text should be green and italic if Tailwind is working.
                </p>
                <p className="underline text-red-500">
                  This text should be red and underlined if Tailwind is working.
                </p>

                <div className="bg-yellow-200 p-4 rounded-lg border-2 border-yellow-500">
                  <p className="font-medium">
                    This is a yellow box with rounded corners and a border.
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleBlueButtonClick}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Blue Button
                  </button>
                  <button
                    onClick={handleGreenButtonClick}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Green Button
                  </button>
                  <button
                    onClick={handleRedButtonClick}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Red Button
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-purple-200 p-4 rounded">Grid Item 1</div>
                  <div className="bg-purple-300 p-4 rounded">Grid Item 2</div>
                  <div className="bg-purple-400 p-4 rounded">Grid Item 3</div>
                </div>

                <div className="mt-8 text-center">
                  <button
                    onClick={() => alert("Interactive test button clicked!")}
                    className="btn btn-primary"
                  >
                    Test Custom Button Class
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
