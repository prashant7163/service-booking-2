# Service Booking Two AgentInstance review matrix

All nine exact envelope subjects now have separate digest-bound owner approval records. The envelope files remain byte-for-byte unchanged with `lifecycle: pending`, `approval: null`, `approval_reference: null`, and `workspace_status: proposed-not-created`. These approval records authorize recording and validation only; they grant no activation, execution, workspace, GitHub, Git, evidence-submission, or readiness-submission authority.

| Identity / role | Responsibility | Proposed workspace | Allowed mutation scope | GitHub capability | Independence | Canonical envelope digest | Remaining condition |
|---|---|---|---|---|---|---|---|
| `service-booking-2-orchestrator` / Orchestrator | Reconcile first-milestone GitHub tracking while preserving local authority | `.worktrees/service-booking-2-register-github-tracking` | Four tracking/script locators in its work package | `github-project-workflow`, exact repository scope only | Cannot manufacture approval or waive gates | `f1e6f19b08ae56bfe13e8ec931fd0b3826c1929b19fc2fff23820ac08ec6c168` | Subject approved; activation/workspace remain unauthorized |
| `service-booking-2-architect` / Architect | Define API, data, security, privacy, and threat boundaries | `.worktrees/service-booking-2-define-architecture` | Three architecture/privacy locators | None | Cannot approve own implementation | `b932361a0938b6f5360435e3072ee5385f76eb3f7db7b47e1aebf43662537cd2` | Subject approved; activation/workspace remain unauthorized |
| `service-booking-2-ux` / UX/UI Designer | Define responsive bilingual accessible interaction flows | `.worktrees/service-booking-2-design-interactions` | `docs/ux/phase-one-flows.md` | None | Affected scope only | `5edff8279f9973ff7ecc8cd4b03f06dfd34d68da3ec17db4871812d23b714f6b` | Subject approved; activation/workspace remain unauthorized |
| `service-booking-2-backend` / Backend Engineer | Build the Spring Boot, PostgreSQL/Flyway, auth/session, and simulated-adapter foundation | `.worktrees/service-booking-2-build-backend-foundation` | `backend` and `compose.yaml` | None | Separate from Code Reviewer and Independent Auditor; cannot self-review | `4bf5a2cf898f8169fc7597a1494fc97bc867d2029633823399eb8e96842706dd` | Subject approved; activation/workspace remain unauthorized |
| `service-booking-2-frontend` / Frontend Engineer | Build the React bilingual role-bound shell and tests | `.worktrees/service-booking-2-build-frontend-shell` | `frontend` | None | Separate from Code Reviewer and Independent Auditor; cannot self-review | `413f80ee9dfee3e171f2d92a2cf86dd912542971d33d7775f6a85e7d0f97e2c6` | Subject approved; activation/workspace remain unauthorized |
| `service-booking-2-code-reviewer` / Code Reviewer | Independently review the exact candidate | `.worktrees/service-booking-2-foundation-code-review` | Candidate read-only; return review for Orchestrator persistence | None | Independent from Orchestrator, Architect, UX, Backend, and Frontend; cannot edit or review own work | `ce9b18fad4ed8f726e74aeb59fa41c7774fda2e60aca595e94090620ba1d57fd` | Subject approved; activation/workspace remain unauthorized |
| `service-booking-2-build-manager` / Build Manager | Verify locked-input reproducible build and PostgreSQL startup | `.worktrees/service-booking-2-foundation-build` | Candidate remediation prohibited; transient verification only | None | Independent from Orchestrator, Architect, UX, Backend, and Frontend; no remediation before assignment | `daa4d32b9d6bd73b0ecd0045c9a49a62ed2f8e82dc6a041eaeba4af4b3acc1c6` | Subject approved; activation/workspace remain unauthorized |
| `service-booking-2-quality-engineer` / Quality Engineer | Verify the full supported foundation blast radius | `.worktrees/service-booking-2-foundation-quality` | Candidate remediation prohibited; transient verification only | None | Independent from Orchestrator, Architect, UX, Backend, and Frontend; cannot declare owner approval | `3af00617515d904b83a9f81ca337a5de9d81ca9ebc88fbbf9e7fd65f2766e071` | Subject approved; activation/workspace remain unauthorized |
| `service-booking-2-independent-auditor` / Independent Auditor | Audit the exact-snapshot evidence chain and report only to the Orchestrator | `.worktrees/service-booking-2-foundation-audit` | Candidate and evidence chain read-only; return audit report | None | Independent from Code Reviewer, Orchestrator, Architect, UX, Backend, and Frontend; cannot audit own work or dispatch remediation | `3849bb3a71045dbbd807a5fe948b3bade8c4b4ab1e981c0477e8fa71ae192e5e` | Subject approved; activation/workspace remain unauthorized |

