"use client"

import { useRouter } from "next/navigation";
import Welcome from "./Welcome";

function HomeWelcome() {
  const router = useRouter();

  return <Welcome nextStep={() => router.push("/login")} />;
}

export default HomeWelcome;
