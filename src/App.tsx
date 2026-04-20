import "@/App.css";
import Show from "@/pages/show";
import { Route, Switch } from "wouter";

export default function App() {
  return (
    <main className="flex min-h-svh w-svw flex-col items-center bg-olive-200 py-8 text-olive-600 antialiased">
      <Switch>
        <Route path=":showSlug" component={Show} />
      </Switch>
    </main>
  );
}
