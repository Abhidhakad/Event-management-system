import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, Tag, Minus, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import { queryClient } from '@/api/queryClient';
import { apiFetch } from '@/api/apiClient';
import { useAuth } from '@/context/authContext';

export default function EventDetail() {
    const [, params] = useRoute('/events/:id');
    const [, navigate] = useLocation();
    const [seats, setSeats] = useState(1);

    const { isGuest,accessToken, refreshAccessToken } = useAuth();

    const { data: event, isLoading, isError } = useQuery({
        queryKey: ['/api/events', params?.id],
        queryFn: async () => {
            const res = await apiFetch(`/events/${params.id}`, { method: "GET" },accessToken,refreshAccessToken);
            return res.json();
        },
        enabled: !!params?.id,
    });

    const bookingMutation = useMutation({
        mutationFn: async (data) => {
            const res = await apiFetch(
                `/bookings`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                },
                accessToken,
                refreshAccessToken
            );

            const result = await res.json();
            return result;
        },
        onSuccess: (result) => {
            toast.success("Booking Successful!", {
                description:
                    result?.message ||
                    "Your event has been booked. Check your dashboard for ticket details.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/events", params?.id] });
            navigate("/dashboard");
        },
        onError: (error) => {
            toast.error("Booking Failed", {
                description: error.message,
                variant: "destructive",
            });
        },
    });


    const handleBooking = () => {
        if (isGuest) {
            navigate('/login');
            return;
        }
        if (!event || !params?.id) return;

        bookingMutation.mutate({
            eventId: params.id,
            seats,
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen py-12">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="h-96 bg-muted rounded-lg animate-pulse mb-8" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="h-8 bg-muted rounded animate-pulse" />
                                <div className="h-32 bg-muted rounded animate-pulse" />
                            </div>
                            <div className="h-96 bg-muted rounded-lg animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    if (isError || !event?.event) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-2">Event Not Found</h2>
                    <p className="text-muted-foreground mb-4">The event you're looking for doesn't exist.</p>
                    <Button onClick={() => navigate('/')} data-testid="button-back-home">
                        Back to Events
                    </Button>
                </div>
            </div>
        );
    }

    const getInitials = (name) => {
        return name
            ? name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "U";
    };

    const canBook =
        event?.event?.seatsAvailable >= seats &&
        event?.event?.status === 'approved';

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Event Image */}
                    {
                        event?.event?.imageUrl && <div className="relative aspect-[21/9] rounded-lg overflow-hidden mb-8">
                            <img
                                src={event.imageUrl || '/placeholder-event.jpg'}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    }

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Event Details */}
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <h1 className="text-4xl font-bold" data-testid="text-event-title">
                                        {event?.event?.title}
                                    </h1>
                                    <Badge
                                        variant={event?.event?.status === 'approved' ? 'default' : 'secondary'}
                                        data-testid="badge-status"
                                    >
                                        {event?.event?.status}
                                    </Badge>
                                </div>
                                {event?.event?.category && (
                                    <Badge variant="secondary" className="text-sm">
                                        <Tag className="h-3 w-3 mr-1" />
                                        {event?.event?.category}
                                    </Badge>
                                )}
                            </div>

                            {/* Event Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
                                        <p className="font-medium" data-testid="text-date">
                                            {format(new Date(event?.event?.date), 'MMMM dd, yyyy')}
                                        </p>
                                        {/* <p className="text-sm text-muted-foreground">
                                            {format(new Date(event.date), 'h:mm a')}
                                        </p> */}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Location</p>
                                        <p className="font-medium" data-testid="text-location">
                                            {event?.event?.location}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
                                <p className="text-base leading-relaxed max-w-prose" data-testid="text-description">
                                    {event?.event?.description}
                                </p>
                            </div>

                            {/* Organizer Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Event Organizer</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback>{getInitials(event?.event?.organizer?.name)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold" data-testid="text-organizer-name">
                                                {event?.event?.organizer?.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">{event?.event?.organizer?.email}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Booking Card */}
                        <div className="lg:sticky lg:top-24 h-fit">
                            <Card className="shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Book Your Spot</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <div className="flex items-baseline gap-2 mb-2">
                                            <span className="text-3xl font-bold">Free</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {event?.event?.seatsAvailable} of {event?.event?.totalSeats} seats available
                                        </p>
                                        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all"
                                                style={{
                                                    width: `${(event?.event?.seatsAvailable / event?.event?.totalSeats) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="seats">Number of Seats</Label>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() => setSeats(Math.max(1, seats - 1))}
                                                disabled={seats <= 1}
                                                data-testid="button-decrease-seats"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <Input
                                                id="seats"
                                                type="number"
                                                value={seats}
                                                onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="text-center"
                                                min={1}
                                                max={event.seatsAvailable}
                                                data-testid="input-seats"
                                            />
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() => setSeats(Math.min(event?.event?.seatsAvailable, seats + 1))}
                                                disabled={seats >= event?.event.seatsAvailable}
                                                data-testid="button-increase-seats"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="pt-4 space-y-2 text-xs text-muted-foreground">
                                        <p>✓ Free cancellation up to 24 hours before event</p>
                                        <p>✓ Instant confirmation via email</p>
                                        <p>✓ Mobile ticket available</p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full h-12 text-lg font-semibold"
                                        onClick={handleBooking}
                                        disabled={!canBook || bookingMutation.isPending}
                                        data-testid="button-book-now"
                                    >
                                        {bookingMutation.isPending
                                            ? 'Booking...'
                                            : isGuest
                                                ? 'Sign In to Book'
                                                : !canBook
                                                    ? event.status !== 'approved'
                                                        ? 'Event Not Approved'
                                                        : 'No Seats Available'
                                                    : 'Book Now'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
