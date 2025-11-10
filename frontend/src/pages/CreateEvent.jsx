import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { insertEventSchema } from '@/validations/eventValidation';
import { Calendar,Loader2 } from 'lucide-react';
import { useAuth } from '@/context/authContext';
import { toast } from 'sonner';
import { apiFetch } from '@/api/apiClient';

export default function CreateEvent() {
    const [, navigate] = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const { accessToken, refreshAccessToken } = useAuth();

    const form = useForm({
        resolver: zodResolver(insertEventSchema),
        defaultValues: {
            title: '',
            description: '',
            date: '',
            location: '',
            seats: 50,
            imageUrl: '',
        },
    });


    const onSubmit = async (data) => {
        console.log("data in create event: ",data);
        setIsLoading(true);
        try {
            await apiFetch(
                '/events',
                {
                    method: 'POST',
                    body: JSON.stringify(data),
                },
                accessToken,
                refreshAccessToken
            );

            toast('Event Created!',{
                description: 'Your event has been submitted for admin approval.',
            });

            form.reset();
            navigate('/organizer');
        } catch (error) {
            toast.error('Creation Failed',{
                description: error instanceof Error ? error.message : 'Please try again',
                variant: 'destructive',
            });
            form.reset();
            navigate("/organizer/create");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
  return (
    <div className="min-h-screen py-12 relative">
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl px-6 py-4 flex flex-col items-center shadow-lg">
          <Loader2 className="animate-spin h-6 w-6 text-primary mb-2" />
          <p className="text-sm text-gray-700">Creating your event...</p>
        </div>
      </div>
    </div>
  );
}

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <Card className="shadow-xl">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <Calendar className="h-8 w-8 text-primary" />
                                <CardTitle className="text-3xl">Create New Event</CardTitle>
                            </div>
                            <CardDescription>
                                Fill in the details below to create your event. It will be reviewed by an admin before going live.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Event Title</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="Summer Music Festival 2024"
                                                        {...field}
                                                        disabled={isLoading}
                                                        data-testid="input-title"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Describe your event in detail..."
                                                        className="min-h-32"
                                                        {...field}
                                                        disabled={isLoading}
                                                        data-testid="input-description"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Event Date & Time</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="datetime-local"
                                                            min={new Date().toISOString().slice(0, 16)}
                                                            {...field}
                                                            disabled={isLoading}
                                                            data-testid="input-date"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="seats"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Total Seats</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            {...field}
                                                            disabled={isLoading}
                                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                            data-testid="input-seats"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Location</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="123 Main St, City, State"
                                                        {...field}
                                                        data-testid="input-location"
                                                        disabled={isLoading}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Music, Conference, Workshop, Sports, etc."
                                                        {...field}
                                                        data-testid="input-category"
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Help attendees find your event by categorizing it
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    /> */}

                                    <FormField
                                        control={form.control}
                                        name="imageUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Image URL (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="url"
                                                        placeholder="https://example.com/event-image.jpg"
                                                        {...field}
                                                        data-testid="input-image"
                                                        disabled={isLoading}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Provide a URL to an image that represents your event
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex gap-4 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => navigate('/organizer')}
                                            data-testid="button-cancel"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1"
                                            disabled={isLoading}
                                            data-testid="button-submit"
                                        >
                                            {isLoading ? 'Creating...' : 'Create Event'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}