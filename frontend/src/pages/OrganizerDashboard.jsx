import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { Calendar, Plus, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { queryClient } from "@/api/queryClient";
import { apiFetch } from "@/api/apiClient";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAuth } from "@/context/authContext";

export default function OrganizerDashboard() {
  const { accessToken, refreshAccessToken } = useAuth();

  // Fetch Events
  const { data: events, isLoading, isError, error } = useQuery({
    queryKey: [QUERY_KEYS.MY_EVENTS],
    queryFn: async () => {
      const res = await apiFetch("/events/user/my", { method: "GET" }, accessToken, refreshAccessToken);
      const data = await res.json();
      return data.data || data;
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
    onError: (err) => {
      console.error("Failed to fetch events:", err.message);
      if (err.message.includes("Unauthorized")) {
        toast.error("Session expired. Redirecting to login.");
        window.location.href = "/login";
      }
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (eventId) => {
      const res = await apiFetch(
        `/events/${eventId}`,
        { method: "DELETE" },
        accessToken,
        refreshAccessToken
      );
      const data = await res.json();
      return data;
    },
    onSuccess: () => {
      toast.success("Event Deleted", { description: "Your event has been deleted successfully." });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_EVENTS] });
    },
    onError: (err) => {
      toast.error("Deletion Failed", { description: err?.message || "Unable to delete event.", variant: "destructive" });
    },
  });

  const safeEvents = Array.isArray(events) ? events : [];
  const stats = {
    total: safeEvents.length,
    approved: safeEvents.filter((e) => e.status === "approved").length,
    pending: safeEvents.filter((e) => e.status === "pending").length,
    rejected: safeEvents.filter((e) => e.status === "rejected").length,
  };

  if (isLoading) {
    return (
      <div className="p-10 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-red-600">
        <h3 className="text-xl font-semibold mb-2">Failed to load events</h3>
        <p>{error?.message || "Something went wrong. Try reloading the page."}</p>
        <Button onClick={() => queryClient.invalidateQueries([QUERY_KEYS.MY_EVENTS])}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Organizer Dashboard</h1>
              <p className="text-muted-foreground">Manage your events and track performance</p>
            </div>
            <Link href="/organizer/create">
              <Button className="gap-2" data-testid="button-create-event">
                <Plus className="h-4 w-4" /> Create Event
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {["total", "approved", "pending", "rejected"].map((type) => (
              <Card key={type}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{type.charAt(0).toUpperCase() + type.slice(1)} Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-4xl font-bold ${type === "approved" ? "text-green-600" : type === "pending" ? "text-yellow-600" : type === "rejected" ? "text-red-600" : ""
                      }`}
                    data-testid={`stat-${type}`}
                  >
                    {stats[type]}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Events Table */}
          {events && events.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>My Events</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Seats</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event?._id} data-testid={`row-event-${event?._id}`}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>{event.date ? format(new Date(event.date), "MMM dd, yyyy") : "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              event.status === "approved" ? "default" : event.status === "pending" ? "secondary" : "destructive"
                            }
                            data-testid={`badge-status-${event?._id}`}
                          >
                            {event.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{event.seatsAvailable} / {event.totalSeats}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/events/${event?._id}`}>
                              <Button size="icon" variant="ghost" data-testid={`button-view-${event?._id}`}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" data-testid={`button-delete-${event?._id}`}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{event.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteMutation.mutate(event?._id)} data-testid={`button-confirm-delete-${event?._id}`}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No Events Yet</h3>
              <p className="text-muted-foreground mb-6">Create your first event to get started</p>
              <Link href="/organizer/create">
                <Button data-testid="button-create-first">
                  <Plus className="h-4 w-4 mr-2" /> Create Event
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
