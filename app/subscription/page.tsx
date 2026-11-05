import SubscriptionPlans from "@/components/SubscriptionPlans";

export default function SubscriptionPage(){
    return (
    <main>
      <h1 className="text-2xl font-bold p-6">
        Choose Your Subscription
      </h1>

      <SubscriptionPlans />
    </main>
  );
}