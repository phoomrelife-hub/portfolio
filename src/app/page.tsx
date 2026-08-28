import { IntroScene } from "@/components/intro/intro-scene";
import { IntroProvider } from "@/lib/intro-context";
import { Hero } from "@/components/sections/hero";
import { Role } from "@/components/sections/role";
import { Work } from "@/components/sections/work";
import { WorkDetail } from "@/components/sections/work-detail";
import { Proud } from "@/components/sections/proud";
import { Mistakes } from "@/components/sections/mistakes";
import { Strengths } from "@/components/sections/strengths";
import { Support } from "@/components/sections/support";
import { Goals } from "@/components/sections/goals";
import { Scorecard } from "@/components/sections/scorecard";
import { Proposals } from "@/components/sections/proposals";
import { Closing } from "@/components/sections/closing";

export default function Home() {
  return (
    <main className="relative w-full">
      <IntroProvider>
        <IntroScene />
        <Hero />
        <Role />
        <Work />
        <WorkDetail />
        <Proud />
        <Mistakes />
        <Strengths />
        <Support />
        <Goals />
        <Scorecard />
        <Proposals />
        <Closing />
      </IntroProvider>
    </main>
  );
}
