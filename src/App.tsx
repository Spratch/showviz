import "@/App.css";
import Show from "@/pages/show";
import { Route, Switch } from "wouter";
import Index from "./pages";

export default function App() {
  return (
    <div className="flex min-h-svh w-svw flex-col items-center bg-olive-200 text-olive-600 antialiased">
      <Switch>
        <Route path="/" component={Index} />
        <Route path=":showSlug" component={Show} />
      </Switch>
    </div>
  );
}
