"use client";

import { useEffect, useState } from "react";
import type { ComplianceResult } from "@/lib/compliance/compliance-checker";
import { getSignOff } from "@/lib/compliance/audit-trail";
import { SoaGate, PipelineStages } from "./PipelineStages";

interface Props {
  clientId: string;
  factFindComplete: boolean;
  factFindProgress: number;
  result: ComplianceResult;
}

export function PipelineStagesClient({
  clientId,
  factFindComplete,
  factFindProgress,
  result,
}: Props) {
  const [signedOff, setSignedOff] = useState(false);

  useEffect(() => {
    setSignedOff(Boolean(getSignOff(clientId)));
    const id = setInterval(
      () => setSignedOff(Boolean(getSignOff(clientId))),
      1500,
    );
    return () => clearInterval(id);
  }, [clientId]);

  return (
    <PipelineStages
      clientId={clientId}
      factFindComplete={factFindComplete}
      factFindProgress={factFindProgress}
      result={result}
      signedOff={signedOff}
    />
  );
}

export function SoaGateClient({
  clientId,
  result,
}: {
  clientId: string;
  result: ComplianceResult;
}) {
  const [signedOff, setSignedOff] = useState(false);

  useEffect(() => {
    setSignedOff(Boolean(getSignOff(clientId)));
    const id = setInterval(
      () => setSignedOff(Boolean(getSignOff(clientId))),
      1500,
    );
    return () => clearInterval(id);
  }, [clientId]);

  return <SoaGate clientId={clientId} result={result} signedOff={signedOff} />;
}
