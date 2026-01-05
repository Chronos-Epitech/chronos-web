"use client";

import { useTrpcClient } from "@/trpc/client";
import { useEffect, useState } from "react";

export default function Test() {
  const trpc = useTrpcClient();
  const [me, setMe] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const user = await trpc.user.me.query();
        setMe(user);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    }
    load();
  }, [trpc]);

  return (
    <div>
      {error && <div className="text-red-600">{error}</div>}
      <pre className="whitespace-pre-wrap wrap-break-word">
        {JSON.stringify(me, null, 2)}
      </pre>
    </div>
  );
}
