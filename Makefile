.PHONY: build up down

# The following commands control the docker compose component of the stack.

# Builds the cluster, particularly the search component.
build:
	docker-compose -f build/docker-compose.yml build

# Up brings the cluster up by booting a redis, postgres, and server.
up:
	docker-compose -f build/docker-compose.yml up --build
	
# Down removes the existing cluster. Make sure you kill your cluster with down!
down:
	docker-compose -f build/docker-compose.yml down

# Minimal makefile for Sphinx documentation

SPHINXOPTS    ?=
SPHINXBUILD   ?= sphinx-build
SOURCEDIR     = .
BUILDDIR      = _build

# Put it first so that "make" without argument is like "make help".
help:
	@$(SPHINXBUILD) -M help "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

.PHONY: help Makefile

# Catch-all target: route all unknown targets to Sphinx using the new
# "make mode" option.  $(O) is meant as a shortcut for $(SPHINXOPTS).
%: Makefile
	@$(SPHINXBUILD) -M $@ "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)