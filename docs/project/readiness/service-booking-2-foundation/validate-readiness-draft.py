from __future__ import annotations

import json
import hashlib
from pathlib import Path, PurePosixPath

from agentic_studio.contracts import AgentInstance, Approval, ExternalCapability, MilestoneReadiness
from agentic_studio.persistence.artifacts import (
    GenericSupportingEvidence,
    canonical_artifact_digest,
)


ROOT = Path(__file__).resolve().parents[4]
BASE = ROOT / "docs/project/readiness/service-booking-2-foundation"
RUN = ROOT / ".studio/runs/service-booking-2-benchmark"

EXPECTED_EVIDENCE = {
    "accepted-snapshot-bindings.json": "6a4f7692f1650f4c64f9cfd2a1780d2b688f5b0ebf8382fd3eea373305b60761",
    "doctor-result.json": "690b7a0dcefdb880c549b11e325ca67a644c9e9a9645b51323463437f82bfb93",
    "effective-standards.json": "d2d9fb05b177a1bf863e0423ada615800875020181c2dde6bac88a1e7a465073",
    "instance-binding-assessment.json": "114adc2e723bf5f7838da25349ab87a84de59ed90d2bb90627f61f28f7b143fe",
    "integration-contracts.json": "153e510843382ee5d38d3ec4832c095ad79aaf6d9f087a54d275bcc26261bdb9",
    "integration-test-plan.json": "7fe964eb0088d2cd50d0ab1cd59d0b26d9e74e0596d558fa89d42921f8516b9c",
    "interface-decisions.json": "3cf10defdd897de720453a9eef9994f9e85640be43cce0c7b9ec41587321770b",
    "prerequisite-validation.json": "7c15fd261bd40cfa9c414d1e495d098999b504924ca025c225cdd64135bc5c45",
    "role-skill-independence.json": "15aaad95d3979fae6d5613ae9d2b5fe1e99019c81519ab2b47c8b1a0a1cefe4d",
    "rolling-progress-plan.json": "7f956eedbe8ed1f2ea7663d3e71f60792b5a7f95bd4b394644544dbdbfeba35c",
    "threat-model-decision.json": "8703430c7a1289bb75e8ef6bcb037baeba496d72623d8069bb68e2f053bdc635",
    "trusted-capability-assessment.json": "9a3566483c1ac894cae684c9b6eb742b5ef5f3e82b9793a147de6e4289bb0899",
    "work-packages.json": "631a5a8ec93d2b9f0f6953e88cf611ffa6a12b74dd8009d728f8712487de801a",
}

EXPECTED_READINESS_DIGEST = (
    "387541159810c30007dc2e9353c5acc9016d89f95e4655cfe111b2587289b4d9"
)

EXPECTED_REVIEW_MATRIX_FILE_SHA = (
    "f137e7bff553a11b14cb06ba3becacea399a91c14ed27e80b8896557cc55a284"
)

