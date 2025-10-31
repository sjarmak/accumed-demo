terraform {
  required_version = ">= 1.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "healthcare" {
  name     = var.resource_group_name
  location = var.location
  
  tags = {
    Environment = var.environment
    Project     = "AccuMed Healthcare Platform"
    ManagedBy   = "Terraform"
  }
}

# App Service Plan
resource "azurerm_service_plan" "healthcare" {
  name                = "${var.prefix}-asp-${var.environment}"
  location            = azurerm_resource_group.healthcare.location
  resource_group_name = azurerm_resource_group.healthcare.name
  os_type             = "Linux"
  sku_name            = var.app_service_sku
  
  tags = {
    Environment = var.environment
    Project     = "AccuMed Healthcare Platform"
  }
}

# App Service (Web App)
resource "azurerm_linux_web_app" "healthcare" {
  name                = "${var.prefix}-app-${var.environment}"
  location            = azurerm_resource_group.healthcare.location
  resource_group_name = azurerm_resource_group.healthcare.name
  service_plan_id     = azurerm_service_plan.healthcare.id
  
  site_config {
    always_on = true
    
    application_stack {
      node_version = "18-lts"
    }
  }
  
  app_settings = {
    "WEBSITE_NODE_DEFAULT_VERSION" = "18-lts"
    "DATABASE_HOST"                = azurerm_postgresql_flexible_server.healthcare.fqdn
    "DATABASE_NAME"                = azurerm_postgresql_flexible_server_database.healthcare.name
    "DATABASE_USER"                = var.db_admin_username
    "ENVIRONMENT"                  = var.environment
  }
  
  tags = {
    Environment = var.environment
    Project     = "AccuMed Healthcare Platform"
  }
}

# PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "healthcare" {
  name                   = "${var.prefix}-psql-${var.environment}"
  location               = azurerm_resource_group.healthcare.location
  resource_group_name    = azurerm_resource_group.healthcare.name
  
  administrator_login    = var.db_admin_username
  administrator_password = var.db_admin_password
  
  sku_name               = var.db_sku_name
  version                = "14"
  storage_mb             = var.db_storage_mb
  
  backup_retention_days  = 7
  geo_redundant_backup_enabled = false
  
  tags = {
    Environment = var.environment
    Project     = "AccuMed Healthcare Platform"
  }
}

# PostgreSQL Database
resource "azurerm_postgresql_flexible_server_database" "healthcare" {
  name      = var.db_name
  server_id = azurerm_postgresql_flexible_server.healthcare.id
  collation = "en_US.utf8"
  charset   = "UTF8"
}

# PostgreSQL Firewall Rule - Allow Azure Services
resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.healthcare.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Storage Account for medical records and documents
resource "azurerm_storage_account" "healthcare" {
  name                     = "${var.prefix}st${var.environment}"
  location                 = azurerm_resource_group.healthcare.location
  resource_group_name      = azurerm_resource_group.healthcare.name
  account_tier             = "Standard"
  account_replication_type = "LRS"
  
  blob_properties {
    versioning_enabled = true
  }
  
  tags = {
    Environment = var.environment
    Project     = "AccuMed Healthcare Platform"
  }
}

# Storage Container for medical records
resource "azurerm_storage_container" "medical_records" {
  name                  = "medical-records"
  storage_account_name  = azurerm_storage_account.healthcare.name
  container_access_type = "private"
}

# Application Insights
resource "azurerm_application_insights" "healthcare" {
  name                = "${var.prefix}-ai-${var.environment}"
  location            = azurerm_resource_group.healthcare.location
  resource_group_name = azurerm_resource_group.healthcare.name
  application_type    = "web"
  
  tags = {
    Environment = var.environment
    Project     = "AccuMed Healthcare Platform"
  }
}

# Key Vault for secrets
resource "azurerm_key_vault" "healthcare" {
  name                = "${var.prefix}-kv-${var.environment}"
  location            = azurerm_resource_group.healthcare.location
  resource_group_name = azurerm_resource_group.healthcare.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"
  
  soft_delete_retention_days = 7
  purge_protection_enabled   = false
  
  tags = {
    Environment = var.environment
    Project     = "AccuMed Healthcare Platform"
  }
}

# Data source for current Azure configuration
data "azurerm_client_config" "current" {}

# Outputs
output "app_service_url" {
  value       = "https://${azurerm_linux_web_app.healthcare.default_hostname}"
  description = "The URL of the healthcare application"
}

output "postgresql_fqdn" {
  value       = azurerm_postgresql_flexible_server.healthcare.fqdn
  description = "The FQDN of the PostgreSQL server"
  sensitive   = true
}

output "storage_account_name" {
  value       = azurerm_storage_account.healthcare.name
  description = "The name of the storage account"
}

output "application_insights_key" {
  value       = azurerm_application_insights.healthcare.instrumentation_key
  description = "Application Insights instrumentation key"
  sensitive   = true
}

output "key_vault_uri" {
  value       = azurerm_key_vault.healthcare.vault_uri
  description = "The URI of the Key Vault"
}
