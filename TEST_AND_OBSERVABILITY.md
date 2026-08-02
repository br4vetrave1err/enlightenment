# Application Testing and Observability Specification

## Overview
This document outlines the testing architecture, quality gates, and high-precision observability design for the PR Reviewer Agent application.

## 1. Observability Architecture (High-Precision JSON Logging)

### Core Logging Infrastructure
- JsonFormatter: Formats all log records into single-line JSON with standard fields (ts, level, service, event) and structured extra context. Automatic redaction masks sensitive keys.
- HealthzFilter: Intercepts GET /healthz container liveness probes. Individual 10s probe lines are suppressed, emitting a single summary event (healthz_summary) every 15 minutes.

### Per-Service Structured Log Event Catalogue
- Webhook Handler: webhook_received, webhook_ignored
- Webhook Registrar & ngrok: ngrok_url_acquired, ngrok_reconcile, ngrok_error
- GitHub Client: github_request, github_rate_limited
- Workspace Runner: opencode_spawn, opencode_exit, opencode_parse_fallback, opencode_parse_ok
- CI Gate Monitor: ci_gate_waiting, ci_gate_resolved
- Queue & Worker: job_enqueued, job_dedup_hit, job_started, job_completed
- Security Scanner: gitleaks_run, llm_security_review
- Trigger Filter: trigger_decision

## 2. Testing Framework & Quality Gates

### Multi-Level Test Strategy (V-Model Aligned)
1. Unit Tests (tests/unit/): Isolated tests for JsonFormatter, HealthzFilter, TriggerDecisionEngine, QueueManager, WorkspaceRunner, etc.
2. Integration Tests (tests/integration/): Validates component interactions such as GET /healthz log throttling.
3. System Tests (tests/system/): End-to-end execution testing.
4. Acceptance Tests (tests/acceptance/): User story acceptance criteria validation.

### Verification
All 93 tests run green via pytest.
