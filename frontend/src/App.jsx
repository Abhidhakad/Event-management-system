import React from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/api/queryClient";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip.jsx";
import { AuthProvider } from "@/context/authContext.jsx";
import Navbar from "@/components/Navbar.jsx";


// import NotFound from "@/pages/not-found";
import Home from "@/pages/Home.jsx";
import EventDetail from "@/pages/EventDetail";
import Login from "@/pages/Login.jsx";
import Register from "@/pages/Register.jsx";
// import Dashboard from "@/pages/Dashboard";
import OrganizerDashboard from "@/pages/OrganizerDashboard";
import CreateEvent from "@/pages/CreateEvent";
import AdminPanel from "@/pages/AdminPanel";

function Router() {
  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/events/:id" component={EventDetail} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        {/* <Route path="/dashboard" component={Dashboard} /> */}
        <Route path="/organizer" component={OrganizerDashboard} />
        <Route path="/organizer/create" component={CreateEvent} />
         <Route path="/admin" component={AdminPanel} />
        {/* <Route component={NotFound} />  */}
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster position="top-center" offset="60px" richColors closeButton />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
