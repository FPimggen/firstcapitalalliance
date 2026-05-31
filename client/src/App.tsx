import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ComparisonPage from "./pages/ComparisonPage";
import OfferDetailPage from "./pages/OfferDetailPage";
import ProviderPage from "./pages/ProviderPage";
import ProvidersIndex from "./pages/ProvidersIndex";
import ArticleHub from "./pages/ArticleHub";
import ArticlePage from "./pages/ArticlePage";
import StaticPage from "./pages/StaticPages";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOffers from "./pages/admin/AdminOffers";
import AdminProviders from "./pages/admin/AdminProviders";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminAuditLog from "./pages/admin/AdminAuditLog";
import AdminAITools from "./pages/admin/AdminAITools";

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public pages */}
      <Route path="/" component={Home} />
      <Route path="/providers" component={ProvidersIndex} />
      <Route path="/providers/:slug" component={ProviderPage} />
      <Route path="/learn" component={ArticleHub} />
      <Route path="/learn/:slug" component={ArticlePage} />

      {/* Category comparison pages */}
      <Route path="/credit-cards">{() => <ComparisonPage categorySlug="credit-cards" />}</Route>
      <Route path="/personal-loans">{() => <ComparisonPage categorySlug="personal-loans" />}</Route>
      <Route path="/mortgages">{() => <ComparisonPage categorySlug="mortgages" />}</Route>
      <Route path="/auto-loans">{() => <ComparisonPage categorySlug="auto-loans" />}</Route>
      <Route path="/savings-accounts">{() => <ComparisonPage categorySlug="savings-accounts" />}</Route>

      {/* Product detail pages */}
      <Route path="/offers/:slug" component={OfferDetailPage} />

      {/* Static trust pages */}
      <Route path="/disclosure">{() => <StaticPage path="/disclosure" />}</Route>
      <Route path="/editorial-policy">{() => <StaticPage path="/editorial-policy" />}</Route>
      <Route path="/methodology">{() => <StaticPage path="/methodology" />}</Route>
      <Route path="/how-we-make-money">{() => <StaticPage path="/how-we-make-money" />}</Route>

      {/* Admin panel */}
      <Route path="/admin">{() => <AdminRoute component={AdminDashboard} />}</Route>
      <Route path="/admin/offers">{() => <AdminRoute component={AdminOffers} />}</Route>
      <Route path="/admin/offers/new">{() => <AdminRoute component={AdminOffers} />}</Route>
      <Route path="/admin/providers">{() => <AdminRoute component={AdminProviders} />}</Route>
      <Route path="/admin/providers/new">{() => <AdminRoute component={AdminProviders} />}</Route>
      <Route path="/admin/categories">{() => <AdminRoute component={AdminCategories} />}</Route>
      <Route path="/admin/articles">{() => <AdminRoute component={AdminArticles} />}</Route>
      <Route path="/admin/articles/new">{() => <AdminRoute component={AdminArticles} />}</Route>
      <Route path="/admin/ai-tools">{() => <AdminRoute component={AdminAITools} />}</Route>
      <Route path="/admin/audit-log">{() => <AdminRoute component={AdminAuditLog} />}</Route>

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
