#!/bin/bash
# Updates the app version in index.html with current commit info

# Get the current commit hash (short) and datetime
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "dev")
COMMIT_DATE=$(git log -1 --format="%ci" 2>/dev/null | sed 's/ /T/' | sed 's/ .*//' || date +"%Y-%m-%dT%H:%M:%S")

VERSION="${COMMIT_HASH}-${COMMIT_DATE}"

# Update the version in index.html
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/data-version=\"[^\"]*\"/data-version=\"${VERSION}\"/" index.html
else
    # Linux/Windows Git Bash
    sed -i "s/data-version=\"[^\"]*\"/data-version=\"${VERSION}\"/" index.html
fi

echo "Updated version to: ${VERSION}"
