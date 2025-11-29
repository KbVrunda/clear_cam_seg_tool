import { mockCurrentProject, mockCurrentUser } from '../utils/mockData';

export default function TopBar() {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-gray-800">{mockCurrentProject}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {mockCurrentUser.charAt(0)}
          </div>
          <span className="text-gray-700">{mockCurrentUser}</span>
        </div>
      </div>
    </div>
  );
}

