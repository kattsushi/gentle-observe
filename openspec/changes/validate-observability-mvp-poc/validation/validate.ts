type Profile = "agent-engineer" | "maintainer";
type RecordValue = Record<string, unknown>;
const profiles = ["agent-engineer", "maintainer"] as const;
const taskIds = {
  "agent-engineer": ["AE-01", "AE-02", "AE-03", "AE-04"],
  maintainer: ["MT-01", "MT-02", "MT-03", "MT-04"],
} as const;
const taskResults = ["completed", "not-completed", "not-attempted"];
const assistanceLevels = ["none", "minimal", "substantial"];
const durationBuckets = ["under-5m", "5-to-10m", "over-10m"];
const comprehensionLevels = ["clear", "unclear"];
const navigationLevels = ["independent", "assisted", "blocked"];
const usefulnessLevels = ["useful", "unclear", "not-useful"];
const misleadingRiskLevels = ["none", "possible", "high"];
const observationCodes = [
  "AE-NAV-COMPLETE",
  "AE-RUNTIME-PROCESS-DISTINGUISHED",
  "AE-VALUE-CONFIRMED",
  "MT-NAV-COMPLETE",
  "MT-SDD-DISTINGUISHED",
  "MT-VALUE-CONFIRMED",
] as const;
const rationaleCodes = [
  "AE-VALUE-CONFIRMED",
  "MT-VALUE-CONFIRMED",
  "REVISE-NAVIGATION",
  "STOP-NO-VALUE",
];
const blockers = [
  "participants-pending",
  "agent-engineers-not-represented",
  "maintainers-not-represented",
  "agent-engineer-decision-pending",
  "maintainer-decision-pending",
  "profile-decision-not-continue",
] as const;
const invalid = (kind: "participant" | "decision" | "gate status") => {
  throw new Error(`Invalid ${kind} record.`);
};
const isRecord = (value: unknown): value is RecordValue =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const exactKeys = (value: RecordValue, keys: string) => {
  const expected = keys.split(" ");
  return Object.keys(value).length === expected.length && expected.every((key) => key in value);
};
const isOneOf = (value: unknown, values: ReadonlyArray<string>) =>
  typeof value === "string" && values.some((candidate) => candidate === value);
const arrayOf = <Value>(
  value: unknown,
  predicate: (item: unknown) => item is Value,
): value is Value[] => Array.isArray(value) && value.every(predicate);
const exactSet = (actual: unknown, expected: ReadonlyArray<unknown>) =>
  Array.isArray(actual) &&
  actual.length === expected.length &&
  new Set(actual).size === actual.length &&
  expected.every((value) => actual.includes(value));
type ValueValidator = (value: unknown) => boolean;
const profileValues = (value: unknown, predicate: ValueValidator): value is RecordValue =>
  isRecord(value) &&
  exactKeys(value, profiles.join(" ")) &&
  profiles.every((profile) => predicate(value[profile]));
const isProfile = (value: unknown): value is Profile => isOneOf(value, profiles);
const isDecision = (value: unknown) => isOneOf(value, ["continue", "pivot", "stop"]);
const isDecisionOrPending = (value: unknown) => isDecision(value) || value === "pending";
const isReference = (value: unknown, prefix: "participant" | "session" | "owner") =>
  typeof value === "string" && new RegExp(`^${prefix}-[A-Z]{2}[0-9]{2}$`).test(value);
const validTask = (value: unknown, profile: Profile): value is RecordValue =>
  isRecord(value) &&
  exactKeys(value, "id result assistance duration") &&
  isOneOf(value.id, taskIds[profile]) &&
  isOneOf(value.result, taskResults) &&
  isOneOf(value.assistance, assistanceLevels) &&
  isOneOf(value.duration, durationBuckets);
const validTaskSet = (value: unknown, profile: Profile): value is RecordValue[] =>
  arrayOf(value, (task): task is RecordValue => validTask(task, profile)) &&
  exactSet(
    value.map((task) => task.id),
    taskIds[profile],
  );
const attemptedTaskSet = (value: unknown, profile: Profile) =>
  validTaskSet(value, profile) && value.every((task) => task.result !== "not-attempted");
const validMetrics = (value: unknown) =>
  isRecord(value) &&
  exactKeys(value, "comprehension navigation usefulness misleadingRisk") &&
  isOneOf(value.comprehension, comprehensionLevels) &&
  isOneOf(value.navigation, navigationLevels) &&
  isOneOf(value.usefulness, usefulnessLevels) &&
  isOneOf(value.misleadingRisk, misleadingRiskLevels);
