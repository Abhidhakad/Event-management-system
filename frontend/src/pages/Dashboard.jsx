import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Ticket, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { queryClient } from '@/api/queryClient';
import { apiFetch } from '@/api/apiClient';
import { useAuth } from '@/context/authContext';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Dashboard() {

  const { accessToken, refreshAccessToken } = useAuth()
 

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['/bookings/my'],
    queryFn: async () => {
          const res = await apiFetch(`/bookings/my`, { method: "GET" }, accessToken, refreshAccessToken);
          const data = await res.json();
          return data.data || [];
        },
        staleTime: 1000 * 60 * 2,
        retry: 1,
        onError: (err) => {
          console.error("Bookings fateching failed:", err.message);
          toast.error("Fetching booking failed. Please try again later.");
        },
  });

  const cancelMutation = useMutation({
    mutationFn: async (bookingId) => {
      const res = await apiFetch(`/bookings/${bookingId}`,{ method: "DELETE" },accessToken, refreshAccessToken );
      const data = await res.json();
      return data.data || [];
    },
    onSuccess: () => {
      toast('Booking Cancelled',{
        description: 'Your booking has been cancelled successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/bookings/my'] });
    },
    onError: () => {
      toast('Cancellation Failed',{
        description: 'Unable to cancel booking. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
            <p className="text-muted-foreground">
              View and manage your event bookings
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-32 bg-muted rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => (
                <Card
                  key={booking._id}
                  className="overflow-hidden"
                  data-testid={`card-booking-${booking._id}`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">
                        {booking?.event_id?.title}
                      </CardTitle>
                      <Badge variant="secondary" className="shrink-0">
                        {booking.seats} {booking.seats === 1 ? 'seat' : 'seats'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(booking?.event_id?.date), 'MMM dd, yyyy • h:mm a')}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{booking?.event_id?.location}</span>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 mb-1">
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Ticket ID
                        </span>
                      </div>
                      <code
                        className="text-sm font-mono bg-muted px-2 py-1 rounded"
                        data-testid={`text-ticket-${booking._id}`}
                      >
                        {booking.ticket_id}
                      </code>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Booked on {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="w-full gap-2"
                          data-testid={`button-cancel-${booking.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                          Cancel Booking
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel this booking? This action cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-testid="button-cancel-dialog">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => cancelMutation.mutate(booking._id)}
                            data-testid="button-confirm-cancel"
                          >
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No Bookings Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't booked any events. Start exploring!
              </p>
              <Button asChild data-testid="button-browse-events">
                <a href="/">Browse Events</a>
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
