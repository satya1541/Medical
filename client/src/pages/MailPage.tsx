import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmailSubscription, User } from '@shared/schema';
import { Trash2, Mail, Calendar, Users, Lock } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface MailPageProps {}

export const MailPage: React.FC<MailPageProps> = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // Login function
  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.user && data.user.isAdmin) {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        toast({ title: 'Login successful', description: 'Welcome to email management' });
      } else {
        toast({ title: 'Access denied', description: 'Admin privileges required', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Login failed', description: 'Invalid credentials', variant: 'destructive' });
    }
  };

  // Fetch email subscriptions
  const { data: subscriptions = [], isLoading, error } = useQuery<EmailSubscription[]>({
    queryKey: ['/api/emails'],
    queryFn: async () => {
      const response = await fetch('/api/emails', {
        headers: {
          'Authorization': `Bearer admin-${currentUser?.id}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch email subscriptions');
      return response.json();
    },
    enabled: isLoggedIn && !!currentUser?.isAdmin,
  });

  // Delete subscription mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/emails/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer admin-${currentUser?.id}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to delete subscription');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
      toast({
        title: 'Success',
        description: 'Email subscription deleted successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete email subscription.',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteSubscription = (id: number) => {
    deleteMutation.mutate(id);
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Login screen for non-authenticated users
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="[font-family:'Nunito',Helvetica] font-bold text-2xl text-[#333333] flex items-center justify-center gap-2">
              <Lock className="w-6 h-6 text-[#28a745]" />
              Admin Login Required
            </CardTitle>
            <CardDescription className="[font-family:'Poppins',Helvetica] text-[#666666]">
              Please log in with admin credentials to access email subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="mt-1"
                data-testid="input-admin-username"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="mt-1"
                data-testid="input-admin-password"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button
              onClick={handleLogin}
              className="w-full bg-[#28a745] hover:bg-[#218838] text-white"
              data-testid="button-admin-login"
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-red-600 font-medium">Failed to load email subscriptions</p>
                <p className="text-red-500 text-sm mt-2">Please try refreshing the page</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e1e6eb] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="[font-family:'Nunito',Helvetica] font-bold text-3xl text-[#333333] flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#28a745]/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#28a745]" />
                </div>
                Email Subscriptions
              </h1>
              <p className="[font-family:'Poppins',Helvetica] text-[#666666] mt-2">
                Manage newsletter subscribers and email marketing lists
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-[#28a745]" data-testid="text-subscription-count">
                  {subscriptions.length}
                </p>
                <p className="text-sm text-[#666666]">Total Subscribers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-[#e1e6eb] shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#333333]" data-testid="text-active-subscribers">
                    {subscriptions.filter((sub: EmailSubscription) => sub.isActive).length}
                  </p>
                  <p className="text-sm text-[#666666]">Active Subscribers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#e1e6eb] shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#333333]" data-testid="text-recent-subscribers">
                    {subscriptions.filter((sub: EmailSubscription) => {
                      const subDate = new Date(sub.subscribedAt!);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return subDate > weekAgo;
                    }).length}
                  </p>
                  <p className="text-sm text-[#666666]">This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#e1e6eb] shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#333333]" data-testid="text-latest-subscription">
                    {subscriptions.length > 0 ? formatDate(subscriptions[0].subscribedAt!).split(',')[0] : 'N/A'}
                  </p>
                  <p className="text-sm text-[#666666]">Latest Subscription</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Subscriptions List */}
        <Card className="bg-white border-[#e1e6eb] shadow-sm rounded-xl">
          <CardHeader className="border-b border-[#e1e6eb] pb-4">
            <CardTitle className="[font-family:'Nunito',Helvetica] font-bold text-xl text-[#333333] flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#28a745]/10 flex items-center justify-center">
                <span className="text-[#28a745] text-lg">📧</span>
              </div>
              Newsletter Subscribers
            </CardTitle>
            <CardDescription className="[font-family:'Poppins',Helvetica] text-[#666666]">
              All email addresses subscribed to your newsletter
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#28a745]/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-[#28a745]" />
                </div>
                <h3 className="[font-family:'Nunito',Helvetica] font-semibold text-lg text-[#333333] mb-2">
                  No Subscribers Yet
                </h3>
                <p className="[font-family:'Poppins',Helvetica] text-[#666666]">
                  Email subscriptions from your website will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {subscriptions.map((subscription: EmailSubscription) => (
                  <div
                    key={subscription.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-[#e1e6eb] rounded-lg hover:shadow-md transition-shadow duration-200 gap-3"
                    data-testid={`subscription-item-${subscription.id}`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-[#28a745]/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-[#28a745]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <a 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            const subject = encodeURIComponent('Newsletter Update from Oripio Medico');
                            const body = encodeURIComponent('Dear Subscriber,\n\nThank you for subscribing to our newsletter.\n\nBest regards,\nOripio Medico Team');
                            const email = subscription.email;
                            
                            // Detect iOS and try Gmail app first
                            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                              const gmailAppUrl = `googlegmail:///co?to=${email}&subject=${subject}&body=${body}`;
                              const fallbackUrl = `mailto:${email}?subject=${subject}&body=${body}`;
                              
                              // Try to open Gmail app, fallback to mailto
                              window.location.href = gmailAppUrl;
                              setTimeout(() => {
                                window.location.href = fallbackUrl;
                              }, 500);
                            } 
                            // Android or other mobile devices - use mailto (opens default email app)
                            else if (/Android/i.test(navigator.userAgent)) {
                              window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
                            }
                            // Desktop - open Gmail web
                            else {
                              window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`, '_blank');
                            }
                          }}
                          className="[font-family:'Nunito',Helvetica] font-semibold text-[#333333] break-words hover:text-[#28a745] hover:underline transition-colors duration-200 cursor-pointer"
                          data-testid={`text-email-${subscription.id}`}
                        >
                          {subscription.email}
                        </a>
                        <p className="[font-family:'Poppins',Helvetica] text-sm text-[#666666]">
                          Subscribed on {formatDate(subscription.subscribedAt!)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        subscription.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {subscription.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-subscription-${subscription.id}`}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Email Subscription</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this email subscription for {subscription.email}? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSubscription(subscription.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};