const validParticipant = (value: unknown): value is RecordValue =>
  isRecord(value) &&
  exactKeys(
    value,
    "participantRef sessionRef profile exerciseVersion tasks metrics observationCodes payloadCapture",
  ) &&
  isProfile(value.profile) &&
  isReference(value.participantRef, "participant") &&
  isReference(value.sessionRef, "session") &&
  value.exerciseVersion === "v1" &&
  validTaskSet(value.tasks, value.profile) &&
  validMetrics(value.metrics) &&
  arrayOf(value.observationCodes, (code): code is string => isOneOf(code, observationCodes)) &&
  value.payloadCapture === "none";
const validDecision = (value: unknown, allowPending: boolean) =>
  isRecord(value) &&
  exactKeys(value, "profile decision decisionOwnerRef participantRefs rationaleCodes") &&
  isProfile(value.profile) &&
  (isDecision(value.decision) || (allowPending && value.decision === "pending")) &&
  isReference(value.decisionOwnerRef, "owner") &&
  arrayOf(value.participantRefs, (ref): ref is string => isReference(ref, "participant")) &&
  arrayOf(value.rationaleCodes, (code): code is string => isOneOf(code, rationaleCodes)) &&
  (value.decision === "pending" ||
    (value.participantRefs.length > 0 && exactSet(value.participantRefs, value.participantRefs)));
export const validateParticipantRecord = (value: unknown): void =>
  validParticipant(value) ? undefined : invalid("participant");
export const validateDecisionRecord = (value: unknown): void =>
  validDecision(value, false) ? undefined : invalid("decision");
export const validateDecisionTemplate = (value: unknown): void =>
  validDecision(value, true) ? undefined : invalid("decision");
export const validateGateStatus = (value: unknown): void => {
  if (
    !isRecord(value) ||
    !exactKeys(value, "participantCount profiles decisions liveEligible blockers")
  ) {
    return invalid("gate status");
  }
  const profilesValue = value.profiles;
  const decisionsValue = value.decisions;
  if (
    !Number.isInteger(value.participantCount) ||
    value.participantCount < 0 ||
    !profileValues(profilesValue, (profileValue) => typeof profileValue === "boolean") ||
    !profileValues(decisionsValue, isDecisionOrPending) ||
    typeof value.liveEligible !== "boolean" ||
    !arrayOf(value.blockers, (blocker): blocker is string => isOneOf(blocker, blockers))
  ) {
    return invalid("gate status");
  }
  const eligible =
    value.participantCount >= 3 &&
    value.participantCount <= 5 &&
    profiles.every(
      (profile) => profilesValue[profile] === true && decisionsValue[profile] === "continue",
    ) &&
    value.blockers.length === 0;
  if (value.liveEligible !== eligible) invalid("gate status");
};
export const evaluateLiveEligibility = ({
  decisions,
  participants,
}: {
  readonly decisions: ReadonlyArray<unknown>;
  readonly participants: ReadonlyArray<unknown>;
}) => {
  try {
    participants.forEach(validateParticipantRecord);
    decisions.forEach(validateDecisionRecord);
  } catch {
    return { liveEligible: false } as const;
  }
  const participantRecords = participants.filter(isRecord);
  const decisionRecords = decisions.filter(isRecord);
  const references = new Set(participantRecords.map((record) => record.participantRef));
  const participantRefsFor = (profile: Profile) =>
    participantRecords
      .filter((record) => record.profile === profile)
      .map((record) => record.participantRef);
  const hasContinueDecision = (profile: Profile) => {
    const records = decisionRecords.filter((record) => record.profile === profile);
    const [record] = records;
    return (
      records.length === 1 &&
      record?.decision === "continue" &&
      exactSet(record.participantRefs, participantRefsFor(profile))
    );
  };
  const completeEvidence = participantRecords.every(
    (record) => isProfile(record.profile) && attemptedTaskSet(record.tasks, record.profile),
  );
  const hasIndependentContinueDecisions =
    decisionRecords.length === profiles.length &&
    profiles.every(hasContinueDecision) &&
    new Set(decisionRecords.map((record) => record.decisionOwnerRef)).size === profiles.length;
  return {
    liveEligible:
      references.size === participantRecords.length &&
      references.size >= 3 &&
      references.size <= 5 &&
      completeEvidence &&
      profiles.every((profile) =>
        participantRecords.some((record) => record.profile === profile),
      ) &&
      hasIndependentContinueDecisions,
  } as const;
};
