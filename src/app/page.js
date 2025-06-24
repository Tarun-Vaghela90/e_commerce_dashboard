"use client";

import Signup from "@/app/signup/page";

export default function Home() {
  const notify = () => toast.success("Wow so easy!");

  return (
    <main className="p-4">


      <Signup />
    </main>
  );
}
