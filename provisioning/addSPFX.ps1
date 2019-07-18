# Configuración de tenant - sitio - login y listas a aplicar el template #
$dCred = Get-Credential -credential "HRamirez@hjrteco.onmicrosoft.com"
$dTenant = "hjrteco"
$dSite = "GCC2"
$dPaquete = ".\sharepoint\solution\gcc-app.sppkp"

# Me conecto al sitio #
$dConn = Connect-PnPOnline –Url ("https://" + $dTenant + ".sharepoint.com/sites/" + $dSite) –Credentials $dCred

# Subo y publico la aplicación en SPFX #
Add-PnPApp -Path $dPaquete -Publish -Connection $dConn