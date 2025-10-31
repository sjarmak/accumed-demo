# Infrastructure Repository - Agent Onboarding Guide

This repository contains Terraform infrastructure-as-code and CI/CD pipeline configurations for the AccuMed platform.

## Repository Structure

- `terraform/` - Infrastructure as code organized by environment
- `pipelines/` - Azure DevOps pipeline YAML definitions
- `modules/` - Reusable Terraform modules
- `scripts/` - Helper scripts for deployment and validation

## Terraform Standards

### Module Organization
- Use consistent module structure: `variables.tf`, `main.tf`, `outputs.tf`
- Keep modules focused on single responsibility
- Document all variables with descriptions and types
- Always specify variable types explicitly (e.g., `string`, `list(string)`, `map(any)`)

### Naming Conventions
- Resources: `<resource_type>_<environment>_<purpose>` (e.g., `rg_prod_api`)
- Variables: Use snake_case for all variables
- Tags: Always include `environment`, `project`, `managed_by` tags
- Environments: `dev`, `staging`, `prod`

### Code Quality
- Run `terraform fmt -recursive` before committing
- Run `terraform validate` to check syntax
- Use `terraform plan` to preview changes before applying
- Never commit `.tfstate` files (use remote backend)
- Store sensitive values in Azure Key Vault, reference via data sources

### Backend Configuration
- Use Azure Storage backend for state files
- Configure state locking with Azure Blob lease
- Separate state files per environment
- Example backend config:
  ```hcl
  terraform {
    backend "azurerm" {
      resource_group_name  = "rg-terraform-state"
      storage_account_name = "sttfstate<env>"
      container_name       = "tfstate"
      key                  = "<workspace>.tfstate"
    }
  }
  ```

### Common Commands
```bash
# Initialize and configure backend
terraform init -backend-config="backend-<env>.hcl"

# Format code
terraform fmt -recursive

# Validate syntax
terraform validate

# Plan changes
terraform plan -var-file="environments/<env>.tfvars" -out=tfplan

# Apply changes
terraform apply tfplan

# Check for security issues (if tfsec is installed)
tfsec .
```

## Azure DevOps Pipeline Standards

### Pipeline Structure
- Use YAML pipelines (not classic UI pipelines)
- Organize pipelines by environment and purpose
- Use templates for reusable pipeline logic
- Store templates in `pipelines/templates/`

### Stages and Jobs
- Separate stages: `validate`, `plan`, `apply`
- Use approval gates for production deployments
- Include manual approval steps before `apply` in prod
- Run validation and planning in PR builds

### Variable Management
- Store secrets in Azure DevOps Library variable groups
- Use variable groups per environment: `infra-dev`, `infra-staging`, `infra-prod`
- Reference secrets from Azure Key Vault when possible
- Never hardcode credentials in pipeline files

### Service Connections
- Use service principals with least privilege
- Separate service connections per environment
- Name format: `azure-<environment>-terraform`

### Example Pipeline Structure
```yaml
trigger:
  branches:
    include:
      - main
  paths:
    include:
      - terraform/**

stages:
  - stage: Validate
    jobs:
      - job: TerraformValidate
        steps:
          - task: TerraformInstaller@0
          - bash: terraform fmt -check -recursive
          - bash: terraform validate

  - stage: Plan
    dependsOn: Validate
    jobs:
      - job: TerraformPlan
        steps:
          - task: TerraformTaskV2@2
            inputs:
              command: plan
              environmentServiceName: 'azure-$(environment)-terraform'

  - stage: Apply
    dependsOn: Plan
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - deployment: TerraformApply
        environment: 'production'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: TerraformTaskV2@2
                  inputs:
                    command: apply
```

## Security Best Practices

- Never commit credentials, API keys, or sensitive data
- Use Azure Key Vault for secret management
- Enable Azure Policy for compliance checking
- Use managed identities where possible instead of service principals
- Implement network security groups and private endpoints
- Enable diagnostic logging for all resources

## Deployment Workflow

1. Create feature branch from `main`
2. Make infrastructure changes in `terraform/`
3. Run `terraform fmt` and `terraform validate` locally
4. Commit and push changes
5. Create pull request - pipeline runs validation and plan
6. Review plan output in PR
7. Merge to `main` after approval
8. Pipeline automatically applies changes with manual gate for prod

## Common Patterns

### Resource Tagging
Always include these tags on Azure resources:
```hcl
tags = {
  environment  = var.environment
  project      = "accumed"
  managed_by   = "terraform"
  owner        = "platform-team"
  cost_center  = var.cost_center
}
```

### Module Usage
```hcl
module "resource_group" {
  source      = "../../modules/resource-group"
  environment = var.environment
  location    = var.location
  project     = "accumed"
}
```

### Data Source References
```hcl
data "azurerm_key_vault_secret" "db_password" {
  name         = "db-password-${var.environment}"
  key_vault_id = data.azurerm_key_vault.main.id
}
```

## Troubleshooting

### State Lock Issues
```bash
# Force unlock if lock is stuck (use with caution)
terraform force-unlock <lock-id>
```

### Import Existing Resources
```bash
# Import existing Azure resource into state
terraform import azurerm_resource_group.example /subscriptions/<sub-id>/resourceGroups/<rg-name>
```

### Destroy Resources (Non-Prod Only)
```bash
# Destroy infrastructure (never run in prod without approval)
terraform destroy -var-file="environments/<env>.tfvars"
```

## Additional Resources

- [Terraform Azure Provider Documentation](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Azure DevOps YAML Schema](https://docs.microsoft.com/azure/devops/pipelines/yaml-schema)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)

## Support

For questions or issues:
- Create a Bead task: `bd create "<description>" -t task -p <priority>`
- Tag with `infrastructure` label
- Assign to platform team
