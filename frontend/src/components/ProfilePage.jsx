import TopBar from './TopBar';
import { mockCurrentUser } from '../utils/mockData';

export default function ProfilePage() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopBar />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile</h1>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                {mockCurrentUser.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{mockCurrentUser}</h2>
                <p className="text-gray-500">clearcam.com</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value="clearcam.com"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value="Analyst"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

