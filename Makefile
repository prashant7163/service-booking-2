.PHONY: verify up down verification-receiver e2e release repro-check
verify:
	cd backend && ./mvnw -q clean verify
	docker compose config --quiet
up:
	docker compose up --build
down:
	docker compose down
verification-receiver:
	@echo "Synthetic verification/reset credentials follow; keep this terminal private. Stop with Ctrl-C."
	@while true; do printf 'HTTP/1.1 204 No Content\r\nContent-Length: 0\r\n\r\n' | nc -l 8081; done
e2e:
	@test -f e2e/package.json || { echo "Browser acceptance is delivered by the later acceptance task."; exit 1; }
	cd e2e && npm test
release:
	@test -f scripts/release/build-release.sh || { echo "Release tooling is delivered by the later release task."; exit 1; }
	./scripts/release/build-release.sh
repro-check:
	@test -f scripts/release/verify-reproducibility.sh || { echo "Reproducibility tooling is delivered by the later release task."; exit 1; }
	./scripts/release/verify-reproducibility.sh
