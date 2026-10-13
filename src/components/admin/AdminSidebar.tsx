import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Clock,
  Calendar,
  Megaphone,
  Mic,
  Tag,
  Users,
  MessageSquare,
  Mail,
  ListOrdered,
  Activity,
  Settings,
  Shield,
} from 'lucide-react';

interface AdminSidebarProps {
  pendingCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ pendingCount = 0 }) => {
  const links = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'All Articles', path: '/admin/articles', icon: FileText },
    {
      name: 'Pending Submissions',
      path: '/admin/submissions',
      icon: Clock,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    { name: 'Campus Events', path: '/admin/events', icon: Calendar },
    { name: 'Announcements', path: '/admin/announcements', icon: Megaphone },
    { name: 'Spotlight Interviews', path: '/admin/interviews', icon: Mic },
    { name: 'Categories', path: '/admin/categories', icon: Tag },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Comment Moderation', path: '/admin/comments', icon: MessageSquare },
    { name: 'Contact Messages', path: '/admin/messages', icon: Mail },
    { name: 'Newsletter Subscribers', path: '/admin/newsletter', icon: ListOrdered },
    { name: 'Activity Audit Logs', path: '/admin/activity-logs', icon: Activity },
    { name: 'System Settings & Reset', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
            Admin Panel
          </h2>
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            Control Center
          </span>
        </div>
      </div>

      <nav className="p-3 space-y-1 flex-1 overflow-y-auto text-xs font-semibold">
        {links.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <item.icon className="w-4 h-4 opacity-80" />
              <span>{item.name}</span>
            </div>

            {item.badge !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${item.badgeColor || 'bg-blue-600 text-white'}`}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