## Exact approved subjects

Each separate owner approval uses `subject_type: agent_instance`, the exact identity as `subject_id`, and the corresponding approval-subject digest below. Approval of this matrix or of the canonical file digest is not a substitute.

```text
service-booking-2-orchestrator: 8a1ed0bebadba9a51e8f6b4ae3870a9c45c9b1e13b862ac65b43350ee2e96604
service-booking-2-architect: ca8e838cb4a501d930ef002788eb51f704d4519898b91a28ce776c2aabbdf4f4
service-booking-2-ux: d04a9e4b663a248638df1a32a3c8491b8ebb91824d25d0730a2297ff2b7cd8be
service-booking-2-backend: c1a99d6a052a563ddd009d68a221f79e72c05fe6a7351cb1edc346bc59222a30
service-booking-2-frontend: 9c83b9124aa824dbf5bbbd2aac7125103fd691302ef52e1703f021c85074e5a3
service-booking-2-code-reviewer: e9ea641778c9a86cbd15f7a5933ff58a6c94cd7e911d4e5f0fb979dde7fee165
service-booking-2-build-manager: 77d228fa8534f133036db89715bf13952b5aeb2d8de99e45b841c8cbee81b587
service-booking-2-quality-engineer: 49de54ec821b5785a484903c7ba96c125aabe0896e979e6e3e59c607079f1cb6
service-booking-2-independent-auditor: d580824d955206dfa9f934edacdb607a6c304c1e5fe48b7e204fdde451a831fd
```

## Recorded approval artifacts

| Subject | Approval ID | Canonical approval digest |
|---|---|---|
| `service-booking-2-orchestrator` | `apr-service-booking-2-orchestrator-001` | `bc54d9889c40ba2df3979a7c08db1dd3eb9a41418f38612b2f19a96cff1f0b97` |
| `service-booking-2-architect` | `apr-service-booking-2-architect-001` | `4db5cec4c2b152dd19939ab7e74d22f75ada4aa0143796acd93ecf6a6095cd6e` |
| `service-booking-2-ux` | `apr-service-booking-2-ux-001` | `6421495a0f2503d1b2e5aafa6aee68b1822a8ed0aa778088505e4950262dd0e0` |
| `service-booking-2-backend` | `apr-service-booking-2-backend-001` | `ef56b201057b35ea10f73d0c2710e47c148304f94e8190cb9d709e069bc9e0a0` |
| `service-booking-2-frontend` | `apr-service-booking-2-frontend-001` | `bd7449bdd601c55049ab592f1d71e0d7214decbcb282952c7de51eeb451ae60a` |
| `service-booking-2-code-reviewer` | `apr-service-booking-2-code-reviewer-001` | `f01663c70cf3f499ea886d74cec262a0669928cb0f809df814528378b7803c81` |
| `service-booking-2-build-manager` | `apr-service-booking-2-build-manager-001` | `a0b4c699ebc2267dc3b2bd6372066de64e60b63ffb3865ea1f253690c6cb888a` |
| `service-booking-2-quality-engineer` | `apr-service-booking-2-quality-engineer-001` | `97914616fb6ababb0f12932ea9d966183bf40bbd8a74a82eb8e8c091f333fd3c` |
| `service-booking-2-independent-auditor` | `apr-service-booking-2-independent-auditor-001` | `96f7b14e22d923474ce25367a8c3526cbc889154a56ca69a0513878e36b10f57` |

These approvals authorize recording and revalidation of the nine exact pending envelope subjects only. Instance activation requires a separate successor-envelope and Studio lifecycle sequence; worktree creation, task creation, dispatch, GitHub mutation, evidence submission, and readiness submission also remain separately unauthorized.