EXPECTED_INSTANCES = {
    "service-booking-2-orchestrator": (
        "orchestrator-tech-lead", "service-booking-2-register-github-tracking",
        ".worktrees/service-booking-2-register-github-tracking",
        "f1e6f19b08ae56bfe13e8ec931fd0b3826c1929b19fc2fff23820ac08ec6c168",
        "8a1ed0bebadba9a51e8f6b4ae3870a9c45c9b1e13b862ac65b43350ee2e96604",
    ),
    "service-booking-2-architect": (
        "architect", "service-booking-2-define-architecture",
        ".worktrees/service-booking-2-define-architecture",
        "b932361a0938b6f5360435e3072ee5385f76eb3f7db7b47e1aebf43662537cd2",
        "ca8e838cb4a501d930ef002788eb51f704d4519898b91a28ce776c2aabbdf4f4",
    ),
    "service-booking-2-ux": (
        "ux-ui-designer", "service-booking-2-design-interactions",
        ".worktrees/service-booking-2-design-interactions",
        "5edff8279f9973ff7ecc8cd4b03f06dfd34d68da3ec17db4871812d23b714f6b",
        "d04a9e4b663a248638df1a32a3c8491b8ebb91824d25d0730a2297ff2b7cd8be",
    ),
    "service-booking-2-backend": (
        "backend-engineer", "service-booking-2-build-backend-foundation",
        ".worktrees/service-booking-2-build-backend-foundation",
        "4bf5a2cf898f8169fc7597a1494fc97bc867d2029633823399eb8e96842706dd",
        "c1a99d6a052a563ddd009d68a221f79e72c05fe6a7351cb1edc346bc59222a30",
    ),
    "service-booking-2-frontend": (
        "frontend-engineer", "service-booking-2-build-frontend-shell",
        ".worktrees/service-booking-2-build-frontend-shell",
        "413f80ee9dfee3e171f2d92a2cf86dd912542971d33d7775f6a85e7d0f97e2c6",
        "9c83b9124aa824dbf5bbbd2aac7125103fd691302ef52e1703f021c85074e5a3",
    ),
    "service-booking-2-code-reviewer": (
        "code-reviewer", "service-booking-2-foundation-code-review",
        ".worktrees/service-booking-2-foundation-code-review",
        "ce9b18fad4ed8f726e74aeb59fa41c7774fda2e60aca595e94090620ba1d57fd",
        "e9ea641778c9a86cbd15f7a5933ff58a6c94cd7e911d4e5f0fb979dde7fee165",
    ),
    "service-booking-2-build-manager": (
        "build-manager", "service-booking-2-foundation-build",
        ".worktrees/service-booking-2-foundation-build",
        "daa4d32b9d6bd73b0ecd0045c9a49a62ed2f8e82dc6a041eaeba4af4b3acc1c6",
        "77d228fa8534f133036db89715bf13952b5aeb2d8de99e45b841c8cbee81b587",
    ),
    "service-booking-2-quality-engineer": (
        "quality-engineer", "service-booking-2-foundation-quality",
        ".worktrees/service-booking-2-foundation-quality",
        "3af00617515d904b83a9f81ca337a5de9d81ca9ebc88fbbf9e7fd65f2766e071",
        "49de54ec821b5785a484903c7ba96c125aabe0896e979e6e3e59c607079f1cb6",
    ),
    "service-booking-2-independent-auditor": (
        "independent-auditor", "service-booking-2-foundation-audit",
        ".worktrees/service-booking-2-foundation-audit",
        "3849bb3a71045dbbd807a5fe948b3bade8c4b4ab1e981c0477e8fa71ae192e5e",
        "d580824d955206dfa9f934edacdb607a6c304c1e5fe48b7e204fdde451a831fd",
    ),
}

EXPECTED_ENVELOPE_FILE_SHA = {
    "service-booking-2-orchestrator": "dbe87d6999279cc9e9c3425d9914481f0e31bb04e75086120b63f355f73dcea8",
    "service-booking-2-architect": "cc38fbebd4c0ca2921d32884580e46233bb80eec5596b6c30fbb933b2e6a5667",
    "service-booking-2-ux": "816f5c03294d805c84c77dbe6a69a09f3422eb69108ff13964920f79f42d14a1",
    "service-booking-2-backend": "7f786cdde706ed842907b28893cc65d6c5349828f7d8ff697ff72e2ae0bf5131",
    "service-booking-2-frontend": "b2267dc11222f8389c6dc188fe5554f18ef2c83a9bff150390bfe0d750c8210c",
    "service-booking-2-code-reviewer": "ad10c030f1f95fbb42a689708cfa4bbc84cfa57acfa7396881cf2efcd4aca2df",
    "service-booking-2-build-manager": "f8c7728b845e5ef83b9b534bda4febaf8db4b6c72fda909f170006f5a865a44e",
    "service-booking-2-quality-engineer": "1f0177926f56b4989a4832babbe72f5561282d9f30aabd4536750f02ac92ee5f",
    "service-booking-2-independent-auditor": "8add5df6fdde15d2f410dca013723c1c08bf4e68685d6df692e9f63bf053f3c8",
}

