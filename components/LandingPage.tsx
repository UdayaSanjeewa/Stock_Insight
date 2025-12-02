'use client';

import { useState } from 'react';
import { Building2, TrendingUp, BarChart3, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

export function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    age: '',
    phoneNumber: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message);
        }
      } else {
        if (parseInt(formData.age) < 18) {
          setError('You must be at least 18 years old to register.');
          setLoading(false);
          return;
        }

        const { error } = await signUp(
          formData.email,
          formData.password,
          {
            name: formData.name,
            address: formData.address,
            age: parseInt(formData.age),
            phoneNumber: formData.phoneNumber,
          }
        );

        if (error) {
          setError(error.message);
        } else {
          setError('Registration successful! You can now sign in.');
          setIsLogin(true);
          setFormData({
            name: '',
            email: '',
            address: '',
            age: '',
            phoneNumber: '',
            password: '',
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Building2 className="w-16 h-16 text-blue-400" />
            <h1 className="text-6xl font-bold text-white">Stock City</h1>
          </div>
          <p className="text-xl text-blue-200 mb-8">Visualize Your Portfolio in 3D</p>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Experience stock market data like never before with immersive 3D visualizations,
            real-time updates, and powerful analytics.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle className="text-white">Real-Time Data</CardTitle>
              <CardDescription className="text-slate-300">
                Track stock prices with live updates and instant market insights
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-emerald-400" />
              </div>
              <CardTitle className="text-white">3D City Views</CardTitle>
              <CardDescription className="text-slate-300">
                Navigate through an interactive cityscape where buildings represent stocks
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">Advanced Analytics</CardTitle>
              <CardDescription className="text-slate-300">
                Dive deep into stock performance with comprehensive charts and metrics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-orange-400" />
              </div>
              <CardTitle className="text-white">Secure & Private</CardTitle>
              <CardDescription className="text-slate-300">
                Your data is protected with enterprise-grade security
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="text-2xl text-white text-center">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
              <CardDescription className="text-center text-slate-300">
                {isLogin ? 'Sign in to access your dashboard' : 'Sign up to get started'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-white">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        placeholder="123 Main St, City, Country"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-white">Age</Label>
                        <Input
                          id="age"
                          name="age"
                          type="number"
                          placeholder="18"
                          min="18"
                          max="120"
                          value={formData.age}
                          onChange={handleInputChange}
                          required
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="text-white">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          placeholder="+1234567890"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          required
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                {error && (
                  <div className={`text-sm p-3 rounded-lg ${
                    error.includes('successful')
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                    }}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
