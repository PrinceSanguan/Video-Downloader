import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Register() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
            <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
                <h1 className="text-center text-2xl font-bold text-gray-800">Create an Account</h1>

                <form method="POST" action="/register" className="space-y-4">
                    {/* Name Field */}
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input type="text" id="name" name="name" required />
                    </div>

                    {/* Email Field */}
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input type="email" id="email" name="email" required />
                    </div>

                    {/* Password Field */}
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input type="password" id="password" name="password" required />
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                        <Input type="password" id="password_confirmation" name="password_confirmation" required />
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full">
                        Register
                    </Button>
                </form>
            </div>
        </div>
    );
}