EXPECTED_INSTANCE_APPROVALS = {
    "service-booking-2-orchestrator": (
        "apr-service-booking-2-orchestrator-001",
        "bc54d9889c40ba2df3979a7c08db1dd3eb9a41418f38612b2f19a96cff1f0b97",
    ),
    "service-booking-2-architect": (
        "apr-service-booking-2-architect-001",
        "4db5cec4c2b152dd19939ab7e74d22f75ada4aa0143796acd93ecf6a6095cd6e",
    ),
    "service-booking-2-ux": (
        "apr-service-booking-2-ux-001",
        "6421495a0f2503d1b2e5aafa6aee68b1822a8ed0aa778088505e4950262dd0e0",
    ),
    "service-booking-2-backend": (
        "apr-service-booking-2-backend-001",
        "ef56b201057b35ea10f73d0c2710e47c148304f94e8190cb9d709e069bc9e0a0",
    ),
    "service-booking-2-frontend": (
        "apr-service-booking-2-frontend-001",
        "bd7449bdd601c55049ab592f1d71e0d7214decbcb282952c7de51eeb451ae60a",
    ),
    "service-booking-2-code-reviewer": (
        "apr-service-booking-2-code-reviewer-001",
        "f01663c70cf3f499ea886d74cec262a0669928cb0f809df814528378b7803c81",
    ),
    "service-booking-2-build-manager": (
        "apr-service-booking-2-build-manager-001",
        "a0b4c699ebc2267dc3b2bd6372066de64e60b63ffb3865ea1f253690c6cb888a",
    ),
    "service-booking-2-quality-engineer": (
        "apr-service-booking-2-quality-engineer-001",
        "97914616fb6ababb0f12932ea9d966183bf40bbd8a74a82eb8e8c091f333fd3c",
    ),
    "service-booking-2-independent-auditor": (
        "apr-service-booking-2-independent-auditor-001",
        "96f7b14e22d923474ce25367a8c3526cbc889154a56ca69a0513878e36b10f57",
    ),
}

EXPECTED_CAPABILITY_DIGEST = (
    "fd5bdf8aa26d8aee89df8352ba9946491139897668ca4fb1cc6a4c4c26a912c4"
)

EXPECTED_CAPABILITY_APPROVAL_DIGEST = (
    "41db542bbd1ffd88075f1d032b2b076be4c5a012857ab9a8d9ac143bc8775f85"
)

EXPECTED_ACTIVE_CAPABILITY_DIGEST = (
    "350927a500c2decc98165ec02d99c8e6b9b8749508b03e94f84666f88381e9eb"
)

EXPECTED_ACTIVATION_APPROVAL_DIGEST = (
    "7309943673323a2fed0a497466a459c731fad04a880cd1b6fdefc6d0bbde3b99"
)

EXPECTED_TASKS = {
    "service-booking-2-register-github-tracking",
    "service-booking-2-define-architecture",
    "service-booking-2-design-interactions",
    "service-booking-2-build-backend-foundation",
    "service-booking-2-build-frontend-shell",
}

EXPECTED_ASSURANCE = {
    "service-booking-2-foundation-code-review",
    "service-booking-2-foundation-build",
    "service-booking-2-foundation-quality",
    "service-booking-2-foundation-audit",
}


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def all_criterion_ids(value: object) -> set[str]:
    found: set[str] = set()
    if isinstance(value, dict):
        criterion_id = value.get("criterion_id")
        if isinstance(criterion_id, str):
            found.add(criterion_id)
        for child in value.values():
            found.update(all_criterion_ids(child))
    elif isinstance(value, list):
        for child in value:
            found.update(all_criterion_ids(child))
    return found


def is_safe_locator(locator: str) -> bool:
    path = PurePosixPath(locator)
    return bool(locator) and not path.is_absolute() and ".." not in path.parts


def conflicts(left: str, right: str) -> bool:
    return left == right or left.startswith(f"{right}/") or right.startswith(f"{left}/")


