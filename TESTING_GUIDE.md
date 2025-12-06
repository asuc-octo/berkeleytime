# Testing Guide for PR Workflow Changes

## Quick Test Checklist

### ✅ Test 1: With PR Number
1. Push your changes to a branch
2. Create a PR (or use existing PR #)
3. Go to Actions → "Deploy to Development"
4. Enter PR number in the input field
5. Run workflow
6. **Verify:**
   - "Fetch PR Information" job succeeds
   - PR number, author, and title are fetched
   - Deployment includes PR values

### ✅ Test 2: Without PR Number
1. Run workflow again
2. Leave PR number field empty
3. **Verify:**
   - Workflow still runs successfully
   - PR values are empty (not causing errors)

### ✅ Test 3: Verify Kubernetes Labels
After deployment, SSH to the cluster and check:

```bash
# SSH to hozer-51
ssh hozer-51

# Check if labels are set on deployments
kubectl get deployments -n bt -l pr.name=pr-123

# Check specific deployment labels
kubectl get deployment bt-dev-app-abc123-backend -n bt -o jsonpath='{.metadata.labels}' | jq

# Should show:
# {
#   "pr.name": "pr-123",
#   "pr.number": "123",
#   "pr.author": "tayler",
#   "pr.title": "Your PR Title"
# }
```

## Common Issues to Check

### Issue 1: PR Number Not Found
**Symptom:** Workflow fails with "Not Found" error
**Fix:** Make sure PR number exists and is accessible

### Issue 2: Empty Outputs
**Symptom:** PR values are empty even with PR number
**Check:** Look at "Fetch PR Information" job logs
**Fix:** Verify GitHub token has permissions

### Issue 3: Helm Template Error
**Symptom:** Deployment fails with template error
**Check:** Verify `_helpers.tpl` syntax is correct
**Fix:** Check for typos in template (especially `default` vs `deafult`)

## Debugging Commands

### Check Workflow Outputs
In the workflow run, expand "Fetch PR Information" job and check:
- Step outputs should show: `number`, `author`, `title`

### Check Helm Values
In "SSH and Deploy" job, look for the `values:` section in logs.
Should show PR values being passed.

### Check Kubernetes Resources
```bash
# List all resources with PR label
kubectl get all -n bt -l pr.name=pr-123

# Check if pr.name label exists
kubectl get deployments -n bt --show-labels | grep pr.name
```

## Expected Behavior

### With PR Number = 123
- `pr.number`: "123"
- `pr.author`: "username" (from GitHub)
- `pr.title`: "PR Title" (from GitHub)
- `pr.name`: "pr-123" (auto-generated)

### Without PR Number
- `pr.number`: "" (empty)
- `pr.author`: "" (empty)
- `pr.title`: "" (empty)
- `pr.name`: "" (empty, not set due to conditional)

## Success Criteria

✅ Workflow runs successfully with PR number  
✅ Workflow runs successfully without PR number  
✅ PR info is correctly fetched from GitHub API  
✅ PR labels are set on Kubernetes resources  
✅ No template errors in Helm deployment

