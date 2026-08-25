import { expect, test } from "bun:test";

const validationRoot = new URL(
  "../../../openspec/changes/validate-observability-mvp-poc/validation/",
  import.meta.url,
);
const validationModule = new URL("validate.ts", validationRoot).href;
const requiredArtifacts = [
  "README.md",
  "agent-engineer.md",
  "maintainer.md",
  "participant-record.template.json",
  "profile-decision.template.json",
  "gate-status.json",
  "validate.ts",
];
const artifact = (name: string) => Bun.file(new URL(name, validationRoot));
const loadValidation = async () => import(validationModule);
const profileCode = { "agent-engineer": "AE", maintainer: "MT" } as const;
type Profile = keyof typeof profileCode;
const participantRef = (profile: Profile, sequence = "01") =>
  `participant-${profileCode[profile]}${sequence}`;
const participant = (profile: Profile, sequence = "01") => ({
  participantRef: participantRef(profile, sequence),
  sessionRef: `session-${profileCode[profile]}${sequence}`,
  profile,
  exerciseVersion: "v1",
  tasks: ["01", "02", "03", "04"].map((suffix) => ({
    assistance: "none",
    duration: "under-5m",
    id: `${profileCode[profile]}-${suffix}`,
    result: "completed",
  })),
  metrics: {
    comprehension: "clear",
    misleadingRisk: "none",
    navigation: "independent",
    usefulness: "useful",
  },
  observationCodes: [profile === "agent-engineer" ? "AE-NAV-COMPLETE" : "MT-SDD-DISTINGUISHED"],
  payloadCapture: "none",
});
const decision = (profile: Profile, participantRefs = [participantRef(profile)]) => ({
  decision: "continue",
  decisionOwnerRef: `owner-${profileCode[profile]}01`,
  participantRefs,
  profile,
  rationaleCodes: [profile === "agent-engineer" ? "AE-VALUE-CONFIRMED" : "MT-VALUE-CONFIRMED"],
});
test("documents and validates a payload-free pending kit before participant observation", async () => {
  for (const name of requiredArtifacts) expect(await artifact(name).exists()).toBe(true);
  const readme = await artifact("README.md").text();
  expect(readme).toContain("Quick path");
  expect(readme).toContain("Privacy boundary");
  expect(readme).toContain("pending");
  const validation = await loadValidation();
  const [status, template] = await Promise.all([
    artifact("gate-status.json").json(),
    artifact("profile-decision.template.json").json(),
  ]);
  const agent = participant("agent-engineer");
  const maintainer = participant("maintainer");
  expect(() => validation.validateGateStatus(status)).not.toThrow();
  expect(() => validation.validateDecisionTemplate(template)).not.toThrow();
  expect(status).toMatchObject({
    liveEligible: false,
    participantCount: 0,
    profiles: { "agent-engineer": false, maintainer: false },
  });
  for (const record of [agent, maintainer]) {
    expect(() => validation.validateParticipantRecord(record)).not.toThrow();
    expect(() => validation.validateDecisionRecord(decision(record.profile))).not.toThrow();
  }
});
test("rejects unknown, free-form, payload-like, and invalid enum values without echoing values", async () => {
  const validation = await loadValidation();
  const payloadLikeValue = "private-payload-value";
  const agent = participant("agent-engineer");
  const invalidParticipants = [
    { ...agent, notes: payloadLikeValue },
    { ...agent, payloadCapture: payloadLikeValue },
    { ...agent, profile: "operator" },
    { ...agent, tasks: [{ ...agent.tasks[0], id: "AE-99" }] },
    { ...agent, tasks: [] },
    { ...agent, tasks: [...agent.tasks.slice(0, 3), agent.tasks[0]] },
    { ...agent, metrics: { ...agent.metrics, usefulness: "excellent" } },
  ];
  for (const candidate of invalidParticipants)
    expect(() => validation.validateParticipantRecord(candidate)).toThrow(
      "Invalid participant record.",
    );
  expect(() =>
    validation.validateDecisionRecord({
      ...decision("agent-engineer"),
      participantRefs: [participantRef("agent-engineer"), participantRef("agent-engineer")],
    }),
  ).toThrow();
});
test("rejects false live eligibility and leaves no participant records beside templates", async () => {
  const validation = await loadValidation();
  const invalidStatus = {
    decisions: { "agent-engineer": "pending", maintainer: "pending" },
    liveEligible: true,
    participantCount: 0,
    profiles: { "agent-engineer": false, maintainer: false },
    blockers: ["participants-pending"],
  };
  const agent = participant("agent-engineer");
  const maintainer = participant("maintainer");
  const agentTwo = participant("agent-engineer", "02");
  const eligibleParticipants = [agent, maintainer, agentTwo];
  const eligibleDecisions = [
    decision("agent-engineer", [agent.participantRef, agentTwo.participantRef]),
    decision("maintainer"),
  ];
  const expectIneligible = (
    decisions: ReadonlyArray<unknown>,
    participants: ReadonlyArray<unknown> = eligibleParticipants,
  ) =>
    expect(validation.evaluateLiveEligibility({ decisions, participants })).toEqual({
      liveEligible: false,
    });

  expect(() => validation.validateGateStatus(invalidStatus)).toThrow();
  expectIneligible([decision("agent-engineer")], [agent]);
  expect(
    validation.evaluateLiveEligibility({
      decisions: eligibleDecisions,
      participants: eligibleParticipants,
    }),
  ).toEqual({ liveEligible: true });
  for (const decisions of [
    [decision("agent-engineer"), decision("maintainer")],
    [
      decision("agent-engineer", [agent.participantRef, maintainer.participantRef]),
      decision("maintainer"),
    ],
    [
      { ...decision("maintainer"), decisionOwnerRef: "owner-AE01" },
      decision("agent-engineer", [agent.participantRef, agentTwo.participantRef]),
    ],
  ])
    expectIneligible(decisions);
  expectIneligible(eligibleDecisions, [
    agent,
    maintainer,
    {
      ...agentTwo,
      tasks: agentTwo.tasks.map((task) => ({ ...task, result: "not-attempted" })),
    },
  ]);
  const files = await Array.fromAsync(
    new Bun.Glob("*.json").scan({ cwd: validationRoot.pathname }),
  );
  expect(files.sort()).toEqual([
    "gate-status.json",
    "participant-record.template.json",
    "profile-decision.template.json",
  ]);
});