def validate() -> None:
    for name, expected_digest in sorted(EXPECTED_EVIDENCE.items()):
        model = GenericSupportingEvidence.model_validate(load(BASE / name))
        actual_digest = canonical_artifact_digest(model)
        assert actual_digest == expected_digest, (name, expected_digest, actual_digest)
    print(f"PASS supporting evidence: {len(EXPECTED_EVIDENCE)} files")

    capability = ExternalCapability.model_validate(
        load(BASE / "github-project-workflow-capability-draft.json")
    )
    capability_payload = capability.model_dump(mode="json")
    assert capability.sha256_digest() == EXPECTED_CAPABILITY_DIGEST
    assert capability.capability_id == "github-project-workflow"
    assert capability.status.value == "quarantined"
    assert capability.approval_reference is None
    assert capability.consuming_roles == ("orchestrator-tech-lead",)
    assert capability_payload["repository_scope"]["url"] == (
        "https://github.com/prashant7163/service-booking-2.git"
    )
    assert capability_payload["repository_scope"]["allowed_repository_count"] == 1
    assert capability_payload["repository_scope"]["all_other_repositories"] == "excluded"
    assert set(capability_payload["allowed_operations"]) == {
        "repository metadata read",
        "Git contents read",
        "Git contents write",
        "issues read",
        "issues write",
        "milestones read",
        "milestones write",
    }
    assert {
        "organization-wide access",
        "repository administration changes",
        "secrets access or management",
        "deployments",
        "packages",
        "GitHub Actions management",
        "pull-request management",
        "access to every repository other than prashant7163/service-booking-2",
    } == set(capability_payload["excluded_operations"])
    print(f"PASS fail-closed external capability: {capability.sha256_digest()}")

    approval = Approval.model_validate(
        load(BASE / "github-project-workflow-capability-approval.json")
    )
    assert approval.sha256_digest() == EXPECTED_CAPABILITY_APPROVAL_DIGEST
    assert approval.approval_id == "apr-service-booking-2-github-project-workflow-001"
    assert approval.subject_type == "external_capability"
    assert approval.subject_id == capability.capability_id
    assert approval.subject_digest == capability.sha256_digest()
    assert approval.decision.value == "approved"
    assert approval.decided_by == "application-owner"
    print(f"PASS capability owner approval: {approval.sha256_digest()}")

    active_capability = ExternalCapability.model_validate(
        load(BASE / "github-project-workflow-capability-active.json")
    )
    active_payload = active_capability.model_dump(mode="json")
    assert active_capability.sha256_digest() == EXPECTED_ACTIVE_CAPABILITY_DIGEST
    assert active_capability.capability_id == capability.capability_id
    assert active_capability.status.value == "active"
    assert active_capability.approval_reference is not None
    assert active_payload["repository_scope"] == capability_payload["repository_scope"]
    assert active_payload["allowed_operations"] == capability_payload["allowed_operations"]
    assert active_payload["excluded_operations"] == capability_payload["excluded_operations"]

    activation_approval = Approval.model_validate(
        load(BASE / "github-project-workflow-capability-activation-approval.json")
    )
    assert activation_approval.sha256_digest() == EXPECTED_ACTIVATION_APPROVAL_DIGEST
    assert (
        activation_approval.approval_id
        == "apr-service-booking-2-github-project-workflow-activation-001"
    )
    assert activation_approval.subject_type == "external_capability"
    assert activation_approval.subject_id == capability.capability_id
    assert activation_approval.subject_digest == capability.sha256_digest()
    assert activation_approval.decision.value == "approved"
    assert active_capability.approval_reference.artifact_id == activation_approval.subject_id
    assert active_capability.approval_reference.locator == (
        "docs/project/readiness/service-booking-2-foundation/"
        "github-project-workflow-capability-activation-approval.json"
    )
    assert (
        active_capability.approval_reference.sha256
        == EXPECTED_ACTIVATION_APPROVAL_DIGEST
    )
    run_state = load(RUN / "run.json")
    assert run_state["last_event_sequence"] == 7
    assert run_state["phase"] == "readiness_pending"
    assert run_state["task_states"] == {}
    assert run_state["capability_states"] == {"github-project-workflow": "active"}
    print(
        "PASS active capability and activation approval: "
        f"{active_capability.sha256_digest()}"
    )

    readiness = MilestoneReadiness.model_validate(load(BASE / "milestone-readiness-draft.json"))
    assert readiness.sha256_digest() == EXPECTED_READINESS_DIGEST
    assert readiness.readiness_id == "service-booking-2-foundation-readiness-draft-001"
    assert readiness.outcome.value == "revision_required"
    assert readiness.milestone_id == "service-booking-2-foundation"
    assert not readiness.approved_instances
    assert len(readiness.unresolved_items) == 2
    print(f"PASS readiness contract: {readiness.sha256_digest()}")

    instance_dir = BASE / "agent-instances"
    instance_paths = sorted(instance_dir.glob("*.json"))
    assert {path.stem for path in instance_paths} == set(EXPECTED_INSTANCES)
    instances: dict[str, AgentInstance] = {}
    for path in instance_paths:
        instance = AgentInstance.model_validate(load(path))
        payload = instance.model_dump(mode="json")
        role_id, work_package_id, workspace_locator, canonical_digest, subject_digest = (
            EXPECTED_INSTANCES[instance.agent_instance_id]
        )
        assert instance.role_template_id == role_id
        assert payload["assigned_work_package_ids"] == [work_package_id]
        assert payload["workspace"] == {
            "isolation_kind": "git-worktree",
            "locator": workspace_locator,
        }
        assert is_safe_locator(workspace_locator)
        assert instance.lifecycle.value == "pending"
        assert instance.approval is None
        assert payload["approval_reference"] is None
        assert payload["proposal_state"] == "proposed-unapproved-non-active"
        assert payload["workspace_status"] == "proposed-not-created"
        assert payload["project_id"] == "service-booking-2"
        assert payload["run_id"] == "service-booking-2-benchmark"
        assert payload["milestone_id"] == "service-booking-2-foundation"
        assert hashlib.sha256(path.read_bytes()).hexdigest() == EXPECTED_ENVELOPE_FILE_SHA[
            instance.agent_instance_id
        ]
        assert canonical_artifact_digest(instance) == canonical_digest
        assert instance.approval_subject_digest() == subject_digest
        assert len(instance.work_package_references) == 1
        assert instance.work_package_references[0].artifact_id == work_package_id
        assert instance.work_package_references[0].sha256 == EXPECTED_EVIDENCE[
            "work-packages.json"
        ]
        context_reference = instance.minimum_context_pack_reference
        assert context_reference.artifact_id == "service-booking-2-phase-one"
        assert context_reference.locator == "docs/project/planning/phase-one-milestone-plan.json"
        assert context_reference.sha256 == (
            "2c877de39821812f3b1014e83e968511f1474780f65bcc7d21e76433cd627073"
        )
        if instance.agent_instance_id == "service-booking-2-orchestrator":
            assert payload["external_capability_ids"] == ["github-project-workflow"]
            assert "gh-repository-scoped" in payload["permissions"]["tool_allowlist"]
            capability_refs = [
                ref for ref in instance.dependency_references
                if ref.artifact_id == "github-project-workflow"
            ]
            assert len(capability_refs) == 1
            assert capability_refs[0].sha256 == EXPECTED_ACTIVE_CAPABILITY_DIGEST
        else:
            assert payload["external_capability_ids"] == []
            assert payload["github_access"] == "none"
            assert "gh-repository-scoped" not in payload["permissions"]["tool_allowlist"]
            assert "no GitHub capability or GitHub operation" in payload["explicit_exclusions"]
        instances[instance.agent_instance_id] = instance

    for instance_id in (
        "service-booking-2-code-reviewer",
        "service-booking-2-independent-auditor",
    ):
        assert "read-only" in instances[instance_id].ownership_boundary
    for instance_id in (
        "service-booking-2-build-manager",
        "service-booking-2-quality-engineer",
    ):
        assert "candidate remediation is prohibited" in (
            instances[instance_id].ownership_boundary.lower()
        )
    assert "service-booking-2-code-reviewer" in load(
        instance_dir / "service-booking-2-independent-auditor.json"
    )["independent_from_instance_ids"]

    readiness_payload = readiness.model_dump(mode="json")
    draft_references = {
        item["artifact_id"]: item for item in readiness_payload["draft_instance_references"]
    }
    assert set(draft_references) == set(EXPECTED_INSTANCES)
    for instance_id, (_, _, _, canonical_digest, subject_digest) in EXPECTED_INSTANCES.items():
        reference = draft_references[instance_id]
        assert reference["locator"] == (
            f"docs/project/readiness/service-booking-2-foundation/agent-instances/{instance_id}.json"
        )
        assert reference["sha256"] == canonical_digest
        assert reference["approval_subject_digest"] == subject_digest

    approval_dir = BASE / "agent-instance-approvals"
    approval_paths = sorted(approval_dir.glob("*.json"))
    assert {path.stem for path in approval_paths} == {
        f"{instance_id}-approval" for instance_id in EXPECTED_INSTANCES
    }
    approvals: dict[str, Approval] = {}
    for path in approval_paths:
        approval = Approval.model_validate(load(path))
        payload = approval.model_dump(mode="json")
        instance = instances[approval.subject_id]
        approval_id, approval_digest = EXPECTED_INSTANCE_APPROVALS[approval.subject_id]
        assert approval.approval_id == approval_id
        assert approval.subject_type == "agent_instance"
        assert approval.subject_digest == instance.approval_subject_digest()
        assert approval.decision.value == "approved"
        assert approval.decided_by == "application-owner"
        assert canonical_artifact_digest(approval) == approval_digest
        assert payload["project_id"] == "service-booking-2"
        assert payload["run_id"] == "service-booking-2-benchmark"
        assert payload["milestone_id"] == "service-booking-2-foundation"
        assert payload["subject_locator"] == (
            "docs/project/readiness/service-booking-2-foundation/agent-instances/"
            f"{approval.subject_id}.json"
        )
        assert payload["authorization_scope"]["authorized"] == [
            "record-agent-instance-approval",
            "validate-agent-instance-approval",
        ]
        assert set(payload["authorization_scope"]["not_authorized"]) == {
            "modify-approved-agent-instance-envelope",
            "activate-agent-instance",
            "create-agent-or-worktree",
            "create-or-dispatch-task",
            "submit-supporting-evidence",
            "submit-readiness",
            "mutate-git-or-github",
            "begin-implementation",
        }
        approvals[approval.subject_id] = approval

    approval_references = {
        item["subject_id"]: item
        for item in readiness_payload["draft_instance_approval_references"]
    }
    assert set(approval_references) == set(EXPECTED_INSTANCE_APPROVALS)
    for instance_id, (approval_id, approval_digest) in EXPECTED_INSTANCE_APPROVALS.items():
        reference = approval_references[instance_id]
        assert reference["artifact_id"] == approval_id
        assert reference["subject_digest"] == instances[instance_id].approval_subject_digest()
        assert reference["locator"] == (
            "docs/project/readiness/service-booking-2-foundation/agent-instance-approvals/"
            f"{instance_id}-approval.json"
        )
        assert reference["sha256"] == approval_digest

    context_pack_dir = BASE / "agent-instance-context-packs"
    assert not context_pack_dir.exists() or not any(context_pack_dir.iterdir())
    matrix_path = BASE / "agent-instance-review-matrix.md"
    matrix_text = matrix_path.read_text(encoding="utf-8")
    assert hashlib.sha256(matrix_path.read_bytes()).hexdigest() == EXPECTED_REVIEW_MATRIX_FILE_SHA
    for instance_id, (_, _, _, canonical_digest, subject_digest) in EXPECTED_INSTANCES.items():
        assert instance_id in matrix_text
        assert canonical_digest in matrix_text
        assert subject_digest in matrix_text
        approval_id, approval_digest = EXPECTED_INSTANCE_APPROVALS[instance_id]
        assert approval_id in matrix_text
        assert approval_digest in matrix_text
    print(
        "PASS AgentInstance approvals: 9 exact owner-approved subjects; envelopes byte-for-byte "
        "unchanged, pending, null-approved, and non-active; no redundant context-pack artifacts"
    )

    index = load(RUN / "artifact-index.json")
    registered_ids = {item["subject_id"] for item in index}
    assert not (registered_ids & {item.approval_id for item in approvals.values()})
    accepted = {item["kind"]: item for item in index}
    assert readiness.specification_reference is not None
    assert readiness.plan_reference is not None
    for reference, kind in (
        (readiness.specification_reference, "specification"),
        (readiness.plan_reference, "plan"),
    ):
        assert reference.artifact_id == accepted[kind]["subject_id"]
        assert reference.locator == accepted[kind]["source_locator"]
        assert reference.sha256 == accepted[kind]["sha256"]
    print("PASS accepted snapshot bindings: specification and plan")

    spec_snapshot = load(ROOT / accepted["specification"]["snapshot_locator"])
    plan_snapshot = load(ROOT / accepted["plan"]["snapshot_locator"])
    milestone = next(
        item
        for item in plan_snapshot["milestones"]
        if item["milestone_id"] == "service-booking-2-foundation"
    )
    assert {item["task_id"] for item in milestone["tasks"]} == EXPECTED_TASKS
    plan_assurance = {
        item["verification_id"]
        for item in milestone["verification_steps"]
        if item["kind"] != "user_review"
    }
    assert plan_assurance == EXPECTED_ASSURANCE
    assert set(readiness.acceptance_criterion_ids) <= all_criterion_ids(spec_snapshot)
    assert len(readiness.acceptance_criterion_ids) == 17
    print("PASS first-milestone task and 17-criterion scope")

    packages = {item.work_package_id: item for item in readiness.work_packages}
    assert set(packages) == EXPECTED_TASKS | EXPECTED_ASSURANCE
    assert [item.model_dump(mode="json") for item in readiness.work_packages] == load(
        BASE / "work-packages.json"
    )["work_packages"]
    for package in packages.values():
        assert len(package.owned_locators) == len(set(package.owned_locators))
        assert all(is_safe_locator(locator) for locator in package.owned_locators)
        for dependency_id in package.dependency_work_package_ids:
            assert dependency_id in packages
            assert packages[dependency_id].sequence < package.sequence
    package_list = list(packages.values())
    for index_left, left in enumerate(package_list):
        for right in package_list[index_left + 1 :]:
            assert not any(
                conflicts(left_locator, right_locator)
                for left_locator in left.owned_locators
                for right_locator in right.owned_locators
            )
    print("PASS work-package dependencies and locator ownership: 9 packages")

    interface_ids: set[str] = set()
    for interface in readiness.interface_decisions:
        assert interface.interface_id not in interface_ids
        interface_ids.add(interface.interface_id)
        package = packages[interface.work_package_id]
        assert package.owner_instance_id == interface.owner_instance_id
        assert interface.integration_reference in package.integration_references
    assert interface_ids == {
        item["interface_id"] for item in load(BASE / "interface-decisions.json")["interface_decisions"]
    }
    print("PASS interface ownership and integration bindings: 5 decisions")

    referenced_evidence = []
    for section in (
        readiness.effective_standards,
        readiness.role_skill_independence,
        readiness.trusted_capability,
        readiness.threat_decision,
        readiness.doctor_result,
        readiness.integration_test_plan,
        readiness.rolling_progress,
    ):
        assert section is not None
        referenced_evidence.extend(section.evidence_references)
    assert len({item.artifact_id for item in referenced_evidence}) == len(referenced_evidence)
    by_artifact_id = {
        load(BASE / name)["evidence_id"]: digest
        for name, digest in EXPECTED_EVIDENCE.items()
    }
    for reference in referenced_evidence:
        assert is_safe_locator(reference.locator)
        assert (ROOT / reference.locator).is_file()
        assert by_artifact_id[reference.artifact_id] == reference.sha256
    print("PASS readiness evidence locators, canonical digests, and uniqueness")

    commands = (BASE / "proposed-submit-commands.sh").read_text(encoding="utf-8")
    assert commands.count("./studioctl evidence submit ") == len(EXPECTED_EVIDENCE)
    assert commands.count("./studioctl readiness submit ") == 1
    assert "readiness-foundation-387541159810" in commands
    assert commands.count("./studioctl trust apply ") == 0
    assert "already active in Studio at journal sequence 7" in commands
    print("PASS proposed command order: 13 evidence submissions, then 1 readiness submission")

    report = load(BASE / "validation-report.json")
    assert report["result"] == "valid_revision_required_draft"
    assert report["readiness_identity"]["canonical_sha256"] == EXPECTED_READINESS_DIGEST
    assert len(report["blockers"]) == 2
    report_evidence = {
        item["artifact_id"]: item["sha256"]
        for item in report["evidence_canonical_digests"]
    }
    assert report_evidence == {
        load(BASE / name)["evidence_id"]: digest
        for name, digest in EXPECTED_EVIDENCE.items()
    }
    assert "explicitly authorized initial commit" in report["blockers"][0].lower()
    print("PASS validation report identity, evidence digests, and explicit blockers")


if __name__ == "__main__":
    validate()
