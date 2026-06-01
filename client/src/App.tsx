import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
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
import AboutPage from "./pages/AboutPage";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOffers from "./pages/admin/AdminOffers";
import AdminProviders from "./pages/admin/AdminProviders";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminAITools from "./pages/admin/AdminAITools";
import AdminAuditLog from "./pages/admin/AdminAuditLog";

// Calculator pages
import ToolsHub from "./pages/tools/ToolsHub";
import MortgageCalculator from "./pages/tools/MortgageCalculator";
import MortgageRefiCalculator from "./pages/tools/MortgageRefiCalculator";
import HomeAffordabilityCalculator from "./pages/tools/HomeAffordabilityCalculator";
import RentVsBuyCalculator from "./pages/tools/RentVsBuyCalculator";
import { AutoLoanCalculator, AutoRefiCalculator } from "./pages/tools/AutoCalculators";
import { SavingsGoalCalculator, SavingsComparisonCalculator, CDCalculator } from "./pages/tools/SavingsCalculators";
import { PersonalLoanCalculator, LoanComparisonCalculator, DebtConsolidationCalculator, DebtPayoffCalculator } from "./pages/tools/LoanCalculators";
import { CreditCardPayoffCalculator, CreditCardInterestCalculator, CreditCardRefiCalculator, BalanceTransferCalculator } from "./pages/tools/CreditCardCalculators";
import { AprApyConverter, DTICalculator } from "./pages/tools/GeneralCalculators";
import AdminArticles from "./pages/admin/AdminArticles";
import { CreditScoreHubPage, CardsByScorePage, AutoLoansByScorePage, MortgagesByScorePage, PersonalLoansByScorePage } from "./pages/CreditScoreHub";
import { GlossaryIndexPage, GlossaryTermPage } from "./pages/Glossary";
import CreditCardCompareTool from "./pages/CreditCardCompareTool";
import CreditCardSubCategoryPage from "./pages/CreditCardSubCategoryPage";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
      {/* Public pages */}
      <Route path="/" component={Home} />
      <Route path="/providers" component={ProvidersIndex} />
      <Route path="/providers/:slug" component={ProviderPage} />
      <Route path="/learn" component={ArticleHub} />
      <Route path="/learn/:slug" component={ArticlePage} />

      {/* Credit card sub-category pages */}
      <Route path="/credit-cards/cash-back">{() => <CreditCardSubCategoryPage cardType="cash-back" />}</Route>
      <Route path="/credit-cards/travel">{() => <CreditCardSubCategoryPage cardType="travel" />}</Route>
      <Route path="/credit-cards/balance-transfer">{() => <CreditCardSubCategoryPage cardType="balance-transfer" />}</Route>
      <Route path="/credit-cards/credit-builder">{() => <CreditCardSubCategoryPage cardType="credit-builder" />}</Route>

      {/* Category comparison pages */}
      <Route path="/credit-cards">{() => <ComparisonPage categorySlug="credit-cards" />}</Route>
      <Route path="/personal-loans">{() => <ComparisonPage categorySlug="personal-loans" />}</Route>
      <Route path="/mortgages">{() => <ComparisonPage categorySlug="mortgages" />}</Route>
      <Route path="/auto-loans">{() => <ComparisonPage categorySlug="auto-loans" />}</Route>
      <Route path="/savings-accounts">{() => <ComparisonPage categorySlug="savings-accounts" />}</Route>

      {/* Product detail pages */}
      <Route path="/offers/:slug" component={OfferDetailPage} />

      {/* Calculator tools */}
      <Route path="/tools" component={ToolsHub} />
      <Route path="/tools/mortgage-calculator" component={MortgageCalculator} />
      <Route path="/tools/mortgage-refi-calculator" component={MortgageRefiCalculator} />
      <Route path="/tools/home-affordability-calculator" component={HomeAffordabilityCalculator} />
      <Route path="/tools/rent-vs-buy-calculator" component={RentVsBuyCalculator} />
      <Route path="/tools/auto-loan-calculator" component={AutoLoanCalculator} />
      <Route path="/tools/auto-refi-calculator" component={AutoRefiCalculator} />
      <Route path="/tools/savings-goal-calculator" component={SavingsGoalCalculator} />
      <Route path="/tools/savings-comparison-calculator" component={SavingsComparisonCalculator} />
      <Route path="/tools/cd-calculator" component={CDCalculator} />
      <Route path="/tools/personal-loan-calculator" component={PersonalLoanCalculator} />
      <Route path="/tools/loan-comparison-calculator" component={LoanComparisonCalculator} />
      <Route path="/tools/debt-consolidation-calculator" component={DebtConsolidationCalculator} />
      <Route path="/tools/debt-payoff-calculator" component={DebtPayoffCalculator} />
      <Route path="/tools/credit-card-payoff-calculator" component={CreditCardPayoffCalculator} />
      <Route path="/tools/credit-card-interest-calculator" component={CreditCardInterestCalculator} />
      <Route path="/tools/credit-card-refi-calculator" component={CreditCardRefiCalculator} />
      <Route path="/tools/balance-transfer-calculator" component={BalanceTransferCalculator} />
      <Route path="/tools/apr-apy-converter" component={AprApyConverter} />
      <Route path="/tools/dti-calculator" component={DTICalculator} />

      {/* Credit score hub */}
      <Route path="/credit-score" component={CreditScoreHubPage} />
      <Route path="/credit-score/cards-by-score" component={CardsByScorePage} />
      <Route path="/credit-score/auto-loans-by-score" component={AutoLoansByScorePage} />
      <Route path="/credit-score/mortgages-by-score" component={MortgagesByScorePage} />
      <Route path="/credit-score/personal-loans-by-score" component={PersonalLoansByScorePage} />

      {/* Financial glossary */}
      <Route path="/glossary" component={GlossaryIndexPage} />
      <Route path="/glossary/:slug" component={GlossaryTermPage} />

      {/* Compare tools */}
      <Route path="/compare/credit-cards" component={CreditCardCompareTool} />

      {/* About page */}
      <Route path="/about" component={AboutPage} />

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
    </>
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
