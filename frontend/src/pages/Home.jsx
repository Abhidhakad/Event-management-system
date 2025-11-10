import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/api/apiClient";
import { Calendar, MapPin, Users, Search, CircleX } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/authContext";

// Images
import heroImage from "@/assets/images/Festival_hero_background_image_14b1e998.png";
import concertImage from "@/assets/images/Rock_concert_event_image_1a207637.png";
import conferenceImage from "@/assets/images/Business_conference_event_image_9169279e.png";
import artImage from "@/assets/images/Art_exhibition_event_image_59ba64fe.png";
import workshopImage from "@/assets/images/Workshop_educational_event_image_9fcfb117.png";
import sportsImage from "@/assets/images/Sports_event_marathon_image_4ae06b71.png";

const eventImages = [concertImage, conferenceImage, artImage, workshopImage, sportsImage];

export default function Home() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { accessToken, refreshAccessToken } = useAuth();

  // Fetch approved events
  const { data: eventsData, isLoading: isEventsLoading } = useQuery({
    queryKey: ["approved-events"],
    queryFn: async () => {
      const res = await apiFetch("/events/approved", { method: "GET" }, accessToken, refreshAccessToken);
      const data = await res.json();
      return data.data || data;
    },
    staleTime: 1000 * 60 * 5, // cache for 5 min
    retry: 1,
    onError: (err) => {
      console.error("Failed to fetch events:", err.message);
      if (err.message.includes("Unauthorized")) {
        toast.error("Session expired. Redirecting to login.");
        window.location.href = "/login";
      }
    },
    select: (data) => data?.events || [],
  });

  // Search events
  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ["search-events", searchTerm],
    queryFn: async () => {
      const res = await apiFetch(`/events/search?query=${encodeURIComponent(searchTerm)}`, { method: "GET" },accessToken,refreshAccessToken);
      const data = await res.json();
      return data.data || [];
    },
    enabled: !!searchTerm,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    onError: (err) => {
      console.error("Search failed:", err.message);
      toast.error("Search failed. Please try again later.");
    },
  });

  // Search handler
  const handleSearch = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return toast.warning("Please enter a search term");
    setSearchTerm(trimmed);
  }, [query]);

  const getEventImage = useCallback(
    (index) => eventImages[index % eventImages.length],
    []
  );

  const displayedEvents = useMemo(
    () => (searchTerm ? searchResults : eventsData),
    [searchTerm, searchResults, eventsData]
  );

  const loading = isEventsLoading || isSearchLoading;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-[65vh] flex items-center justify-center"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Find and book the best concerts, conferences, workshops, and more in your area
          </p>

          {/* Search Bar */}
          <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events..."
                className="h-14 pl-12 text-base bg-white/95 backdrop-blur-md border-none"
              />
              {query.length > 0 && (
                <CircleX
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground cursor-pointer"
                  onClick={() => {
                    setQuery("");
                    setSearchTerm("");
                  }}
                />
              )}
            </div>

            <Button size="lg" className="h-14 px-8" onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>

          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between">
              <h2 className="text-3xl font-semibold mb-8">
                {searchTerm ? `Results for "${searchTerm}"` : "Upcoming Events"}
              </h2>{searchTerm && (
                <Button
                  size="lg"
                  variant="outline"
                  className="h-10 px-6 mt-1 bg-purple-600 text-white font-semibold hover:bg-purple-700 hover:text-white"
                  onClick={() => {
                    setQuery("");
                    setSearchTerm("");
                  }}
                >
                  Clear
                </Button>
              )}
            </div>





            {loading ? (
              // Skeleton Loading
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="aspect-video bg-muted animate-pulse" />
                    <CardContent className="p-6">
                      <div className="h-6 bg-muted rounded mb-2 animate-pulse" />
                      <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : displayedEvents?.length ? (
              // Event Cards
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedEvents.map((event, index) => (
                  <Card
                    key={event._id}
                    className="overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-video bg-gray-100 overflow-hidden">
                      <img
                        src={event.imageUrl || getEventImage(index)}
                        alt={event.title}
                        className="w-full h-full object-cover transition-opacity duration-300 ease-in-out"
                        loading="lazy"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                      <Badge className="absolute top-2 right-2 backdrop-blur-md">
                        {format(new Date(event.date), "MMM dd")}
                      </Badge>
                    </div>

                    <CardContent className="p-6 space-y-3">
                      <h3 className="text-xl font-semibold line-clamp-2">{event.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(event.date), "MMM dd, yyyy • h:mm a")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {event.seatsAvailable ?? event.availableSeats ?? 0} /{" "}
                          {event.totalSeats ?? event.seats ?? 0} seats available
                        </span>
                      </div>
                      {event.category && <Badge variant="secondary">{event.category}</Badge>}
                    </CardContent>

                    <CardFooter className="p-6 pt-0">
                      <Link href={`/events/${event._id}`}>
                        <Button className="w-full">View Details</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              // No Results
              <div className="text-center py-20">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">No Events Found</h3>
                <p className="text-muted-foreground">
                  Try searching for something else or check back later.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
