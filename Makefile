clean: ## Remove package distribution files, caches, and .DS_Store
	find . -type f -name ".DS_Store" | xargs rm -r;
