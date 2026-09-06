"use client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import PayAsYouGoModels from "@/components/PayAsYouGoModels";

const GA_CLIENT_ID = "264062651955-8qamru5vjtu9kc1tk2trsgte5e10hm0m.apps.googleusercontent.com";

export default function FeaturedComponents() {
  return (
    <GoogleOAuthProvider clientId={GA_CLIENT_ID}>
      <section id="plans" aria-labelledby="featured-heading-plans" className="relative overflow-hidden bg-gradient-to-b from-background via-background to-background/95 pt-10 pb-20 md:pt-14 md:pb-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">

          <PayAsYouGoModels />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8 justify-items-center lg:max-w-5xl lg:mx-auto mb-12">
            <div className="w-full max-w-md text-xs text-muted-foreground space-y-1">
              <p>* Limits depend on the model and may be lower.</p>
              <p>** Pro token availability is calculated dynamically across the billing month, including usage relative to the percentage of the billing period elapsed.</p>
              <p>Anonymous access is limited to 500,000 tokens/day with 60 r/h, 10 r/m, and 1 r/s. Free token access is limited to 1,000,000 tokens/day with 250 r/h, 60 r/m, and 2 r/s.</p>
              <p>Daily token usage is input tokens plus output tokens over a rolling 24-hour window. Usage-billed paid requests are not limited by a daily token quota, but remain subject to balance, rate limits, and availability.</p>
              <p>If you need more capacity, please contact us via {" "}
               <a href="mailto:support@llm7.io?subject=Subscription Inquiry&body=Hey, I would like to discuss subscription options." className="text-primary underline underline-offset-4">
                  support@llm7.io
                  </a>.</p>
            </div>
          </div>
        </div>
      </section>
    </GoogleOAuthProvider>
  );
}
