import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/profile', label: 'Profile', icon: '👤' },
  { path: '/logout', label: 'Logout', icon: '🚪' },
];

export default function NavSidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">ClearCam</h2>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

