import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SearchProvider } from "@/contexts/SearchContext";
import NotFound from "@/pages/not-found";

import { OripioMedico } from "@/pages/OripioMedico";
import { AdminPage } from "@/pages/AdminPage";
import { MailPage } from "@/pages/MailPage";

function Router() {
  return (
    <Switch>
      {/* Add pages below */}
      <Route path="/" component={OripioMedico} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/mail" component={MailPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SearchProvider>
          <Toaster />
          <Router />
        </SearchProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
