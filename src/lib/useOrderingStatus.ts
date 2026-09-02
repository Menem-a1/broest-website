import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useOrderingStatus() {
  const [isPaused, setIsPaused] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchStatus() {
    const { data } = await supabase
      .from("ordering_status")
      .select("*")
      .eq("id", 1)
      .single();
    setIsPaused(data?.is_ordering_paused ?? false);
    setMessage(data?.paused_message ?? "");
    setLoading(false);
  }

  useEffect(() => {
    fetchStatus();
  }, []);

  return { isPaused, message, loading, refetch: fetchStatus };
}
