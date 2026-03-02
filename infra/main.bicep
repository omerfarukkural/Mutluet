@description('Location for compute resources (App Service, PostgreSQL, Storage)')
param location string = resourceGroup().location

@description('Location for Static Web App (must be: westeurope, eastus2, westus2, centralus, eastasia)')
param swaLocation string = 'westeurope'

@description('Environment name (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environmentName string = 'dev'

@description('JWT Secret for authentication')
@secure()
param jwtSecret string

@description('Database admin password')
@secure()
param dbPassword string

var prefix = 'mutluet-${environmentName}'

// ── PostgreSQL Flexible Server ────────────────────────────────
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: '${prefix}-db'
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: 'mutluetadmin'
    administratorLoginPassword: dbPassword
    version: '16'
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

resource postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = {
  parent: postgresServer
  name: 'mutluet'
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

resource postgresFirewallRule 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-03-01-preview' = {
  parent: postgresServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// ── App Service Plan ──────────────────────────────────────────
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '${prefix}-plan'
  location: location
  kind: 'linux'
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: true
  }
}

// ── Backend App Service ───────────────────────────────────────
resource backendApp 'Microsoft.Web/sites@2023-01-01' = {
  name: '${prefix}-backend'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appSettings: [
        {
          name: 'DATABASE_URL'
          value: 'postgresql://mutluetadmin:${dbPassword}@${postgresServer.properties.fullyQualifiedDomainName}:5432/mutluet?sslmode=require'
        }
        {
          name: 'JWT_SECRET'
          value: jwtSecret
        }
        {
          name: 'JWT_EXPIRES_IN'
          value: '7d'
        }
        {
          name: 'PORT'
          value: '3001'
        }
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'FRONTEND_URL'
          value: 'https://${staticWebApp.properties.defaultHostname}'
        }
        {
          name: 'WEBSITES_PORT'
          value: '3001'
        }
      ]
      healthCheckPath: '/health'
    }
    httpsOnly: true
  }
}

// ── Azure Static Web App (Frontend) ──────────────────────────
// Static Web Apps are only available in specific regions — swaLocation is used here
resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: '${prefix}-frontend'
  location: swaLocation
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    repositoryUrl: 'https://github.com/omerfarukkural/Mutluet'
    branch: 'main'
    buildProperties: {
      appLocation: '/'
      outputLocation: 'dist'
    }
  }
}

// ── Storage Account ───────────────────────────────────────────
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: replace('${prefix}storage', '-', '')
  location: location
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    accessTier: 'Hot'
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    supportsHttpsTrafficOnly: true
  }
}

resource blobContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  name: '${storageAccount.name}/default/uploads'
  properties: {
    publicAccess: 'None'
  }
}

// ── Azure Communication Services ──────────────────────────────
resource communicationService 'Microsoft.Communication/communicationServices@2023-04-01' = {
  name: '${prefix}-comms'
  location: 'global'
  properties: {
    dataLocation: 'Europe'
  }
}

// ── Outputs ───────────────────────────────────────────────────
output backendUrl string = 'https://${backendApp.properties.defaultHostName}'
output frontendUrl string = 'https://${staticWebApp.properties.defaultHostname}'
output storageAccountName string = storageAccount.name
output postgresHostname string = postgresServer.properties.fullyQualifiedDomainName
