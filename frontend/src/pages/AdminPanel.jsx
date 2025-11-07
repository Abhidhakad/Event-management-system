import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar, Users, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { queryClient } from '@/api/queryClient';
import { Link } from 'wouter';
import { apiFetch } from '@/api/apiClient';
import { useAuth } from '@/context/authContext';

export default function AdminPanel() {
    const { accessToken, refreshAccessToken } = useAuth();

    // Fetch all events
    const { data: events = [], isLoading: eventsLoading, isError: eventsError } = useQuery({
        queryKey: ['/admin/events'],
        queryFn: async () => {
            const res = await apiFetch(`/admin/events`, { method: 'GET' }, accessToken, refreshAccessToken);
            return res.json();
        },
        staleTime: 1000 * 60 * 2,
        retry: 1,
        onError: (err) => {
            console.error('Failed to fetch events:', err.message);
            if (err.message.includes('Unauthorized')) {
                toast.error('Session expired. Redirecting to login.');
                window.location.href = '/login';
            }
        },
    });

    // Fetch all users
    const { data: users = [], isLoading: usersLoading, isError: usersError } = useQuery({
        queryKey: ['/admin/users'],
        queryFn: async () => {
            const res = await apiFetch(`/admin/users`, { method: 'GET' }, accessToken, refreshAccessToken);
            return res.json();
        },
        staleTime: 1000 * 60 * 2,
        retry: 1,
        onError: (err) => {
            console.error('Failed to fetch users:', err.message);
            if (err.message.includes('Unauthorized')) {
                toast.error('Session expired. Redirecting to login.');
                window.location.href = '/login';
            }
        },
    });

    //  Fetch all bookings
    const { data: bookings = [], isLoading: bookingsLoading, isError: bookingsError } = useQuery({
        queryKey: ['/admin/bookings'],
        queryFn: async () => {
            const res = await apiFetch(`/admin/bookings`, { method: 'GET' }, accessToken, refreshAccessToken);
            return res.json();
        },
        staleTime: 1000 * 60 * 2,
        retry: 1,
        onError: (err) => {
            console.error('Failed to fetch bookings:', err.message);
            if (err.message.includes('Unauthorized')) {
                toast.error('Session expired. Redirecting to login.');
                window.location.href = '/login';
            }
        },
    });

    // Approve / Reject Event
    const approveEventMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            const res = await apiFetch(
                `/admin/events/${id}/status`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ status }),
                },
                accessToken,
                refreshAccessToken
            );
            const data = await res.json();
            return data;
        },
        onSuccess: (_, variables) => {
            toast.success(variables.status === 'approved' ? 'Event Approved' : 'Event Rejected', {
                description: `The event has been ${variables.status}.`,
            });
            queryClient.invalidateQueries({ queryKey: ['/admin/events'] });
        },
        onError: () => {
            toast.error('Action Failed', {
                description: 'Unable to update event status.',
            });
        },
    });

    //  Update User Role
    const updateUserRoleMutation = useMutation({
        mutationFn: async ({ id, role }) => {
            const res = await apiFetch(
                `/admin/users/${id}/role`,
                { method: 'PATCH', body: JSON.stringify({ role }) },
                accessToken,
                refreshAccessToken
            );
            const data = await res.json();
            return data;
        },
        onSuccess: () => {
            toast.success('Role Updated', {
                description: 'User role has been updated successfully.',
            });
            queryClient.invalidateQueries({ queryKey: ['/admin/users'] });
        },
        onError: () => {
            toast.error('Update Failed', {
                description: 'Unable to update user role.',
            });
        },
    });

    // event deletion 
    const deleteEventMutation = useMutation({
        mutationFn: async (id) => {
            const res = await apiFetch(`/admin/events/${id}`, { method: 'DELETE' }, accessToken, refreshAccessToken);
            return res.json();
        },
        onSuccess: () => {
            toast.success('Event Deleted', { description: 'The event has been deleted successfully.' });
            queryClient.invalidateQueries({ queryKey: ['/admin/events'] });
        },
        onError: () => toast.error('Delete Failed', { description: 'Unable to delete event.' }),
    });

    // delete user

    // DELETE User
    const deleteUserMutation = useMutation({
        mutationFn: async (id) => {
            const res = await apiFetch(`/admin/users/${id}`, { method: 'DELETE' }, accessToken, refreshAccessToken);
            return res.json();
        },
        onSuccess: () => {
            toast.success('User Deleted', { description: 'User has been deleted successfully.' });
            queryClient.invalidateQueries({ queryKey: ['/admin/users'] });
        },
        onError: () => toast.error('Delete Failed', { description: 'Unable to delete user.' }),
    });

    const pendingEvents = events?.filter((e) => e.status === 'pending') || [];
    const stats = {
        totalEvents: events?.length || 0,
        totalUsers: users?.length || 0,
        totalBookings: bookings?.length || 0,
        pendingEvents: pendingEvents.length,
    };

    if (eventsLoading || usersLoading || bookingsLoading)
        return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
    if (eventsError || usersError || bookingsError)
        return <div className="text-center py-12 text-red-500">Failed to load admin data</div>;

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
                        <p className="text-muted-foreground">Manage events, users, and bookings</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold">{stats.totalEvents}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold">{stats.totalUsers}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold">{stats.totalBookings}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-yellow-600">{stats.pendingEvents}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="events" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="events">Events</TabsTrigger>
                            <TabsTrigger value="users">Users</TabsTrigger>
                            <TabsTrigger value="bookings">Bookings</TabsTrigger>
                        </TabsList>

                        {/* Events Tab */}
                        <TabsContent value="events">
                            <Card>
                                <CardHeader>
                                    <CardTitle>All Events</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {events.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Event Name</TableHead>
                                                    <TableHead>Organizer</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Seats</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {events.map((event) => (
                                                    <TableRow key={event._id}>
                                                        <TableCell className="font-medium">{event.title}</TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {users.find((u) => u._id === event.organizer?._id)?.name || 'Unknown'}
                                                        </TableCell>
                                                        <TableCell>{format(new Date(event.date), 'MMM dd, yyyy')}</TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={
                                                                    event.status === 'approved'
                                                                        ? 'default'
                                                                        : event.status === 'pending'
                                                                            ? 'secondary'
                                                                            : 'destructive'
                                                                }
                                                            >
                                                                {event.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {event.seatsAvailable} / {event.totalSeats}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Link href={`/events/${event._id}`}>
                                                                    <Button size="icon" variant="ghost">
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                                {(
                                                                    <>
                                                                        {event.status !== "approved" && <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            onClick={() =>
                                                                                approveEventMutation.mutate({
                                                                                    id: event._id,
                                                                                    status: 'approved',
                                                                                })
                                                                            }
                                                                        >
                                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                                        </Button>


                                                                        }
                                                                        {event.status !== "rejected" && <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            onClick={() =>
                                                                                approveEventMutation.mutate({
                                                                                    id: event._id,
                                                                                    status: 'rejected',
                                                                                })
                                                                            }
                                                                        >
                                                                            <XCircle className="h-4 w-4 text-red-600" />
                                                                        </Button>}

                                                                        <Button
                                                                            size="icon"
                                                                            variant="destructive"
                                                                            onClick={() => deleteEventMutation.mutate(event._id)}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-12 text-muted-foreground">
                                            No events found
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Users Tab */}
                        <TabsContent value="users">
                            <Card>
                                <CardHeader>
                                    <CardTitle>All Users</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {users.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Role</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {users.map((user) => (
                                                    <TableRow key={user._id}>
                                                        <TableCell className="font-medium">{user.name}</TableCell>
                                                        <TableCell>{user.email}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary">{user.role}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {/* Role Selector */}
                                                                <Select
                                                                    value={user.role}
                                                                    onValueChange={(role) =>
                                                                        updateUserRoleMutation.mutate({ id: user._id, role })
                                                                    }
                                                                >
                                                                    <SelectTrigger className="w-32">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="user">User</SelectItem>
                                                                        <SelectItem value="organizer">Organizer</SelectItem>
                                                                        <SelectItem value="admin">Admin</SelectItem>
                                                                    </SelectContent>
                                                                </Select>

                                                                {/* Delete User Button */}
                                                                <Button
                                                                    size="icon"
                                                                    variant="destructive"
                                                                    onClick={() => {
                                                                        if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
                                                                            deleteUserMutation.mutate(user._id);
                                                                        }
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>

                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-12 text-muted-foreground">
                                            No users found
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Bookings Tab */}
                        <TabsContent value="bookings">
                            <Card>
                                <CardHeader>
                                    <CardTitle>All Bookings</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {bookings.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>User</TableHead>
                                                    <TableHead>Event</TableHead>
                                                    <TableHead>Ticket ID</TableHead>
                                                    <TableHead>Seats</TableHead>
                                                    <TableHead>Booking Date</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {bookings.map((booking) => (
                                                    <TableRow key={booking._id}>
                                                        <TableCell className="font-medium">{booking.userName}</TableCell>
                                                        <TableCell>{booking.eventTitle}</TableCell>
                                                        <TableCell>
                                                            <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                                                {booking.ticketId}
                                                            </code>
                                                        </TableCell>
                                                        <TableCell>{booking.seats}</TableCell>
                                                        <TableCell>
                                                            {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-12 text-muted-foreground">
                                            No bookings found
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
