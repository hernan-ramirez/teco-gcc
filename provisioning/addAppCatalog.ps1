$tenant = "mi-tenant"
$sitio = "mi-sitio"

Connect-SPOService -Url "https://" + $tenant + "-admin.sharepoint.com" -Credential Get-Credential

$site = Get-SPOSite "https://" + $tenant + ".sharepoint.com/sites/" + $sitio

Add-SPOSiteCollectionAppCatalog -Site $site