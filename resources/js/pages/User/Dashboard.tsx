import { Header } from '@/components/user/header'; // Import the Header component
import { Sidebar } from '@/components/user/sidebar'; // Import the Sidebar component

interface User {
    name: string;
    email: string;
}

interface DashboardProps {
    user: User;
}

export default function UserDashboard({ user }: DashboardProps) {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Pass user data to the Sidebar component */}
            <Sidebar user={user} />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Pass user data to the Header component */}
                <Header user={user} />

                {/* Dashboard Content */}
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Overview</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Welcome back, {user.name}! Here's what's happening with your business today.
                            </p>
                        </div>

                        {/* put here your logic */}
                    </div>
                </main>
            </div>
        </div>
    );
}
